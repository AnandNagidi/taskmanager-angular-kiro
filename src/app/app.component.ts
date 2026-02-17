import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { TaskService } from './services/task.service';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { Task, CreateTaskRequest, UpdateTaskRequest } from './models/task.model';

/**
 * Main application component that orchestrates task management
 * Handles all CRUD operations and manages component state
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, TaskListComponent],
  template: `
    <div class="container">
      <header class="app-header">
        <h1>🎯 Task Tracker</h1>
        <p>Manage your tasks efficiently with Angular 18</p>
      </header>

      <!-- Task Form -->
      <app-task-form
        [task]="editingTask"
        [isSubmitting]="isSubmitting"
        (taskSubmit)="onTaskSubmit($event)"
        (cancel)="onCancelEdit()"
      ></app-task-form>

      <!-- Loading Indicator -->
      <div *ngIf="isLoading" class="loading-indicator">
        <p>Loading tasks...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="error-alert">
        <p>{{ errorMessage }}</p>
        <button class="btn btn-primary" (click)="clearError()">Dismiss</button>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="success-alert">
        <p>{{ successMessage }}</p>
      </div>

      <!-- Task List -->
      <app-task-list
        [tasks]="tasks"
        [isLoading]="isLoading"
        (toggleComplete)="onToggleComplete($event)"
        (editTask)="onEditTask($event)"
        (deleteTask)="onDeleteTask($event)"
      ></app-task-list>
    </div>
  `,
  styles: [`
    .app-header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px 0;
    }

    .app-header h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 2.5rem;
    }

    .app-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .loading-indicator {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .error-alert {
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .success-alert {
      background: #d4edda;
      color: #155724;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      animation: fadeOut 3s ease-in-out forwards;
    }

    @keyframes fadeOut {
      0%, 70% { opacity: 1; }
      100% { opacity: 0; }
    }

    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }

      .app-header h1 {
        font-size: 2rem;
      }

      .error-alert {
        flex-direction: column;
        gap: 10px;
        text-align: center;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  editingTask: Task | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all tasks from the service
   */
  private loadTasks(): void {
    this.isLoading = true;
    this.clearMessages();

    this.taskService.getTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError('Failed to load tasks', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Handle task form submission (create or update)
   * @param taskData - Task data from form
   */
  onTaskSubmit(taskData: CreateTaskRequest | UpdateTaskRequest): void {
    this.isSubmitting = true;
    this.clearMessages();

    if (this.editingTask) {
      // Update existing task
      this.taskService.updateTask(this.editingTask.id, taskData as UpdateTaskRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedTask) => {
            this.showSuccess(`Task "${updatedTask.title}" updated successfully!`);
            this.editingTask = null;
            this.isSubmitting = false;
          },
          error: (error) => {
            this.handleError('Failed to update task', error);
            this.isSubmitting = false;
          }
        });
    } else {
      // Create new task
      this.taskService.createTask(taskData as CreateTaskRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newTask) => {
            this.showSuccess(`Task "${newTask.title}" created successfully!`);
            this.isSubmitting = false;
          },
          error: (error) => {
            this.handleError('Failed to create task', error);
            this.isSubmitting = false;
          }
        });
    }
  }

  /**
   * Handle task completion toggle
   * @param taskId - ID of task to toggle
   */
  onToggleComplete(taskId: string): void {
    this.clearMessages();

    this.taskService.toggleTaskCompletion(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTask) => {
          const status = updatedTask.completed ? 'completed' : 'pending';
          this.showSuccess(`Task marked as ${status}!`);
        },
        error: (error) => {
          this.handleError('Failed to update task status', error);
        }
      });
  }

  /**
   * Handle task edit request
   * @param task - Task to edit
   */
  onEditTask(task: Task): void {
    this.editingTask = task;
    this.clearMessages();
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Handle task deletion
   * @param taskId - ID of task to delete
   */
  onDeleteTask(taskId: string): void {
    this.clearMessages();

    this.taskService.deleteTask(taskId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Task deleted successfully!');
          // Cancel edit if we're editing the deleted task
          if (this.editingTask?.id === taskId) {
            this.editingTask = null;
          }
        },
        error: (error) => {
          this.handleError('Failed to delete task', error);
        }
      });
  }

  /**
   * Cancel task editing
   */
  onCancelEdit(): void {
    this.editingTask = null;
    this.clearMessages();
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage = '';
  }

  /**
   * Clear all messages
   */
  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Show success message
   * @param message - Success message to display
   */
  private showSuccess(message: string): void {
    this.successMessage = message;
    // Auto-clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Handle and display error messages
   * @param message - User-friendly error message
   * @param error - Original error object
   */
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = error?.message || message;
  }
}
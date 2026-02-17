import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

/**
 * Task list component for displaying and managing tasks
 * Provides actions for completing, editing, and deleting tasks
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="list-header">
        <h3>Tasks ({{ tasks.length }})</h3>
        
        <div class="filter-buttons">
          <button
            class="btn"
            [class.btn-primary]="currentFilter === 'all'"
            [class.btn-secondary]="currentFilter !== 'all'"
            (click)="onFilterChange('all')"
          >
            All ({{ tasks.length }})
          </button>
          
          <button
            class="btn"
            [class.btn-primary]="currentFilter === 'pending'"
            [class.btn-secondary]="currentFilter !== 'pending'"
            (click)="onFilterChange('pending')"
          >
            Pending ({{ pendingCount }})
          </button>
          
          <button
            class="btn"
            [class.btn-primary]="currentFilter === 'completed'"
            [class.btn-secondary]="currentFilter !== 'completed'"
            (click)="onFilterChange('completed')"
          >
            Completed ({{ completedCount }})
          </button>
        </div>
      </div>

      <div *ngIf="filteredTasks.length === 0" class="empty-state">
        <p>{{ getEmptyMessage() }}</p>
      </div>

      <div *ngFor="let task of filteredTasks; trackBy: trackByTaskId" class="task-item" [class.completed]="task.completed">
        <div class="task-content">
          <h4>{{ task.title }}</h4>
          <p *ngIf="task.description" class="task-description">{{ task.description }}</p>
          <small class="task-meta">
            Created: {{ task.createdAt | date:'short' }}
            <span *ngIf="task.updatedAt !== task.createdAt">
              | Updated: {{ task.updatedAt | date:'short' }}
            </span>
          </small>
        </div>

        <div class="task-actions">
          <button
            class="btn"
            [class.btn-success]="!task.completed"
            [class.btn-secondary]="task.completed"
            (click)="onToggleComplete(task.id)"
            [disabled]="isLoading"
            [title]="task.completed ? 'Mark as pending' : 'Mark as completed'"
          >
            {{ task.completed ? 'Undo' : 'Complete' }}
          </button>

          <button
            class="btn btn-primary"
            (click)="onEdit(task)"
            [disabled]="isLoading"
            title="Edit task"
          >
            Edit
          </button>

          <button
            class="btn btn-danger"
            (click)="onDelete(task.id, task.title)"
            [disabled]="isLoading"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }

    .filter-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-buttons .btn {
      padding: 8px 16px;
      font-size: 12px;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .task-content {
      flex: 1;
    }

    .task-content h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .task-description {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .task-meta {
      color: #999;
      font-size: 12px;
    }

    .task-actions .btn {
      padding: 6px 12px;
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .list-header {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-buttons {
        justify-content: center;
      }

      .task-item {
        flex-direction: column;
        gap: 15px;
      }

      .task-actions {
        justify-content: center;
      }
    }
  `]
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Input() isLoading = false;
  @Output() toggleComplete = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();

  currentFilter: 'all' | 'pending' | 'completed' = 'all';

  get filteredTasks(): Task[] {
    switch (this.currentFilter) {
      case 'pending':
        return this.tasks.filter(task => !task.completed);
      case 'completed':
        return this.tasks.filter(task => task.completed);
      default:
        return this.tasks;
    }
  }

  get pendingCount(): number {
    return this.tasks.filter(task => !task.completed).length;
  }

  get completedCount(): number {
    return this.tasks.filter(task => task.completed).length;
  }

  /**
   * Handle filter change
   * @param filter - New filter to apply
   */
  onFilterChange(filter: 'all' | 'pending' | 'completed'): void {
    this.currentFilter = filter;
  }

  /**
   * Handle task completion toggle
   * @param taskId - ID of task to toggle
   */
  onToggleComplete(taskId: string): void {
    this.toggleComplete.emit(taskId);
  }

  /**
   * Handle task edit request
   * @param task - Task to edit
   */
  onEdit(task: Task): void {
    this.editTask.emit(task);
  }

  /**
   * Handle task deletion with confirmation
   * @param taskId - ID of task to delete
   * @param taskTitle - Title of task for confirmation
   */
  onDelete(taskId: string, taskTitle: string): void {
    if (confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      this.deleteTask.emit(taskId);
    }
  }

  /**
   * Get appropriate empty state message based on current filter
   * @returns string - Empty state message
   */
  getEmptyMessage(): string {
    switch (this.currentFilter) {
      case 'pending':
        return 'No pending tasks. Great job!';
      case 'completed':
        return 'No completed tasks yet.';
      default:
        return 'No tasks yet. Add your first task above!';
    }
  }

  /**
   * Track by function for ngFor optimization
   * @param index - Item index
   * @param task - Task item
   * @returns string - Unique identifier
   */
  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}
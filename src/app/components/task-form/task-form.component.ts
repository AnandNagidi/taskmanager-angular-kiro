import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';

/**
 * Task form component for creating and editing tasks
 * Supports both create and edit modes based on input task
 */
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h3>{{ isEditMode ? 'Edit Task' : 'Add New Task' }}</h3>
      
      <form (ngSubmit)="onSubmit()" #taskForm="ngForm">
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            class="form-control"
            [(ngModel)]="formData.title"
            required
            #titleInput="ngModel"
            placeholder="Enter task title"
          />
          <div *ngIf="titleInput.invalid && titleInput.touched" class="error-message">
            Title is required
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            name="description"
            class="form-control"
            [(ngModel)]="formData.description"
            rows="3"
            placeholder="Enter task description (optional)"
          ></textarea>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="taskForm.invalid || isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Task' : 'Add Task') }}
          </button>
          
          <button
            type="button"
            class="btn btn-secondary"
            (click)="onCancel()"
            [disabled]="isSubmitting"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #545b62;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }
  `]
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() isSubmitting = false;
  @Output() taskSubmit = new EventEmitter<CreateTaskRequest | UpdateTaskRequest>();
  @Output() cancel = new EventEmitter<void>();

  formData = {
    title: '',
    description: ''
  };

  get isEditMode(): boolean {
    return this.task !== null;
  }

  ngOnInit(): void {
    // Initialize form data with task data if in edit mode
    if (this.task) {
      this.formData = {
        title: this.task.title,
        description: this.task.description
      };
    }
  }

  /**
   * Handle form submission
   * Emits the form data to parent component
   */
  onSubmit(): void {
    if (this.formData.title.trim()) {
      const taskData = {
        title: this.formData.title.trim(),
        description: this.formData.description.trim()
      };
      
      this.taskSubmit.emit(taskData);
    }
  }

  /**
   * Handle form cancellation
   * Resets form and emits cancel event
   */
  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.formData = {
      title: '',
      description: ''
    };
  }
}
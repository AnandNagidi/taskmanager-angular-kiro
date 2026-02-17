import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';

/**
 * Task service implementing CRUD operations with async methods and dependency injection
 * Uses in-memory storage to simulate a backend API
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [];
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private nextId = 1;

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  /**
   * Get all tasks as an observable
   * @returns Observable<Task[]> - Stream of all tasks
   */
  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable().pipe(
      delay(100) // Simulate network delay
    );
  }

  /**
   * Get a specific task by ID
   * @param id - Task ID to retrieve
   * @returns Observable<Task | null> - The task or null if not found
   */
  getTaskById(id: string): Observable<Task | null> {
    const task = this.tasks.find(t => t.id === id);
    return of(task || null).pipe(
      delay(50) // Simulate network delay
    );
  }

  /**
   * Create a new task
   * @param taskData - Data for creating the new task
   * @returns Observable<Task> - The created task
   */
  createTask(taskData: CreateTaskRequest): Observable<Task> {
    if (!taskData.title.trim()) {
      return throwError(() => new Error('Task title is required'));
    }

    const newTask: Task = {
      id: this.generateId(),
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasks.push(newTask);
    this.tasksSubject.next([...this.tasks]);

    return of(newTask).pipe(
      delay(100) // Simulate network delay
    );
  }

  /**
   * Update an existing task
   * @param id - ID of the task to update
   * @param updates - Partial task data to update
   * @returns Observable<Task> - The updated task
   */
  updateTask(id: string, updates: UpdateTaskRequest): Observable<Task> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return throwError(() => new Error(`Task with ID ${id} not found`));
    }

    if (updates.title !== undefined && !updates.title.trim()) {
      return throwError(() => new Error('Task title cannot be empty'));
    }

    const existingTask = this.tasks[taskIndex];
    const updatedTask: Task = {
      ...existingTask,
      ...updates,
      title: updates.title?.trim() || existingTask.title,
      description: updates.description?.trim() || existingTask.description,
      updatedAt: new Date()
    };

    this.tasks[taskIndex] = updatedTask;
    this.tasksSubject.next([...this.tasks]);

    return of(updatedTask).pipe(
      delay(100) // Simulate network delay
    );
  }

  /**
   * Delete a task by ID
   * @param id - ID of the task to delete
   * @returns Observable<boolean> - Success status
   */
  deleteTask(id: string): Observable<boolean> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return throwError(() => new Error(`Task with ID ${id} not found`));
    }

    this.tasks.splice(taskIndex, 1);
    this.tasksSubject.next([...this.tasks]);

    return of(true).pipe(
      delay(100) // Simulate network delay
    );
  }

  /**
   * Toggle task completion status
   * @param id - ID of the task to toggle
   * @returns Observable<Task> - The updated task
   */
  toggleTaskCompletion(id: string): Observable<Task> {
    const task = this.tasks.find(t => t.id === id);
    
    if (!task) {
      return throwError(() => new Error(`Task with ID ${id} not found`));
    }

    return this.updateTask(id, { completed: !task.completed });
  }

  /**
   * Get tasks filtered by completion status
   * @param completed - Filter by completion status
   * @returns Observable<Task[]> - Filtered tasks
   */
  getTasksByStatus(completed: boolean): Observable<Task[]> {
    return this.getTasks().pipe(
      map(tasks => tasks.filter(task => task.completed === completed))
    );
  }

  /**
   * Generate a unique ID for new tasks
   * @returns string - Unique task ID
   */
  private generateId(): string {
    return `task_${this.nextId++}_${Date.now()}`;
  }

  /**
   * Initialize the service with sample data
   */
  private initializeSampleData(): void {
    const sampleTasks: CreateTaskRequest[] = [
      {
        title: 'Learn Angular 18',
        description: 'Study the new features and improvements in Angular 18'
      },
      {
        title: 'Build Task Tracker',
        description: 'Create a simple task management application'
      },
      {
        title: 'Write Unit Tests',
        description: 'Add comprehensive test coverage for all components'
      }
    ];

    sampleTasks.forEach(taskData => {
      this.createTask(taskData).subscribe();
    });
  }
}
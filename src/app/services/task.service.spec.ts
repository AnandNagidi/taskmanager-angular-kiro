import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should return an observable of tasks', (done) => {
      service.getTasks().subscribe(tasks => {
        expect(Array.isArray(tasks)).toBeTruthy();
        expect(tasks.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should return tasks with sample data on initialization', (done) => {
      service.getTasks().subscribe(tasks => {
        expect(tasks.length).toBe(3);
        expect(tasks[0].title).toBe('Learn Angular 18');
        done();
      });
    });
  });

  describe('getTaskById', () => {
    it('should return a task when valid ID is provided', (done) => {
      service.getTasks().subscribe(tasks => {
        const firstTask = tasks[0];
        service.getTaskById(firstTask.id).subscribe(task => {
          expect(task).toBeTruthy();
          expect(task?.id).toBe(firstTask.id);
          done();
        });
      });
    });

    it('should return null when invalid ID is provided', (done) => {
      service.getTaskById('invalid-id').subscribe(task => {
        expect(task).toBeNull();
        done();
      });
    });
  });

  describe('createTask', () => {
    it('should create a new task with valid data', (done) => {
      const taskData: CreateTaskRequest = {
        title: 'Test Task',
        description: 'Test Description'
      };

      service.createTask(taskData).subscribe(newTask => {
        expect(newTask).toBeTruthy();
        expect(newTask.title).toBe(taskData.title);
        expect(newTask.description).toBe(taskData.description);
        expect(newTask.completed).toBeFalse();
        expect(newTask.id).toBeTruthy();
        expect(newTask.createdAt).toBeInstanceOf(Date);
        expect(newTask.updatedAt).toBeInstanceOf(Date);
        done();
      });
    });

    it('should trim whitespace from title and description', (done) => {
      const taskData: CreateTaskRequest = {
        title: '  Test Task  ',
        description: '  Test Description  '
      };

      service.createTask(taskData).subscribe(newTask => {
        expect(newTask.title).toBe('Test Task');
        expect(newTask.description).toBe('Test Description');
        done();
      });
    });

    it('should throw error when title is empty', (done) => {
      const taskData: CreateTaskRequest = {
        title: '',
        description: 'Test Description'
      };

      service.createTask(taskData).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Task title is required');
          done();
        }
      });
    });

    it('should throw error when title is only whitespace', (done) => {
      const taskData: CreateTaskRequest = {
        title: '   ',
        description: 'Test Description'
      };

      service.createTask(taskData).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Task title is required');
          done();
        }
      });
    });
  });

  describe('updateTask', () => {
    let existingTaskId: string;

    beforeEach((done) => {
      service.getTasks().subscribe(tasks => {
        existingTaskId = tasks[0].id;
        done();
      });
    });

    it('should update an existing task', (done) => {
      const updates: UpdateTaskRequest = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      service.updateTask(existingTaskId, updates).subscribe(updatedTask => {
        expect(updatedTask.title).toBe(updates.title);
        expect(updatedTask.description).toBe(updates.description);
        expect(updatedTask.updatedAt).toBeInstanceOf(Date);
        done();
      });
    });

    it('should update only specified fields', (done) => {
      const updates: UpdateTaskRequest = {
        title: 'Only Title Updated'
      };

      service.updateTask(existingTaskId, updates).subscribe(updatedTask => {
        expect(updatedTask.title).toBe(updates.title);
        // Description should remain unchanged
        expect(updatedTask.description).toBeTruthy();
        done();
      });
    });

    it('should throw error when task not found', (done) => {
      const updates: UpdateTaskRequest = {
        title: 'Updated Title'
      };

      service.updateTask('invalid-id', updates).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        }
      });
    });

    it('should throw error when title is empty', (done) => {
      const updates: UpdateTaskRequest = {
        title: ''
      };

      service.updateTask(existingTaskId, updates).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Task title cannot be empty');
          done();
        }
      });
    });
  });

  describe('deleteTask', () => {
    let existingTaskId: string;

    beforeEach((done) => {
      service.getTasks().subscribe(tasks => {
        existingTaskId = tasks[0].id;
        done();
      });
    });

    it('should delete an existing task', (done) => {
      service.deleteTask(existingTaskId).subscribe(result => {
        expect(result).toBeTrue();
        
        // Verify task is removed from list
        service.getTasks().subscribe(tasks => {
          const deletedTask = tasks.find(t => t.id === existingTaskId);
          expect(deletedTask).toBeUndefined();
          done();
        });
      });
    });

    it('should throw error when task not found', (done) => {
      service.deleteTask('invalid-id').subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        }
      });
    });
  });

  describe('toggleTaskCompletion', () => {
    let existingTaskId: string;

    beforeEach((done) => {
      service.getTasks().subscribe(tasks => {
        existingTaskId = tasks[0].id;
        done();
      });
    });

    it('should toggle task completion status', (done) => {
      service.getTaskById(existingTaskId).subscribe(originalTask => {
        const originalStatus = originalTask!.completed;
        
        service.toggleTaskCompletion(existingTaskId).subscribe(updatedTask => {
          expect(updatedTask.completed).toBe(!originalStatus);
          done();
        });
      });
    });

    it('should throw error when task not found', (done) => {
      service.toggleTaskCompletion('invalid-id').subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        }
      });
    });
  });

  describe('getTasksByStatus', () => {
    beforeEach((done) => {
      // Create a completed task for testing
      const taskData: CreateTaskRequest = {
        title: 'Completed Task',
        description: 'This will be completed'
      };

      service.createTask(taskData).subscribe(newTask => {
        service.toggleTaskCompletion(newTask.id).subscribe(() => {
          done();
        });
      });
    });

    it('should return only pending tasks', (done) => {
      service.getTasksByStatus(false).subscribe(pendingTasks => {
        expect(pendingTasks.every(task => !task.completed)).toBeTrue();
        done();
      });
    });

    it('should return only completed tasks', (done) => {
      service.getTasksByStatus(true).subscribe(completedTasks => {
        expect(completedTasks.every(task => task.completed)).toBeTrue();
        expect(completedTasks.length).toBeGreaterThan(0);
        done();
      });
    });
  });
});
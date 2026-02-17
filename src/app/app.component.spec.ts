import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { TaskService } from './services/task.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from './models/task.model';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Description 2',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'deleteTask',
      'toggleTaskCompletion'
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockTaskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;

    // Default mock behavior
    mockTaskService.getTasks.and.returnValue(of(mockTasks));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load tasks on init', () => {
      fixture.detectChanges(); // This triggers ngOnInit
      
      expect(mockTaskService.getTasks).toHaveBeenCalled();
      expect(component.tasks).toEqual(mockTasks);
      expect(component.isLoading).toBeFalse();
    });

    it('should handle error when loading tasks fails', () => {
      const errorMessage = 'Failed to load tasks';
      mockTaskService.getTasks.and.returnValue(throwError(() => new Error(errorMessage)));
      
      fixture.detectChanges();
      
      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('Task Creation', () => {
    it('should create a new task successfully', () => {
      const taskData: CreateTaskRequest = {
        title: 'New Task',
        description: 'New Description'
      };
      const newTask: Task = {
        id: '3',
        ...taskData,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockTaskService.createTask.and.returnValue(of(newTask));
      
      component.onTaskSubmit(taskData);
      
      expect(mockTaskService.createTask).toHaveBeenCalledWith(taskData);
      expect(component.successMessage).toContain('created successfully');
      expect(component.isSubmitting).toBeFalse();
    });

    it('should handle error when task creation fails', () => {
      const taskData: CreateTaskRequest = {
        title: 'New Task',
        description: 'New Description'
      };
      const errorMessage = 'Failed to create task';
      
      mockTaskService.createTask.and.returnValue(throwError(() => new Error(errorMessage)));
      
      component.onTaskSubmit(taskData);
      
      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isSubmitting).toBeFalse();
    });
  });

  describe('Task Update', () => {
    beforeEach(() => {
      component.editingTask = mockTasks[0];
    });

    it('should update an existing task successfully', () => {
      const updateData: UpdateTaskRequest = {
        title: 'Updated Task',
        description: 'Updated Description'
      };
      const updatedTask: Task = {
        ...mockTasks[0],
        ...updateData,
        updatedAt: new Date()
      };

      mockTaskService.updateTask.and.returnValue(of(updatedTask));
      
      component.onTaskSubmit(updateData);
      
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(mockTasks[0].id, updateData);
      expect(component.successMessage).toContain('updated successfully');
      expect(component.editingTask).toBeNull();
      expect(component.isSubmitting).toBeFalse();
    });

    it('should handle error when task update fails', () => {
      const updateData: UpdateTaskRequest = {
        title: 'Updated Task'
      };
      const errorMessage = 'Failed to update task';
      
      mockTaskService.updateTask.and.returnValue(throwError(() => new Error(errorMessage)));
      
      component.onTaskSubmit(updateData);
      
      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isSubmitting).toBeFalse();
    });
  });

  describe('Task Completion Toggle', () => {
    it('should toggle task completion successfully', () => {
      const updatedTask: Task = {
        ...mockTasks[0],
        completed: !mockTasks[0].completed,
        updatedAt: new Date()
      };

      mockTaskService.toggleTaskCompletion.and.returnValue(of(updatedTask));
      
      component.onToggleComplete(mockTasks[0].id);
      
      expect(mockTaskService.toggleTaskCompletion).toHaveBeenCalledWith(mockTasks[0].id);
      expect(component.successMessage).toContain('marked as');
    });

    it('should handle error when toggle fails', () => {
      const errorMessage = 'Failed to update task status';
      
      mockTaskService.toggleTaskCompletion.and.returnValue(throwError(() => new Error(errorMessage)));
      
      component.onToggleComplete(mockTasks[0].id);
      
      expect(component.errorMessage).toBe(errorMessage);
    });
  });

  describe('Task Deletion', () => {
    it('should delete task successfully', () => {
      mockTaskService.deleteTask.and.returnValue(of(true));
      
      component.onDeleteTask(mockTasks[0].id);
      
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(mockTasks[0].id);
      expect(component.successMessage).toContain('deleted successfully');
    });

    it('should clear editing task if deleted task was being edited', () => {
      component.editingTask = mockTasks[0];
      mockTaskService.deleteTask.and.returnValue(of(true));
      
      component.onDeleteTask(mockTasks[0].id);
      
      expect(component.editingTask).toBeNull();
    });

    it('should handle error when deletion fails', () => {
      const errorMessage = 'Failed to delete task';
      
      mockTaskService.deleteTask.and.returnValue(throwError(() => new Error(errorMessage)));
      
      component.onDeleteTask(mockTasks[0].id);
      
      expect(component.errorMessage).toBe(errorMessage);
    });
  });

  describe('Task Editing', () => {
    it('should set editing task', () => {
      component.onEditTask(mockTasks[0]);
      
      expect(component.editingTask).toBe(mockTasks[0]);
    });

    it('should clear messages when editing', () => {
      component.errorMessage = 'Some error';
      component.successMessage = 'Some success';
      
      component.onEditTask(mockTasks[0]);
      
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });

    it('should cancel editing', () => {
      component.editingTask = mockTasks[0];
      component.errorMessage = 'Some error';
      
      component.onCancelEdit();
      
      expect(component.editingTask).toBeNull();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Message Handling', () => {
    it('should clear error message', () => {
      component.errorMessage = 'Some error';
      
      component.clearError();
      
      expect(component.errorMessage).toBe('');
    });

    it('should auto-clear success message after timeout', (done) => {
      component['showSuccess']('Test success');
      
      expect(component.successMessage).toBe('Test success');
      
      setTimeout(() => {
        expect(component.successMessage).toBe('');
        done();
      }, 3100); // Slightly more than 3 seconds
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display app title', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('h1');
      expect(title.textContent).toContain('Task Tracker');
    });

    it('should show loading indicator when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const loadingIndicator = compiled.querySelector('.loading-indicator');
      expect(loadingIndicator).toBeTruthy();
    });

    it('should show error alert when there is an error', () => {
      component.errorMessage = 'Test error';
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const errorAlert = compiled.querySelector('.error-alert');
      expect(errorAlert).toBeTruthy();
      expect(errorAlert.textContent).toContain('Test error');
    });

    it('should show success alert when there is a success message', () => {
      component.successMessage = 'Test success';
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const successAlert = compiled.querySelector('.success-alert');
      expect(successAlert).toBeTruthy();
      expect(successAlert.textContent).toContain('Test success');
    });

    it('should render task form component', () => {
      const compiled = fixture.nativeElement;
      const taskForm = compiled.querySelector('app-task-form');
      expect(taskForm).toBeTruthy();
    });

    it('should render task list component', () => {
      const compiled = fixture.nativeElement;
      const taskList = compiled.querySelector('app-task-list');
      expect(taskList).toBeTruthy();
    });
  });
});
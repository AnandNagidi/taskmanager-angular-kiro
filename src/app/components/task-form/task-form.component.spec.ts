import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TaskFormComponent } from './task-form.component';
import { Task } from '../../models/task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with empty form data', () => {
      expect(component.formData.title).toBe('');
      expect(component.formData.description).toBe('');
    });

    it('should be in create mode by default', () => {
      expect(component.isEditMode).toBeFalse();
    });

    it('should populate form data when task is provided', () => {
      const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      component.task = mockTask;
      component.ngOnInit();

      expect(component.formData.title).toBe(mockTask.title);
      expect(component.formData.description).toBe(mockTask.description);
      expect(component.isEditMode).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    it('should emit taskSubmit event with form data when valid', () => {
      spyOn(component.taskSubmit, 'emit');
      
      component.formData = {
        title: 'Test Task',
        description: 'Test Description'
      };

      component.onSubmit();

      expect(component.taskSubmit.emit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description'
      });
    });

    it('should trim whitespace from form data', () => {
      spyOn(component.taskSubmit, 'emit');
      
      component.formData = {
        title: '  Test Task  ',
        description: '  Test Description  '
      };

      component.onSubmit();

      expect(component.taskSubmit.emit).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description'
      });
    });

    it('should not emit when title is empty', () => {
      spyOn(component.taskSubmit, 'emit');
      
      component.formData = {
        title: '',
        description: 'Test Description'
      };

      component.onSubmit();

      expect(component.taskSubmit.emit).not.toHaveBeenCalled();
    });

    it('should not emit when title is only whitespace', () => {
      spyOn(component.taskSubmit, 'emit');
      
      component.formData = {
        title: '   ',
        description: 'Test Description'
      };

      component.onSubmit();

      expect(component.taskSubmit.emit).not.toHaveBeenCalled();
    });
  });

  describe('Form Cancellation', () => {
    it('should emit cancel event', () => {
      spyOn(component.cancel, 'emit');
      
      component.onCancel();

      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should reset form data', () => {
      component.formData = {
        title: 'Test Task',
        description: 'Test Description'
      };

      component.onCancel();

      expect(component.formData.title).toBe('');
      expect(component.formData.description).toBe('');
    });
  });

  describe('Template Rendering', () => {
    it('should display "Add New Task" title in create mode', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('h3').textContent).toContain('Add New Task');
    });

    it('should display "Edit Task" title in edit mode', () => {
      const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      component.task = mockTask;
      component.ngOnInit();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('h3').textContent).toContain('Edit Task');
    });

    it('should display "Add Task" button text in create mode', () => {
      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      expect(submitButton.textContent.trim()).toBe('Add Task');
    });

    it('should display "Update Task" button text in edit mode', () => {
      const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      component.task = mockTask;
      component.ngOnInit();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      expect(submitButton.textContent.trim()).toBe('Update Task');
    });

    it('should disable submit button when submitting', () => {
      component.isSubmitting = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTrue();
    });

    it('should show "Saving..." text when submitting', () => {
      component.isSubmitting = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]');
      expect(submitButton.textContent.trim()).toBe('Saving...');
    });
  });
});
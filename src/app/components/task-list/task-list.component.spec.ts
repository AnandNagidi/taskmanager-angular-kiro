import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { Task } from '../../models/task.model';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Pending Task 1',
      description: 'Description 1',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      title: 'Completed Task 1',
      description: 'Description 2',
      completed: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    },
    {
      id: '3',
      title: 'Pending Task 2',
      description: 'Description 3',
      completed: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    component.tasks = mockTasks;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Task Filtering', () => {
    it('should show all tasks by default', () => {
      expect(component.filteredTasks.length).toBe(3);
      expect(component.currentFilter).toBe('all');
    });

    it('should filter pending tasks', () => {
      component.onFilterChange('pending');
      expect(component.filteredTasks.length).toBe(2);
      expect(component.filteredTasks.every(task => !task.completed)).toBeTrue();
    });

    it('should filter completed tasks', () => {
      component.onFilterChange('completed');
      expect(component.filteredTasks.length).toBe(1);
      expect(component.filteredTasks.every(task => task.completed)).toBeTrue();
    });

    it('should return to all tasks when filter is changed back', () => {
      component.onFilterChange('pending');
      component.onFilterChange('all');
      expect(component.filteredTasks.length).toBe(3);
    });
  });

  describe('Task Counts', () => {
    it('should calculate pending count correctly', () => {
      expect(component.pendingCount).toBe(2);
    });

    it('should calculate completed count correctly', () => {
      expect(component.completedCount).toBe(1);
    });

    it('should update counts when tasks change', () => {
      const newTasks: Task[] = [
        ...mockTasks,
        {
          id: '4',
          title: 'New Completed Task',
          description: 'Description 4',
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      component.tasks = newTasks;
      expect(component.completedCount).toBe(2);
      expect(component.pendingCount).toBe(2);
    });
  });

  describe('Event Emissions', () => {
    it('should emit toggleComplete event', () => {
      spyOn(component.toggleComplete, 'emit');
      
      component.onToggleComplete('1');
      
      expect(component.toggleComplete.emit).toHaveBeenCalledWith('1');
    });

    it('should emit editTask event', () => {
      spyOn(component.editTask, 'emit');
      
      component.onEdit(mockTasks[0]);
      
      expect(component.editTask.emit).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should emit deleteTask event after confirmation', () => {
      spyOn(component.deleteTask, 'emit');
      spyOn(window, 'confirm').and.returnValue(true);
      
      component.onDelete('1', 'Test Task');
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Task"?');
      expect(component.deleteTask.emit).toHaveBeenCalledWith('1');
    });

    it('should not emit deleteTask event when confirmation is cancelled', () => {
      spyOn(component.deleteTask, 'emit');
      spyOn(window, 'confirm').and.returnValue(false);
      
      component.onDelete('1', 'Test Task');
      
      expect(component.deleteTask.emit).not.toHaveBeenCalled();
    });
  });

  describe('Empty State Messages', () => {
    beforeEach(() => {
      component.tasks = [];
      fixture.detectChanges();
    });

    it('should show appropriate message when no tasks exist', () => {
      expect(component.getEmptyMessage()).toBe('No tasks yet. Add your first task above!');
    });

    it('should show appropriate message when no pending tasks exist', () => {
      component.onFilterChange('pending');
      expect(component.getEmptyMessage()).toBe('No pending tasks. Great job!');
    });

    it('should show appropriate message when no completed tasks exist', () => {
      component.onFilterChange('completed');
      expect(component.getEmptyMessage()).toBe('No completed tasks yet.');
    });
  });

  describe('TrackBy Function', () => {
    it('should return task id for tracking', () => {
      const result = component.trackByTaskId(0, mockTasks[0]);
      expect(result).toBe(mockTasks[0].id);
    });
  });

  describe('Template Rendering', () => {
    it('should display task count in header', () => {
      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('h3');
      expect(header.textContent).toContain('Tasks (3)');
    });

    it('should display filter buttons with correct counts', () => {
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.filter-buttons .btn');
      
      expect(buttons[0].textContent.trim()).toBe('All (3)');
      expect(buttons[1].textContent.trim()).toBe('Pending (2)');
      expect(buttons[2].textContent.trim()).toBe('Completed (1)');
    });

    it('should render task items', () => {
      const compiled = fixture.nativeElement;
      const taskItems = compiled.querySelectorAll('.task-item');
      expect(taskItems.length).toBe(3);
    });

    it('should apply completed class to completed tasks', () => {
      const compiled = fixture.nativeElement;
      const taskItems = compiled.querySelectorAll('.task-item');
      
      // Second task is completed
      expect(taskItems[1].classList.contains('completed')).toBeTrue();
      expect(taskItems[0].classList.contains('completed')).toBeFalse();
    });

    it('should show empty state when no tasks match filter', () => {
      component.tasks = [];
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No tasks yet');
    });

    it('should disable buttons when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const actionButtons = compiled.querySelectorAll('.task-actions .btn');
      
      actionButtons.forEach((button: HTMLButtonElement) => {
        expect(button.disabled).toBeTrue();
      });
    });

    it('should show correct button text for completed vs pending tasks', () => {
      const compiled = fixture.nativeElement;
      const taskItems = compiled.querySelectorAll('.task-item');
      
      // First task is pending - should show "Complete"
      const pendingTaskButton = taskItems[0].querySelector('.btn-success, .btn-secondary');
      expect(pendingTaskButton.textContent.trim()).toBe('Complete');
      
      // Second task is completed - should show "Undo"
      const completedTaskButton = taskItems[1].querySelector('.btn-success, .btn-secondary');
      expect(completedTaskButton.textContent.trim()).toBe('Undo');
    });
  });
});
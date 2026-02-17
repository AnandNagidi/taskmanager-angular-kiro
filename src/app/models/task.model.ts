/**
 * Task model interface defining the structure of a task
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for creating a new task (without id and timestamps)
 */
export interface CreateTaskRequest {
  title: string;
  description: string;
}

/**
 * Interface for updating an existing task
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
import { Routes } from '@angular/router';

export const routes: Routes = [
  // For this simple app, we'll use a single route
  // In a larger app, you might have separate routes for different views
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', loadComponent: () => import('./app.component').then(m => m.AppComponent) },
  { path: '**', redirectTo: '/tasks' } // Wildcard route for 404 cases
];
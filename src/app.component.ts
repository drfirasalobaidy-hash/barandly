import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewComponent } from './components/dashboard/dashboard.component';
import { UsersViewComponent } from './components/users/users.component';
import { NotificationsViewComponent } from './components/notifications/notifications.component';
import { PmDashboardComponent } from './components/pm-dashboard/pm-dashboard.component';
import { DesignerDashboardComponent } from './components/designer-dashboard/designer-dashboard.component';
import { UserRole } from './services/mock-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardViewComponent, UsersViewComponent, NotificationsViewComponent, PmDashboardComponent, DesignerDashboardComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  currentView = signal<'dashboard' | 'pm-dashboard' | 'designer-dashboard' | 'users' | 'notifications'>('dashboard');
  
  // Role Simulation State
  currentUserRole = signal<UserRole>('CEO');
  isSidebarOpen = signal(false);

  setView(view: 'dashboard' | 'pm-dashboard' | 'designer-dashboard' | 'users' | 'notifications') {
    this.currentView.set(view);
    this.isSidebarOpen.set(false); // Auto-close on mobile
  }

  switchRole(role: UserRole) {
    this.currentUserRole.set(role);
    if (role === 'Project Manager') {
      this.setView('pm-dashboard');
    } else if (role === 'CEO') {
      this.setView('dashboard');
    } else if (role === 'Designer') {
      this.setView('designer-dashboard');
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }
}
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../serivces/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notifications$ | async; track notification.id) {
        <div 
          class="notification {{ notification.type }}"
          (click)="removeNotification(notification.id)"
        >
          <span class="notification-icon">{{ getIcon(notification.type) }}</span>
          <span class="notification-message">{{ notification.message }}</span>
          <button 
            class="notification-close" 
            (click)="removeNotification(notification.id); $event.stopPropagation()"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './notification-toast.component.scss'
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  
  public notifications$ = this.notificationService.notifications$;

  removeNotification(id: number): void {
    this.notificationService.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  }
}
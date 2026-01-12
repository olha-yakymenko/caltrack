import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../serivces/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.scss'
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  
  public notifications$ = this.notificationService.notifications$;

  public removeNotification = (id: number): void => {
    this.notificationService.remove(id);
  };

  public handleNotificationKeydown(event: KeyboardEvent, id: number): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      this.removeNotification(id);
    }
  }

  public handleCloseKeydown(event: KeyboardEvent, id: number): void {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      this.removeNotification(id);
    }
  }

  public getIcon = (type: string): string => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

}
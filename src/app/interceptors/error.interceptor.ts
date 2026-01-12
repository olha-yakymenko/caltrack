import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../serivces/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Wystąpił nieznany błąd';
      let notificationType: 'error' | 'warning' = 'error';

      switch (error.status) {
        case 400:
          if (
            typeof error.error === 'object' &&
            error.error !== null &&
            'message' in error.error
          ) {
            message = String((error.error as { message: unknown }).message);
          } else {
            message = 'Błędne dane';
          }
          break;

        case 403:
          message = 'Brak uprawnień do wykonania tej akcji';
          void router.navigate(['/no-access']);
          break;

        case 404:
          message = 'Zasób nie istnieje';
          break;

        case 409:
          message = 'Nie można usunąć – element jest powiązany z innymi danymi';
          notificationType = 'warning';
          break;

        case 500:
          message = 'Błąd serwera';
          break;
      }

      notificationService[notificationType](message);

      return throwError(() => error);
    })
  );
};
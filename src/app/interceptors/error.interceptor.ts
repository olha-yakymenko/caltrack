import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../serivces/notification.service';

function resolveErrorMessage(error: HttpErrorResponse, router: Router): string {
  const statusMessages: Record<number, string> = {
    400: typeof error.error === 'object' && error.error !== null && 'message' in error.error
        ? String((error.error as { message: unknown }).message)
        : 'Błędne dane',
    403: 'Brak uprawnień do wykonania tej akcji',
    404: 'Zasób nie istnieje',
    409: 'Nie można usunąć – element jest powiązany z innymi danymi',
    500: 'Błąd serwera'
  };

  if (error.status === 403) {
    void router.navigate(['/no-access']);
  }

  return statusMessages[error.status] ?? 'Wystąpił nieznany błąd';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = resolveErrorMessage(error, router);

      notificationService.error(message);

      return throwError(() => error);
    })
  );
};

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      let message = 'Wystąpił nieznany błąd';

      switch (error.status) {
        case 400:
          message = error.error?.message ?? 'Błędne dane';
          break;

        case 403:
          message = 'Brak uprawnień do wykonania tej akcji';
          router.navigate(['/no-access']);
          break;

        case 404:
          message = 'Zasób nie istnieje';
          break;

        case 409:
          message = 'Nie można usunąć – element jest powiązany z innymi danymi';
          break;

        case 500:
          message = 'Błąd serwera';
          break;
      }

      console.error('API ERROR:', error);
      alert(message);

      return throwError(() => error);
    })
  );
};

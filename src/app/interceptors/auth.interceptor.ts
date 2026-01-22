import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../serivces/auth.service';

const PUBLIC_ENDPOINTS: readonly string[] = [
  '/users?email='
];

function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function attachToken(req: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
  const token = authService.getToken();

  if (token && authService.isTokenActive()) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  if (token) {
    authService.logout().catch((error) => {
      console.error('Błąd podczas wylogowania', error);
    });
  }

  return req;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (isPublicEndpoint(req.url)) {
    return next(req);
  }

  const authReq = attachToken(req, authService);
  
  return next(authReq);
};
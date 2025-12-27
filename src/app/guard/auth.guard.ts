import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../serivces/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.getCurrentUser()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

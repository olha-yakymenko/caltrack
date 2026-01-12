import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../serivces/auth.service';

export const authGuard: CanActivateFn = () => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.getCurrentUser()) {
    router.navigate(['/login'])
  .catch((err) => console.error('Navigation error:', err));

    
return false;
  }

  return true;
};

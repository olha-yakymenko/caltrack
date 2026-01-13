import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../serivces/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser();

if (!user) {
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
}


  if (!user.isActive) {
    return false;
  }

  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // router.navigate(['/no-access']);
    return false;
  }

  return true;
};

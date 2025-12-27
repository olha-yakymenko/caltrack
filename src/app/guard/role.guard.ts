import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../serivces/auth.service';

export const RoleGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser();

  if (!user) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // if (!user.isActive) {
  //   router.navigate(['/account-suspended']);
  //   return false;
  // }

  // const allowedRoles = route.data['roles'] as string[] | undefined;

  // if (allowedRoles && !allowedRoles.includes(user.role)) {
  //   router.navigate(['/no-access']);
  //   return false;
  // }

  return true;
};

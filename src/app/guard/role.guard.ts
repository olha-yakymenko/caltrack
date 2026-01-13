import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../serivces/auth.service';
import { NotificationService } from '../serivces/notification.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService); 

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
    router.navigate(['/no-access']).catch((err: unknown) => { 
      const errorMessage = err instanceof Error ? err.message : String(err);
      notificationService.error(`Navigation error: ${errorMessage}`); 
    });
    
    return false;
  }

  return true;
};
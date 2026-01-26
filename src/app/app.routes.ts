import { Routes } from '@angular/router';
import { InfoComponent } from './info/info.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { authGuard } from './guard/auth.guard';
import { roleGuard } from './guard/role.guard'; 
import { NoAccessComponent } from './no-access/no-access.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
    title: 'Home',
  },
  {
    path: 'info',
    pathMatch: 'full',
    component: InfoComponent,
    title: 'Info',
  },
  {
    path: 'meal',
    loadChildren: () =>
    import('./navbar/navbar.routes').then((r) => r.NAVBAR_ROUTES),
  },
    {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'no-access',
    component: NoAccessComponent
  },
  {
    path: 'admin',
    component: AdminUsersComponent,
    canActivate: [authGuard, roleGuard], 
    data: { roles: ['admin'] } 
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];


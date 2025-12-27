import { Routes } from '@angular/router';
import { MealDetailsComponent } from '../meal-details/meal-details.component';
import { MealListComponent } from '../meal-list/meal-list.component';
import { MealFormComponent } from '../meal-form/meal-form.component';
import { AuthGuard } from '../guard/auth.guard';
import { LoginComponent } from '../login/login.component';

export const NAVBAR_ROUTES: Routes = [

  {
    path: 'list',
    component: MealListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id/form',
    component: MealFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'form',
    component: MealFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id/details',
    component: MealDetailsComponent,
    canActivate: [AuthGuard]
  }
];

import { Routes } from '@angular/router';
import { MealDetailsComponent } from '../meal-details/meal-details.component';
import { MealListComponent } from '../meal-list/meal-list.component';
import { MealFormComponent } from '../meal-form/meal-form.component';
import { authGuard } from '../guard/auth.guard';

export const NAVBAR_ROUTES: Routes = [

  {
    path: 'list',
    component: MealListComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id/form',
    component: MealFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'form',
    component: MealFormComponent,
    canActivate: [authGuard]
  },
  {
    path: ':id/details',
    component: MealDetailsComponent,
    canActivate: [authGuard]
  }
];

import { Routes } from '@angular/router';
import { MealDetailsComponent } from '../meal-details/meal-details.component';
import { MealListComponent } from '../meal-list/meal-list.component';
import { MealFormComponent } from '../meal-form/meal-form.component';

export const NAVBAR_ROUTES: Routes = [

  {
    path: 'list',
    component: MealListComponent,
  },
  {
    path: ':id/form',
    component: MealFormComponent
  },
  {
    path: 'form',
    component: MealFormComponent
  },
  {
    path: ':id/details',
    component: MealDetailsComponent
  },

];

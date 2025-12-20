import { Routes } from '@angular/router';
import { NAVBAR_ROUTES } from './navbar/navbar.routes'; 
import { InfoComponent } from './info/info.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
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
    path: '**',
    component: PageNotFoundComponent,
  },
];


import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { CalorieEffects } from './store/calorie/calorie.effects';
import { calorieFeature } from './store/calorie/calorie.state'; 
import { provideEffects } from '@ngrx/effects';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideStore({
      [calorieFeature.name]: calorieFeature.reducer
    }),
    provideEffects([CalorieEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75
    }),
  ]
};
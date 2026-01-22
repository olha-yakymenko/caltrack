import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { ApplicationConfig, inject, isDevMode, provideZoneChangeDetection, Injector, provideAppInitializer } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { CalorieEffects } from './store/calorie/calorie.effects';
import { calorieFeature } from './store/calorie/calorie.state'; 
import { provideEffects } from '@ngrx/effects';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { LOCATION_INITIALIZED } from '@angular/common';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
export function i18nInitializer(): Promise<void> {
  const translate = inject(TranslateService);
  const injector = inject(Injector);

  return injector.get(LOCATION_INITIALIZED, Promise.resolve(null)).then(() => {
    const langToSet = 'en';
    translate.addLangs(['pl', 'en']);
    translate.setFallbackLang(langToSet);

    return new Promise<void>((resolve, reject) => {
      translate.use(langToSet).subscribe({
        next: () => {},
        error: (err) => {
          console.error(
            `Problem with '${langToSet}' language initialization.`,
            err,
          );
          reject(err);
        },
        complete: () => resolve(),
      });
    });
  });
}


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
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'pl',
      lang: 'pl',
    }),
    provideAppInitializer(i18nInitializer),
  ]
};



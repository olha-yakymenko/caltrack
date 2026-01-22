import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DARK_THEME = 'dark-theme';
  private readonly LIGHT_THEME = 'light-theme';
  
  private readonly currentTheme = new BehaviorSubject<string>(this.LIGHT_THEME);
  public readonly theme$: Observable<string> = this.currentTheme.asObservable();
  
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  public constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let theme = this.LIGHT_THEME;
      
      if (savedTheme) {
        theme = savedTheme;
      } else if (prefersDark) {
        theme = this.DARK_THEME;
      }
      
      this.setTheme(theme);
    }
  }

  public setTheme(theme: string): void {
    this.currentTheme.next(theme);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);
      
      this.document.body.classList.remove(this.DARK_THEME);
      this.document.body.classList.remove(this.LIGHT_THEME);
      
      this.document.body.classList.add(theme);
    }
  }

  public toggleTheme(): void {
    const newTheme = this.currentTheme.value === this.LIGHT_THEME 
      ? this.DARK_THEME 
      : this.LIGHT_THEME;
    this.setTheme(newTheme);
  }

  public isDarkTheme(): boolean {
    return this.currentTheme.value === this.DARK_THEME;
  }

  public getCurrentTheme(): string {
    return this.currentTheme.value;
  }
}
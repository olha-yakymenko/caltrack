import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DARK_THEME = 'dark-theme';
  private readonly LIGHT_THEME = 'light-theme';
  
  private currentTheme = new BehaviorSubject<string>(this.LIGHT_THEME);
  theme$ = this.currentTheme.asObservable();
  
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
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

  setTheme(theme: string): void {
    this.currentTheme.next(theme);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);
      
      this.document.body.classList.remove(this.DARK_THEME);
      this.document.body.classList.remove(this.LIGHT_THEME);
      
      this.document.body.classList.add(theme);
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme.value === this.LIGHT_THEME 
      ? this.DARK_THEME 
      : this.LIGHT_THEME;
    this.setTheme(newTheme);
  }

  isDarkTheme(): boolean {
    return this.currentTheme.value === this.DARK_THEME;
  }

  getCurrentTheme(): string {
    return this.currentTheme.value;
  }
}
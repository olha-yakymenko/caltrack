import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserSettingsComponent } from '../user-settings/user-settings.component';
import { DisabledIfInactiveDirective } from '../directives/disabled-if-inactive.directive'; 
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../serivces/auth.service';
import { ThemeService } from '../serivces/theme.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    UserSettingsComponent,
    DisabledIfInactiveDirective,
    TranslateModule,
    FormsModule 
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public showSettings = false;
  public userSettings = { name: '', email: '' };
  public currentLanguage = 'pl';
  public availableLanguages = [
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
    ];

  protected authService = inject(AuthService);
  private location = inject(Location);
  private translate = inject(TranslateService); 
  private themeService = inject(ThemeService);

  public isDarkTheme = false;
  
  public constructor() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'pl';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);
  }
  
  public ngOnInit(): void {
    this.themeService.theme$.subscribe((theme) => {
      this.isDarkTheme = theme === 'dark-theme';
    });
  }
  
  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected changeLanguage(langCode: string): void {
    this.currentLanguage = langCode;
    this.translate.use(langCode);
    localStorage.setItem('preferredLanguage', langCode);
  }

  public openSettings(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.isActive) { 
      this.userSettings = { name: user.name, email: user.email };
      this.showSettings = true;
    }
  }

  public closeSettings(): void {
    this.showSettings = false;
  }

  public saveUserSettings(data: { name: string; email: string }): void {
    const user = this.authService.getCurrentUser();
    if (user && user.isActive) { 
      this.authService.updateUserProfile(data).subscribe({
        next: () => {
          this.closeSettings();
        },
        error: (err) => {
          console.error('Błąd aktualizacji użytkownika:', err);
        }
      });
    }
  }

  public back(): void {
    void this.location.back();
  }
}


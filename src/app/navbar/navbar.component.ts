import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserSettingsComponent } from '../user-settings/user-settings.component';
import { DisabledIfInactiveDirective } from '../directives/disabled-if-inactive.directive'; 
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../serivces/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    UserSettingsComponent,
    DisabledIfInactiveDirective 
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  public showSettings = false;
  public userSettings = { name: '', email: '' };

  protected authService = inject(AuthService);
  private location = inject(Location);

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
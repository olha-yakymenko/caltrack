import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AsyncPipe, Location, CommonModule } from '@angular/common';
import { AuthService } from '../serivces/auth.service';
import { UserSettingsComponent } from "../user-settings/user-settings.component";

@Component({
  selector: 'app-navbar',
  imports: [
    RouterOutlet,
    RouterModule,
    AsyncPipe,
    RouterLink,
    CommonModule,
    UserSettingsComponent
],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  protected location = inject(Location); 

  showSettings = false;
  userSettings = { name: '', email: '' };

  public back(): void {
    this.location.back();
  }

  openSettings(): void {
    console.log('openSettings clicked'); 
    const user = this.authService.getCurrentUser();
    console.log('Current user:', user); 
    if (user) {
      this.userSettings = { name: user.name, email: user.email };
      this.showSettings = true;
      console.log('showSettings set to true'); 
    }
  }

  closeSettings(): void {
    this.showSettings = false;
    console.log('showSettings set to false'); 
  }

  saveUserSettings(settings: { name: string; email: string }): void {
    console.log('Saving user settings:', settings); // Debug
    this.authService.updateUserProfile(settings).subscribe({
      next: () => {
        console.log('Settings saved successfully');
        this.closeSettings();
      },
      error: (err) => {
        console.error('Błąd aktualizacji:', err);
      }
    });
  }
}
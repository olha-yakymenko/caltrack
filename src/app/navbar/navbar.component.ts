import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AsyncPipe, Location } from '@angular/common';
import { AuthService } from '../serivces/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, RouterModule, AsyncPipe, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  protected location = inject(Location); 

  public back(): void {
    this.location.back();
  }
}

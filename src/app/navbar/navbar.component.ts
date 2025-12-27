import { Component, inject } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AsyncPipe, Location } from '@angular/common'
import { AsyncAction } from 'rxjs/internal/scheduler/AsyncAction';
import { AuthService } from '../serivces/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, RouterModule, AsyncPipe, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
constructor(private location: Location) {}

protected authService = inject(AuthService);

  back(): void {
    this.location.back()
  }

}

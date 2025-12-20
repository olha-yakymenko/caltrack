import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common'

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
constructor(private location: Location) {}

  back(): void {
    this.location.back()
  }

}

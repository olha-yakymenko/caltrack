import { Component, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { NotificationToastComponent } from './notification-toast/notification-toast.component';
import { ThemeService } from './serivces/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, RouterModule, NotificationToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  protected readonly title = signal('caltrack');
  private themeservice = inject(ThemeService);

  ngOnInit(){
    
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { NotificationToastComponent } from './notification-toast/notification-toast.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, RouterModule, NotificationToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit{
  protected readonly title = signal('caltrack');
  private translate = inject(TranslateService);

  public ngOnInit(): void {
    const savedLang = localStorage.getItem('preferredLanguage') || 'pl';
    this.translate.use(savedLang);
  }
}

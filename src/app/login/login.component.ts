import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../serivces/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { LoginFormModel } from '../interfaces/login-form';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public error: string | null = null;

  public loginForm: FormGroup<LoginFormModel> = new FormGroup<LoginFormModel>({
  email: new FormControl('', {
    nonNullable: true,
    validators: [
      (c) => Validators.required(c),
      (c) => Validators.email(c),
    ],
  }),

  password: new FormControl('', {
    nonNullable: true,
    validators: [
      (c) => Validators.required(c),
    ],
  }),
});


  private auth = inject(AuthService);
  private router = inject(Router);

  public submit = (): void => {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        void this.router.navigate(['/meal/list']);
      },
      error: (err: HttpErrorResponse) => {
        if (
          err.error &&
          typeof err.error === 'object' &&
          'message' in err.error
        ) {
          this.error = String((err.error as { message: unknown }).message);
        } else {
          this.error = 'Login failed';
        }
      }
    });
  };
}

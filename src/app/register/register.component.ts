import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormControl,
  FormGroup
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../serivces/auth.service';
import { NotificationService } from '../serivces/notification.service';
import { passwordMatchValidator } from '../validators/password-match.validator';
import { RegisterFormModel } from '../interfaces/register-form';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  public isLoading = false;
  public showPassword = false;
  public showConfirmPassword = false;

  public registerForm: FormGroup<RegisterFormModel> = this.fb.group(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [
          (c) => Validators.required(c),
          (c) => Validators.minLength(2)(c),
          (c) => Validators.maxLength(50)(c)
        ]
      }),

      email: new FormControl('', {
        nonNullable: true,
        validators: [
          (c) => Validators.required(c),
          (c) => Validators.email(c)
        ]
      }),

      password: new FormControl('', {
        nonNullable: true,
        validators: [
          (c) => Validators.required(c),
          (c) => Validators.minLength(8)(c),
          (c) =>
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            )(c)
        ]
      }),

      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [(c) => Validators.required(c)]
      }),

      agreeToTerms: new FormControl(false, {
        nonNullable: true,
        validators: [(c) => Validators.requiredTrue(c)]
      })
    },
    {
      validators: [passwordMatchValidator]
    }
  );

  public onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.notificationService.warning('Proszę poprawnie wypełnić wszystkie pola');
      
return;
    }

    this.isLoading = true;

    const formValue = this.registerForm.getRawValue();

    this.authService.register(formValue).subscribe({
      next: () => {
        this.notificationService.success('Konto zostało utworzone!');
        void this.router.navigate(['/']);
      },
      error: (error: unknown) => {
        console.error('Błąd rejestracji:', error);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  public togglePasswordVisibility(
    field: 'password' | 'confirmPassword'
  ): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }


  protected get name(): FormControl<string> {
    return this.registerForm.controls.name;
  }

  protected get email(): FormControl<string> {
    return this.registerForm.controls.email;
  }

  protected get password(): FormControl<string> {
    return this.registerForm.controls.password;
  }

  protected get confirmPassword(): FormControl<string> {
    return this.registerForm.controls.confirmPassword;
  }

  protected get agreeToTerms(): FormControl<boolean> {
    return this.registerForm.controls.agreeToTerms;
  }

}

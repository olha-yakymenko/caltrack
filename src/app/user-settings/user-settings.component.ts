import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  @Output() public save = new EventEmitter<{ name: string; email: string }>();
  @Output() public closed = new EventEmitter<void>(); // ZMIANA: cancel → closed
  @Input() public name = '';
  @Input() public email = '';

  public settingsForm = new FormGroup({
    name: new FormControl('', [
      Validators.required.bind(null),
      Validators.minLength.bind(null, 3),
      Validators.pattern.bind(null, /^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]{2,}\s+[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]{2,}$/)
    ]),
    email: new FormControl('', [
      Validators.required.bind(null),
      Validators.email.bind(null)
    ])
  });

  public ngOnInit(): void {
    if (this.name && this.email) {
      this.settingsForm.patchValue({
        name: this.name,
        email: this.email
      });
    }
  }

  public onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }

  public onSave = (): void => {
    if (this.settingsForm.valid) {
      this.save.emit(this.settingsForm.value as { name: string; email: string });
    }
  };

  public onCancel = (): void => {
    this.closed.emit(); 
  };
}
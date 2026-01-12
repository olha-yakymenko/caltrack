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
  @Output() save = new EventEmitter<{ name: string; email: string }>();
  @Output() cancel = new EventEmitter<void>();
  @Input() name = '';
  @Input() email = '';

  settingsForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]{2,}\s+[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]{2,}$/)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  ngOnInit(): void {
    if (this.name && this.email) {
      this.settingsForm.patchValue({
        name: this.name,
        email: this.email
      });
    }
  }

  onSave(): void {
    if (this.settingsForm.valid) {
      this.save.emit(this.settingsForm.value as { name: string; email: string });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
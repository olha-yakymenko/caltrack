import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  @Input() public isVisible = false;
  @Input() public title = 'Potwierdzenie';
  @Input() public message = 'Czy na pewno chcesz kontynuować?';
  @Input() public details = '';
  @Input() public confirmText = 'Tak';
  @Input() public cancelText = 'Nie';
  @Input() public confirmButtonClass = '';
  
  @Output() public confirmed = new EventEmitter<void>();
  @Output() public cancelled = new EventEmitter<void>();
  @Output() public closed = new EventEmitter<void>();

  public close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  public confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  public cancel(): void {
    this.cancelled.emit();
    this.close();
  }
}
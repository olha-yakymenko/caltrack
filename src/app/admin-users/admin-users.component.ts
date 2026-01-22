import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../serivces/auth.service';
import { User } from '../interfaces/user';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  public users: User[] = [];
  public filteredUsers: User[] = [];
  public searchTerm = '';
  public sortField: keyof User = 'name';
  public sortDirection: 'asc' | 'desc' = 'asc';

  public showModal = false;
  public modalTitle = '';
  public modalMessage = '';
  public modalDetails = '';
  public modalConfirmText = 'Tak';
  public modalCancelText = 'Nie';
  public modalConfirmClass = '';
  private pendingAction: 'toggleStatus' | 'togglePremium' | null = null;
  private pendingUser: User | null = null;

  public ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
      },
      error: (err) => {
        console.error('Błąd ładowania użytkowników:', err);
        this.showErrorModal('Błąd ładowania', 'Nie udało się załadować listy użytkowników');
      }
    });
  }

  public filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter((user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    }
    this.sortUsers();
  }

  public sortBy(field: keyof User): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortUsers();
  }

  private sortUsers(): void {
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    this.filteredUsers.sort((a, b) => {
      const aValue = this.normalizeValue(a[this.sortField]);
      const bValue = this.normalizeValue(b[this.sortField]);

      return this.compareValues(aValue, bValue) * direction;
    });
  }

  private normalizeValue(
    value: string | number | boolean | null | undefined
  ): string | number | null {
    if (value == null) return null;
    if (typeof value === 'boolean') return value ? 1 : 0;
    
    return value;
  }

  private compareValues(
    a: string | number | null,
    b: string | number | null
  ): number {
    if (a === b) return 0;
    if (a === null) return -1;
    if (b === null) return 1;
    
    return a < b ? -1 : 1;
  }

  public toggleUserStatus(user: User): void {
    if (this.isCurrentUser(user)) {
      this.showErrorModal(
        'Operacja niedozwolona',
        'Nie możesz zmienić statusu swojego konta!'
      );
      
return;
    }

    this.pendingAction = 'toggleStatus';
    this.pendingUser = user;
    
    const newStatus = !user.isActive;
    this.modalTitle = newStatus ? 'Aktywacja konta' : 'Zawieszenie konta';
    this.modalMessage = `Czy na pewno chcesz ${newStatus ? 'aktywować' : 'zawiesić'} konto użytkownika ${user.name}?`;
    this.modalDetails = newStatus 
      ? 'Użytkownik odzyska dostęp do swojego konta.'
      : 'Użytkownik utraci dostęp do swojego konta do czasu ponownej aktywacji.';
    this.modalConfirmText = newStatus ? 'Aktywuj' : 'Zawieś';
    this.modalCancelText = 'Anuluj';
    this.modalConfirmClass = newStatus ? 'premium' : '';
    
    this.showModal = true;
  }

  public togglePremiumStatus(user: User): void {
    if (this.isCurrentUser(user)) {
      this.showErrorModal(
        'Operacja niedozwolona',
        'Nie możesz zmienić statusu premium swojego konta!'
      );
      
return;
    }

    this.pendingAction = 'togglePremium';
    this.pendingUser = user;
    
    const newPremiumStatus = !user.isPremium;
    this.modalTitle = newPremiumStatus ? 'Nadanie statusu PREMIUM' : 'Usunięcie statusu PREMIUM';
    this.modalMessage = `Czy na pewno chcesz ${newPremiumStatus ? 'dodać' : 'usunąć'} status PREMIUM użytkownikowi ${user.name}?`;
    this.modalDetails = newPremiumStatus 
      ? 'Użytkownik zyska dostęp do zaawansowanych funkcji premium.'
      : 'Użytkownik straci dostęp do zaawansowanych funkcji premium.';
    this.modalConfirmText = newPremiumStatus ? 'Nadaj PREMIUM' : 'Usuń PREMIUM';
    this.modalCancelText = 'Anuluj';
    this.modalConfirmClass = newPremiumStatus ? 'premium' : '';
    
    this.showModal = true;
  }

  public onModalConfirmed(): void {
  if (!this.pendingUser || !this.pendingAction) return;

  switch (this.pendingAction) {
    case 'toggleStatus':
      this.executeToggleStatus(this.pendingUser);
      break;
    case 'togglePremium':
      this.executeTogglePremium(this.pendingUser);
      break;
  }

  this.resetModal();
}


  public onModalCancelled(): void {
    this.resetModal();
  }

  public onModalClosed(): void {
    this.resetModal();
  }

  private resetModal(): void {
    this.showModal = false;
    this.pendingAction = null;
    this.pendingUser = null;
    this.modalTitle = '';
    this.modalMessage = '';
    this.modalDetails = '';
    this.modalConfirmText = 'Tak';
    this.modalCancelText = 'Nie';
    this.modalConfirmClass = '';
  }

  private executeToggleStatus(user: User): void {
    const newStatus = !user.isActive;
    
    this.http.patch<User>(`http://localhost:3000/users/${user.id}`, { 
      isActive: newStatus 
    }).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers();
        }
        
        const action = newStatus ? 'aktywowane' : 'zawieszone';
        this.showSuccessModal(
          'Sukces',
          `Konto użytkownika ${user.name} zostało ${action}.`
        );
      },
      error: (err) => {
        console.error('Błąd aktualizacji użytkownika:', err);
        this.showErrorModal(
          'Błąd aktualizacji',
          'Nie udało się zaktualizować statusu użytkownika'
        );
      }
    });
  }

  private executeTogglePremium(user: User): void {
    const newPremiumStatus = !user.isPremium;
    
    this.http.patch<User>(`http://localhost:3000/users/${user.id}`, { 
      isPremium: newPremiumStatus 
    }).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers();
        }
        
        const action = newPremiumStatus ? 'dodano' : 'usunięto';
        this.showSuccessModal(
          'Sukces',
          `Status PREMIUM ${action} użytkownikowi ${user.name}.`
        );
      },
      error: (err) => {
        console.error('Błąd aktualizacji statusu premium:', err);
        this.showErrorModal(
          'Błąd aktualizacji',
          'Nie udało się zaktualizować statusu premium użytkownika'
        );
      }
    });
  }

  private showSuccessModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalDetails = '';
    this.modalConfirmText = 'OK';
    this.modalCancelText = '';
    this.modalConfirmClass = 'premium';
    this.showModal = true;
  }

  private showErrorModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalDetails = '';
    this.modalConfirmText = 'OK';
    this.modalCancelText = '';
    this.modalConfirmClass = '';
    this.showModal = true;
  }

  public refreshUsers(): void {
    this.loadUsers();
  }

  public isCurrentUser(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    
return currentUser?.id === user.id;
  }

  public get activeUsersCount(): number {
    return this.users.filter((user) => user.isActive).length;
  }

  public get suspendedUsersCount(): number {
    return this.users.filter((user) => !user.isActive).length;
  }

  public get adminUsersCount(): number {
    return this.users.filter((user) => user.role === 'admin').length;
  }
}



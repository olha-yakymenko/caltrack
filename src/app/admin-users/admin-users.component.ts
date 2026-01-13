// admin-users/admin-users.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../serivces/auth.service';
import { User } from '../interfaces/user';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        alert('Nie udało się załadować listy użytkowników');
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
      alert('Nie możesz zmienić statusu swojego konta!');
      
return;
    }

    const newStatus = !user.isActive;
    const confirmMessage = newStatus 
      ? `Czy na pewno chcesz aktywować konto użytkownika ${user.name}?`
      : `Czy na pewno chcesz zawiesić konto użytkownika ${user.name}?`;

    if (confirm(confirmMessage)) {
      this.http.patch<User>(`http://localhost:3000/users/${user.id}`, { 
        isActive: newStatus 
      }).subscribe({
        next: (updatedUser) => {
          // Aktualizuj lokalną listę
          const index = this.users.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.filterUsers();
          }
          
          // Powiadomienie
          const action = newStatus ? 'aktywowane' : 'zawieszone';
          alert(`Konto użytkownika ${user.name} zostało ${action}.`);
        },
        error: (err) => {
          console.error('Błąd aktualizacji użytkownika:', err);
          alert('Nie udało się zaktualizować statusu użytkownika');
        }
      });
    }
  }

  public togglePremiumStatus(user: User): void {
  if (this.isCurrentUser(user)) {
    alert('Nie możesz zmienić statusu premium swojego konta!');
    
return;
  }

  const newPremiumStatus = !user.isPremium;
  const confirmMessage = newPremiumStatus 
    ? `Czy na pewno chcesz dodać status PREMIUM użytkownikowi ${user.name}?\n\n` +
      `Użytkownik otrzyma dostęp do zaawansowanych funkcji jak:\n` +
      `- Planowanie posiłków\n` +
      `- Zaawansowana analiza\n` +
      `- Nieograniczona baza produktów`
    : `Czy na pewno chcesz usunąć status PREMIUM użytkownikowi ${user.name}?\n\n` +
      `Użytkownik straci dostęp do zaawansowanych funkcji.`;

  if (confirm(confirmMessage)) {
    this.http.patch<User>(`http://localhost:3000/users/${user.id}`, { 
      isPremium: newPremiumStatus 
    }).subscribe({
      next: (updatedUser) => {
        // Aktualizuj lokalną listę
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.filterUsers();
        }
        
        // Powiadomienie
        const action = newPremiumStatus ? 'dodano' : 'usunięto';
        alert(`Status PREMIUM ${action} użytkownikowi ${user.name}.`);
      },
      error: (err) => {
        console.error('Błąd aktualizacji statusu premium:', err);
        alert('Nie udało się zaktualizować statusu premium użytkownika');
      }
    });
  }
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
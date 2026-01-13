// admin-users/admin-users.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../serivces/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  dailyCalorieLimit: number;
}

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
    this.filteredUsers.sort((a, b) => {
      let aValue = a[this.sortField];
      let bValue = b[this.sortField];
      
      // Dla boolean sortujemy true przed false
      if (typeof aValue === 'boolean') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      
return 0;
    });
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
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private notificationService = inject(NotificationService);
  
  private http = inject(HttpClient);

  public constructor() {
  const user = localStorage.getItem('currentUser');

  if (user) {
    const parsedUser = JSON.parse(user) as User;
    this.currentUserSubject.next(parsedUser);
  }
}


public login(email: string, password: string): Observable<User> {
  return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
    map((users) => {
      if (!users.length) throw new Error('Nie znaleziono użytkownika');
      const user = users[0];
      if (user.password !== password) throw new Error('Niepoprawne hasło');
      
return user;
    }),
    tap((user) => {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    })
  );
}


  public logout(): void{
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    
    return !!user && user.isActive;
  }

  public hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    
    return !!user && user.role === role && user.isActive;
  }

  public updateUserProfile(userData: { name: string; email: string }): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      throw new Error('Nie znaleziono zalogowanego użytkownika');
    }

    const updatedUser = {
      ...currentUser,
      name: userData.name,
      email: userData.email
    };

    return this.http.put<User>(`http://localhost:3000/users/${currentUser.id}`, updatedUser).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        this.notificationService.success('Dane użytkownika zostały zaktualizowane');
      })
    );
  }

  public updateDailyCalorieLimit(calorieLimit: number): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      throw new Error('Nie znaleziono zalogowanego użytkownika');
    }

    const updatedUser = {
      ...currentUser,
      dailyCalorieLimit: calorieLimit
    };

    return this.http.put<User>(`${this.apiUrl}/${currentUser.id}`, updatedUser).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.notificationService.success(`Dzienny limit kalorii został zmieniony na ${calorieLimit} kcal`);
      })
    );
  }
}

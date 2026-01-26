import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { NotificationService } from './notification.service';
import { jwtDecode }  from 'jwt-decode';
import { Router } from '@angular/router';
import { AuthResponse } from '../interfaces/auth-response';
import { JwtPayload } from '../interfaces/jwt-payload';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);

  private router = inject(Router);
  
  public constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    
    if (token && this.isTokenValid(token)) {
      const user = this.decodeToken(token);
      this.currentUserSubject.next(user);
      
      console.log('Token JWT znaleziony, użytkownik automatycznie zalogowany');
    } else if (token) {
      console.warn('Token JWT wygasł, wylogowywanie...');
      this.clearAuthData();
    }
    
    const oldUserData = localStorage.getItem('currentUser');
    if (oldUserData && !token) {
      console.warn('Znaleziono stare dane użytkownika, migruj do JWT...');
      const user = JSON.parse(oldUserData) as User;
      this.migrateToJwt(user);
    }
  }

  public login(email: string, password: string): Observable<AuthResponse> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
      map((users) => {
        if (!users.length) {
          throw new Error('Nie znaleziono użytkownika');
        }
        
        const user = users[0];
        if (user.password !== password) {
          throw new Error('Niepoprawne hasło');
        }
        
        const token = this.generateJwtToken(user);
        
        const safeUser: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isPremium: user.isPremium,
          dailyCalorieLimit: user.dailyCalorieLimit
        };
        
        return {
          user: safeUser,
          token,
          expiresIn: 3600 // 1 godzina
        };
      }),
      tap((response) => {
        this.setAuthData(response.token, response.user);
        this.notificationService.success('Zalogowano pomyślnie!');
        
        console.log('Token JWT wygenerowany:', response.token.substring(0, 50) + '...');
        console.log('Użytkownik:', response.user);
      }),
      catchError((error: Error) => {
        this.notificationService.error('Błąd logowania: ' + error.message);
        throw error;
      })
    );
  }

  private generateJwtToken(user: User): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const payload: JwtPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isPremium: user.isPremium,
      dailyCalorieLimit: user.dailyCalorieLimit,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 godzina
      iat: Math.floor(Date.now() / 1000)
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'demo_jwt_signature'; 
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private decodeToken(token: string): User {
    try {
      const payload = jwtDecode<JwtPayload>(token);

      if (payload.role !== 'user' && payload.role !== 'admin') {
        throw new Error('Nieprawidłowa rola');
      }

      return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        isActive: payload.isActive,
        isPremium: payload.isPremium,
        dailyCalorieLimit: payload.dailyCalorieLimit ?? 0
      };
    } catch (error) {
      console.error('Błąd dekodowania tokena:', error);
      throw new Error('Nieprawidłowy token');
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    
return !!token && this.isTokenValid(token);
  }

  public isTokenActive(): boolean {
    const token = this.getToken();
    
return !!token && this.isTokenValid(token);
  }

  public async logout(): Promise<void> {
    this.clearAuthData();
    this.notificationService.info('Wylogowano pomyślnie');

    try {
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Błąd podczas nawigacji do /login', error);
    }
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

    return this.http.put<User>(`${this.apiUrl}/${currentUser.id}`, updatedUser).pipe(
      tap((user) => {
        const newToken = this.generateJwtToken(user);
        this.setAuthData(newToken, user);
        
        this.notificationService.success('Dane użytkownika zostały zaktualizowane');
        console.log('Token odświeżony po aktualizacji profilu');
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
        const newToken = this.generateJwtToken(user);
        this.setAuthData(newToken, user);
        
        this.notificationService.success(`Dzienny limit kalorii został zmieniony na ${calorieLimit} kcal`);
        console.log('Token odświeżony po zmianie limitu kalorii');
      })
    );
  }

  public hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    
return !!user && user.role === role && user.isActive;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public getTokenPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  public getTokenExpirationTime(): number | null {
    const payload = this.getTokenPayload();
    if (!payload) return null;
    
    const currentTime = Math.floor(Date.now() / 1000);
    
return Math.max(0, payload.exp - currentTime);
  }

  private migrateToJwt(user: User): void {
    const token = this.generateJwtToken(user);
    this.setAuthData(token, user);
    localStorage.removeItem('currentUser'); 
    console.log('Stare dane zmigrowane do JWT');
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    this.currentUserSubject.next(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('currentUser'); 
    this.currentUserSubject.next(null);
  }

  public refreshToken(): Observable<string> {
    const user = this.currentUserSubject.value;
    if (!user) {
      return of('');
    }
    
    const newToken = this.generateJwtToken(user);
    localStorage.setItem(this.tokenKey, newToken);
    
    console.log('Token odświeżony');
    
return of(newToken);
  }

  public debugToken(): void {
    const token = this.getToken();
    if (!token) {
      console.log('Brak tokena');
      
return;
    }
    
    console.group('DEBUG JWT TOKEN');
    console.log('Token:', token);
    console.log('Długość:', token.length);
    
    const parts = token.split('.');
    console.log('Części:', parts.length);
    
    if (parts.length === 3) {
      try {
        const header = JSON.parse(atob(parts[0])) as { alg: string; typ: string };
        const payload = JSON.parse(atob(parts[1])) as JwtPayload;
        
        console.log('Header:', header);
        console.log('Payload:', payload);
        console.log('Ważny do:', new Date(payload.exp * 1000).toLocaleString());
        console.log('Pozostały czas:', this.getTokenExpirationTime(), 'sekund');
      } catch (e) {
        const error = e as Error;
        console.error('Błąd parsowania tokena:', error.message);
      }
    }
    
    console.groupEnd();
  }



  public register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }): Observable<AuthResponse> {
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Hasła nie są identyczne');
    }

    if (!this.isPasswordValid(userData.password)) {
      throw new Error('Hasło musi mieć co najmniej 8 znaków, w tym dużą literę, cyfrę i znak specjalny');
    }

    return this.http.get<User[]>(`${this.apiUrl}?email=${userData.email}`).pipe(
      map((users) => {
        if (users.length > 0) {
          throw new Error('Użytkownik z tym adresem email już istnieje');
        }
        
        return users;
      }),
      switchMap(() => {
        const newUser: Omit<User, 'id'> = {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: 'user',
          isActive: true,
          isPremium: false,
          dailyCalorieLimit: 2000 
        };

        return this.http.post<User>(this.apiUrl, newUser);
      }),
      map((createdUser) => {
        const token = this.generateJwtToken(createdUser);
        
        const safeUser: User = {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          isActive: createdUser.isActive,
          isPremium: createdUser.isPremium,
          dailyCalorieLimit: createdUser.dailyCalorieLimit
        };
        
        return {
          user: safeUser,
          token,
          expiresIn: 3600
        };
      }),
      tap((response) => {
        this.setAuthData(response.token, response.user);
        this.notificationService.success('Rejestracja zakończona sukcesem!');
        
        console.log('Nowy użytkownik zarejestrowany:', response.user);
      }),
      catchError((error: Error) => {
        this.notificationService.error('Błąd rejestracji: ' + error.message);
        throw error;
      })
    );
  }
  private isPasswordValid(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
          hasUpperCase && 
          hasLowerCase && 
          hasNumbers && 
          hasSpecialChar;
  }
}


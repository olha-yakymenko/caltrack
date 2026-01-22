export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password?: string;
  readonly role: 'user' | 'admin';
  readonly isActive: boolean;
  readonly isPremium: boolean;
  readonly dailyCalorieLimit: number;
  readonly token?: string; 
}

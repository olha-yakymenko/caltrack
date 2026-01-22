
export interface JwtPayload {
  readonly sub: string;          
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly isActive: boolean;
  readonly isPremium: boolean;
  readonly dailyCalorieLimit?: number;
  readonly exp: number;          
  readonly iat: number;          
}

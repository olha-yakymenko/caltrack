import { User } from "./user";

export interface AuthResponse {
  readonly user: User;
  readonly token: string;
  readonly expiresIn: number;
}
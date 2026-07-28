import { User } from '../entities/User';

export interface AuthRepository {
  login(email: string, password: string): Promise<{ user: User; token: string } | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

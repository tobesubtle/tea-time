export type UserRole = 'admin' | 'editor' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  role?: UserRole;
  password?: string;
}

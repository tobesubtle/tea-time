import { User, CreateUserInput, UpdateUserInput } from '../entities/User';

export interface UserRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(input: UpdateUserInput): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}

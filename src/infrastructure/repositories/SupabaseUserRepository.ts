import { UserRepository } from '@/domain/repositories/UserRepository';
import { User, CreateUserInput, UpdateUserInput } from '@/domain/entities/User';
import { createAdminClient } from '../supabase/admin';

export class SupabaseUserRepository implements UserRepository {
  async getUsers(): Promise<User[]> {
    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient.auth.admin.listUsers();

      if (error || !data || !data.users) {
        console.error('Failed to fetch real users from Supabase Auth:', error?.message);
        return [];
      }

      return data.users.map((u) => ({
        id: u.id,
        email: u.email || '',
        name: u.user_metadata?.name || u.email?.split('@')[0] || '사용자',
        role: u.user_metadata?.role || 'user',
        createdAt: u.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const adminClient = createAdminClient();
    const tempPassword = 'TempPassword123!';

    const { data, error } = await adminClient.auth.admin.createUser({
      email: input.email,
      password: input.password && input.password.trim() !== '' ? input.password : tempPassword,
      email_confirm: true,
      user_metadata: {
        name: input.name,
        role: input.role || 'user',
      },
    });

    if (error || !data.user) {
      throw new Error(`사용자 생성 실패: ${error?.message}`);
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      name: input.name,
      role: input.role,
      createdAt: data.user.created_at,
    };
  }

  async updateUser(input: UpdateUserInput): Promise<User> {
    const adminClient = createAdminClient();
    const updatePayload: any = {};

    if (input.password && input.password.trim() !== '') {
      updatePayload.password = input.password;
    }

    if (input.name !== undefined || input.role !== undefined) {
      updatePayload.user_metadata = {};
      if (input.name !== undefined) updatePayload.user_metadata.name = input.name;
      if (input.role !== undefined) updatePayload.user_metadata.role = input.role;
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(input.id, updatePayload);

    if (error || !data.user) {
      throw new Error(`사용자 수정 실패: ${error?.message}`);
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || '',
      role: data.user.user_metadata?.role || 'user',
      createdAt: data.user.created_at,
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(id);

    if (error) {
      console.error('Failed to delete user:', error.message);
      return false;
    }

    return true;
  }
}

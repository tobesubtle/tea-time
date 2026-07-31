import { AuthRepository } from '@/domain/repositories/AuthRepository';
import { User } from '@/domain/entities/User';
import { createClient } from '@/infrastructure/supabase/server';

export class SupabaseAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session) {
      console.error('Login error:', error);
      return null;
    }

    const { user, session } = data;
    const role = user.user_metadata?.role || user.app_metadata?.role || 'user';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || '';

    const domainUser: User = {
      id: user.id,
      email: user.email || '',
      name,
      role,
      createdAt: user.created_at,
    };

    return { user: domainUser, token: session.access_token };
  }

  async logout(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const role = user.user_metadata?.role || user.app_metadata?.role || 'user';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || '';

    return {
      id: user.id,
      email: user.email || '',
      name,
      role,
      createdAt: user.created_at,
    };
  }
}


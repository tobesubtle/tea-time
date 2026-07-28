import { redirect } from 'next/navigation';
import { SupabaseAuthRepository } from '@/infrastructure/repositories/SupabaseAuthRepository';

export default async function HomePage() {
  const authRepo = new SupabaseAuthRepository();
  const currentUser = await authRepo.getCurrentUser();

  if (currentUser) {
    redirect('/admin/users');
  } else {
    redirect('/login');
  }
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { SupabasePromptHistoryRepository } from '@/infrastructure/repositories/SupabasePromptHistoryRepository';
import Header from '@/presentation/components/Header';
import ResultClientView from '@/presentation/components/ResultClientView';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PromptResultPage({ params }: PageProps) {
  const { id } = await params;
  const historyRepo = new SupabasePromptHistoryRepository();
  const history = await historyRepo.getPromptHistoryById(id);

  if (!history) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user';
  const userName = user?.user_metadata?.name;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header userRole={userRole} userEmail={user?.email} userName={userName} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 pb-32">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/prompts/create"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-[#45474c]"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h2 className="font-bold text-2xl text-[#0b1c30]">결과 확인</h2>
              <p className="text-xs text-[#45474c] mt-0.5">
                Gemini API로 생성된 결과입니다. 인라인 수정, 복사, 이메일 발송이 가능합니다.
              </p>
            </div>
          </div>

          <ResultClientView history={history} userEmail={user?.email} />
        </div>
      </main>
    </div>
  );
}

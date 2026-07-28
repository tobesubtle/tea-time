'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Template } from '@/domain/entities/Template';

interface PromptTemplateFilterProps {
  templates: Template[];
  selectedTemplateId?: string;
  searchQuery?: string;
}

export default function PromptTemplateFilter({
  templates,
  selectedTemplateId,
  searchQuery,
}: PromptTemplateFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== 'all') {
      params.set('templateId', val);
    } else {
      params.delete('templateId');
    }
    router.push(`/prompts?${params.toString()}`);
  };

  return (
    <select
      name="templateId"
      value={selectedTemplateId || 'all'}
      onChange={handleChange}
      className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none cursor-pointer"
    >
      <option value="all">모든 템플릿</option>
      {templates.map((t) => (
        <option key={t.id} value={t.id}>
          {t.title} ({t.category})
        </option>
      ))}
    </select>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Template } from '@/domain/entities/Template';

interface TemplateSelectProps {
  templates: Template[];
  selectedTemplateId?: string;
}

export default function TemplateSelect({ templates, selectedTemplateId }: TemplateSelectProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    router.push(`/prompts/create?templateId=${val}`);
  };

  return (
    <select
      name="templateId"
      value={selectedTemplateId || ''}
      onChange={handleChange}
      className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer"
    >
      {templates.map((t) => (
        <option key={t.id} value={t.id}>
          {t.title} ({t.category})
        </option>
      ))}
    </select>
  );
}

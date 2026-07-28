import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/infrastructure/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const bucketName = 'prompt-attachments';

    // 1. 버킷 존재 여부 확인 및 생성
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucketName);

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      if (createError) {
        console.warn('Supabase storage create bucket warning:', createError.message);
      }
    }

    // 2. 파일 업로드
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `files/${Date.now()}_${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError.message);
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    // 3. Public URL 추출
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      name: file.name,
      size: file.size,
      type: file.type,
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (err: any) {
    console.error('File upload route error:', err?.message);
    return NextResponse.json({ success: false, error: err?.message || '업로드 실패' }, { status: 500 });
  }
}

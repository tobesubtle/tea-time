import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '티타임은 즐거워 - Gemini 프롬프트 매니저';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #091426 0%, #162839 50%, #1e293b 100%)',
          color: 'white',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#4648d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}
          >
            ✨
          </div>
          <span style={{ fontSize: '32px', color: '#a5b4fc', fontWeight: 700 }}>
            티타임은 즐거워
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '960px' }}>
          <div style={{ fontSize: '58px', fontWeight: 900, lineHeight: 1.2, color: '#ffffff' }}>
            Gemini AI 프롬프트 템플릿 매니저
          </div>
          <div style={{ fontSize: '26px', color: '#cbd5e1', lineHeight: 1.5 }}>
            프롬프트 템플릿화, 변수 입력 자동화, 파일 첨부 및 백그라운드 스마트 실행
          </div>
        </div>

        <div style={{ fontSize: '20px', color: '#94a3b8' }}>
          https://tea-time-six.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

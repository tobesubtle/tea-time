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
        {/* Top Header */}
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
              boxShadow: '0 8px 16px rgba(70, 72, 212, 0.4)',
            }}
          >
            ✨
          </div>
          <span style={{ fontSize: '32px', color: '#a5b4fc', fontWeight: 700, letterSpacing: '-0.025em' }}>
            티타임은 즐거워
          </span>
        </div>

        {/* Center Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '960px' }}>
          <div style={{ fontSize: '58px', fontWeight: 900, lineHeight: 1.2, color: '#ffffff' }}>
            Gemini AI 프롬프트 템플릿 매니저
          </div>
          <div style={{ fontSize: '26px', color: '#cbd5e1', lineHeight: 1.5 }}>
            자주 쓰는 프롬프트 템플릿화, 변수 대입 자동화, 로컬/구글드라이브 파일 첨부 및 백그라운드 스마트 실행
          </div>
        </div>

        {/* Footer Tag Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(220, 233, 255, 0.15)',
              border: '1px solid rgba(220, 233, 255, 0.3)',
              color: '#dce9ff',
              padding: '8px 20px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            Gemini 3.6 Flash
          </div>
          <div
            style={{
              background: 'rgba(70, 72, 212, 0.2)',
              border: '1px solid rgba(70, 72, 212, 0.4)',
              color: '#c7d2fe',
              padding: '8px 20px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            Next.js 16 App Router
          </div>
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              padding: '8px 20px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            Vercel Production
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

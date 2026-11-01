import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Samyojak — Coordinate Everything. Run Anything.'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFFDF5',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 24,
            background: '#8B5CF6',
            border: '4px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '8px 8px 0px #1E293B',
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 900, color: 'white' }}>S</span>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: '#1E293B',
            textAlign: 'center',
            padding: '0 60px',
            lineHeight: 1.1,
          }}
        >
          Skip the Setup Hell.
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #8B5CF6, #F472B6)',
            backgroundClip: 'text',
            color: 'transparent',
            marginTop: 12,
          }}
        >
          The Adaptive ERP
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#64748B',
            marginTop: 24,
          }}
        >
          samyojak-erp.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

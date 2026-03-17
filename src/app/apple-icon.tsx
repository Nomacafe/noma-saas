import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 85, lineHeight: 1 }}>☕</div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '0.1em',
            marginTop: 4,
          }}
        >
          NOMA
        </div>
      </div>
    </div>,
    { ...size }
  )
}

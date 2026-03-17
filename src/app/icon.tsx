import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        borderRadius: '22%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <div style={{ fontSize: 90, lineHeight: 1 }}>☕</div>
        <div
          style={{
            fontSize: 28,
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

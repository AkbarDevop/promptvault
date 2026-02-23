import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') ?? 'prompt'

  // Shared colours
  const bg = '#0f0f11'
  const card = '#1a1a1f'
  const accent = '#7c3aed'
  const muted = '#6b7280'
  const white = '#f9fafb'

  if (type === 'profile') {
    const name = searchParams.get('name') ?? 'Creator'
    const username = searchParams.get('username') ?? ''
    const followers = searchParams.get('followers') ?? '0'
    const initials = name.slice(0, 2).toUpperCase()

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '48px 56px',
            background: bg,
            fontFamily: 'sans-serif',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 24, color: accent }}>✦</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: white, letterSpacing: '-0.5px' }}>PromptVault</div>
          </div>

          {/* Profile block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                background: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                fontWeight: 800,
                color: white,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: white, lineHeight: 1.1 }}>{name}</div>
              <div style={{ fontSize: 20, color: muted }}>@{username}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: card,
                borderRadius: 12,
                padding: '14px 24px',
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 700, color: white }}>{Number(followers).toLocaleString()}</span>
              <span style={{ fontSize: 14, color: muted, marginTop: 2 }}>followers</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  // Default: prompt card
  const title = searchParams.get('title') ?? 'Untitled Prompt'
  const author = searchParams.get('author') ?? 'Anonymous'
  const category = searchParams.get('category') ?? ''
  const model = searchParams.get('model') ?? ''

  const categoryColors: Record<string, string> = {
    coding: '#3b82f6',
    writing: '#10b981',
    marketing: '#f59e0b',
    design: '#ec4899',
    business: '#6366f1',
    education: '#14b8a6',
    productivity: '#8b5cf6',
    creative: '#f97316',
    research: '#06b6d4',
    other: '#6b7280',
  }
  const catColor = categoryColors[category] ?? accent

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          background: bg,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo + category */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 24, color: accent }}>✦</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: white, letterSpacing: '-0.5px' }}>PromptVault</div>
          </div>
          {category && (
            <div
              style={{
                background: catColor + '22',
                border: `1px solid ${catColor}66`,
                color: catColor,
                borderRadius: 8,
                padding: '6px 16px',
                fontSize: 16,
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? 36 : 48,
            fontWeight: 800,
            color: white,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            maxWidth: '90%',
          }}
        >
          {title}
        </div>

        {/* Author + model */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                background: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                color: white,
              }}
            >
              {author[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 18, color: muted }}>{author}</span>
          </div>
          {model && (
            <div
              style={{
                background: card,
                borderRadius: 8,
                padding: '6px 16px',
                fontSize: 16,
                color: muted,
              }}
            >
              {model}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

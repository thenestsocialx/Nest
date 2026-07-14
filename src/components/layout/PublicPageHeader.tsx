import NestLogo from '@/components/ui/NestLogo'

export default function PublicPageHeader() {
  return (
    <header
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 32px',
        height:         60,
        borderBottom:   '1px solid rgba(224,213,197,0.5)',
        background:     'var(--cream)',
        position:       'sticky',
        top:            0,
        zIndex:         20,
        flexShrink:     0,
      }}
    >
      <a href="/" aria-label="Nest home" style={{ textDecoration: 'none' }}>
        <NestLogo size={17} color="#2F4C3A" />
      </a>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <a
          href="/login"
          style={{
            padding:        '8px 16px',
            fontSize:       13,
            color:          'var(--moss)',
            textDecoration: 'none',
            borderRadius:   'var(--r-sm)',
            transition:     'color 0.15s',
          }}
        >
          Log in
        </a>
        <a
          href="/signup"
          className="ns-btn ns-btn--primary"
          style={{ padding: '9px 20px', fontSize: 13, textDecoration: 'none' }}
        >
          Get started
        </a>
      </nav>
    </header>
  )
}

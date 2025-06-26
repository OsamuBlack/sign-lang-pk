import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '0 1rem',
      }}
    >
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
        Oops! Page not found.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          borderRadius: '4px',
          textDecoration: 'none',
        }}
      >
        Go back home
      </Link>
    </div>
  )
}
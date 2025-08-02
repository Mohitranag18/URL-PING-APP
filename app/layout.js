import './globals.css'

export const metadata = {
  title: 'URL Ping App',
  description: 'Keep your backend servers alive',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'
import SessionManager from '@/components/SessionManager'

export const metadata: Metadata = {
  title: 'Samyojak - Coordinate Everything. Run Anything.',
  description: 'The all-in-one ERP for modern businesses. CRM, Invoicing, Inventory, HR, Projects unified in one workspace.',
  keywords: 'ERP, CRM, GST, Invoicing, Inventory, HR, India, SaaS, Business Management',
  openGraph: {
    title: 'Samyojak - Coordinate Everything. Run Anything.',
    description: 'The all-in-one ERP for modern businesses.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieBanner />
        <SessionManager />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'
import SessionManager from '@/components/SessionManager'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.samyojak-erp.com'),
  title: {
    default: 'Samyojak — Coordinate Everything. Run Anything.',
    template: '%s | Samyojak ERP',
  },
  description: 'The all-in-one AI-powered ERP for modern businesses. CRM, GST Invoicing, Inventory with QR codes, HR, Projects, and Tax Reports unified in one workspace.',
  keywords: [
    'ERP', 'CRM', 'GST invoicing', 'inventory management',
    'HR software', 'project management', 'SaaS ERP',
    'small business ERP', 'AI ERP', 'business software India',
  ],
  authors: [{ name: 'Samyojak', url: 'https://www.samyojak-erp.com' }],
  creator: 'Samyojak',
  publisher: 'Samyojak',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.samyojak-erp.com',
    siteName: 'Samyojak',
    title: 'Samyojak — Coordinate Everything. Run Anything.',
    description: 'The all-in-one AI-powered ERP for modern businesses globally.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samyojak — Coordinate Everything. Run Anything.',
    description: 'All-in-one AI-powered ERP. CRM, Invoicing, Inventory, HR, Projects.',
  },
  alternates: { canonical: 'https://www.samyojak-erp.com' },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.samyojak-erp.com/#software',
      name: 'Samyojak',
      description: 'All-in-one AI-powered ERP for modern businesses.',
      url: 'https://www.samyojak-erp.com',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '4.99',
        highPrice: '1299',
        priceCurrency: 'USD',
        offerCount: '36',
      },
      featureList: [
        'CRM with AI lead scoring',
        'Universal tax invoicing GST VAT HST Sales Tax',
        'Inventory management with free QR codes',
        'HR and payroll management',
        'Project management Kanban board',
        'Tax reports GSTR-1 format',
        'AI business intelligence',
        'Support ticket system',
        'White label program',
        'Mobile-first design',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '127',
        bestRating: '5',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.samyojak-erp.com/#organization',
      name: 'Samyojak',
      url: 'https://www.samyojak-erp.com',
      description: 'Samyojak builds AI-powered ERP software for modern businesses worldwide.',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello.samyojak@gmail.com',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.samyojak-erp.com/#website',
      url: 'https://www.samyojak-erp.com',
      name: 'Samyojak',
      description: 'All-in-one AI-powered ERP for modern businesses',
      publisher: { '@id': 'https://www.samyojak-erp.com/#organization' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Samyojak?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Samyojak is an all-in-one AI-powered ERP for modern businesses including CRM, invoicing, inventory with QR codes, HR, projects, and tax reports.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does Samyojak cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Plans start at $4.99 per week for India, $6.99 for global, $9.99 for western markets. Weekly plans include a bonus period; monthly and yearly plans include a 14-day free trial.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Samyojak support GST and VAT?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Universal tax engine supports GST, VAT, HST, Sales Tax across 15 countries.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Samyojak work on mobile?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Mobile-first design with dedicated bottom navigation bar.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:rounded-xl focus:font-bold focus:text-white"
          style={{ background: '#8B5CF6' }}
        >
          Skip to main content
        </a>
        <main id="main-content">
          {children}
        </main>
        <CookieBanner />
        <SessionManager />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

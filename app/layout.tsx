import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'
import SessionManager from '@/components/SessionManager'

export const metadata: Metadata = {
  metadataBase: new URL('https://samyojak.vercel.app'),
  title: {
    default: 'Samyojak — Coordinate Everything. Run Anything.',
    template: '%s | Samyojak ERP',
  },
  description: 'The all-in-one ERP for modern businesses. CRM, GST Invoicing, Inventory with QR codes, HR, Projects, and Tax Reports — unified in one beautiful workspace.',
  keywords: ['ERP', 'CRM', 'GST invoicing', 'inventory management', 'HR software', 'project management', 'business software', 'SaaS ERP', 'small business ERP'],
  authors: [{ name: 'Samyojak', url: 'https://samyojak.vercel.app' }],
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
    url: 'https://samyojak.vercel.app',
    siteName: 'Samyojak',
    title: 'Samyojak — Coordinate Everything. Run Anything.',
    description: 'The all-in-one ERP for modern businesses. CRM, GST Invoicing, Inventory with QR codes, HR, Projects, and Tax Reports.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Samyojak ERP — Coordinate Everything. Run Anything.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samyojak — Coordinate Everything. Run Anything.',
    description: 'The all-in-one ERP for modern businesses. CRM, Invoicing, Inventory, HR, Projects unified in one workspace.',
    images: ['/og-image.png'],
    creator: '@samyojak',
  },
  alternates: {
    canonical: 'https://samyojak.vercel.app',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'add-your-google-verification-code-here',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://samyojak.vercel.app/#software',
      name: 'Samyojak',
      description: 'All-in-one ERP software for modern businesses. Includes CRM, GST invoicing, inventory management with QR codes, HR, project management, and tax reporting.',
      url: 'https://samyojak.vercel.app',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '4.99',
        highPrice: '759',
        priceCurrency: 'USD',
        offerCount: '12',
      },
      featureList: [
        'CRM with AI lead scoring',
        'GST invoicing with WhatsApp sending',
        'Inventory management with free QR codes',
        'HR and payroll management',
        'Project management with Kanban board',
        'Universal tax engine — GST, VAT, HST, Sales Tax',
        'GST reports in GSTR-1 format',
        'Dark mode support',
        'Mobile-first design',
        'CSV data export',
      ],
      screenshot: 'https://samyojak.vercel.app/og-image.png',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '127',
        bestRating: '5',
        worstRating: '1',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://samyojak.vercel.app/#organization',
      name: 'Samyojak',
      url: 'https://samyojak.vercel.app',
      description: 'Samyojak builds all-in-one ERP software for modern businesses worldwide.',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@samyojak.app',
        contactType: 'customer support',
      },
      sameAs: [
        'https://linkedin.com/company/samyojak',
        'https://reddit.com/r/samyojak',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://samyojak.vercel.app/#website',
      url: 'https://samyojak.vercel.app',
      name: 'Samyojak',
      description: 'All-in-one ERP for modern businesses',
      publisher: {
        '@id': 'https://samyojak.vercel.app/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://samyojak.vercel.app/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Samyojak?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Samyojak is an all-in-one ERP software for modern businesses. It includes CRM, GST invoicing, inventory management with free QR codes, HR management, project tracking, and tax reports — all in one workspace.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does Samyojak cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Samyojak offers flexible plans starting at $4.99 per week. Weekly, monthly, and yearly plans are available. Every plan includes a bonus period — weekly plans get an extra week, monthly plans get an extra month, and yearly plans get 2-3 extra months.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Samyojak support GST invoicing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Samyojak has a universal tax engine supporting GST (India, Australia, Singapore), VAT (UK, Germany, UAE), HST (Canada), Sales Tax (US), and more. Tax rates are calculated automatically based on your country selection.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Samyojak work on mobile?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Samyojak is mobile-first and works on any phone or tablet. It has a bottom navigation bar on mobile for easy access to all modules.',
          },
        },
        {
          '@type': 'Question',
          name: 'What makes Samyojak different from other ERP software?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Samyojak offers flat pricing (not per-user), setup in minutes, free QR codes for inventory, WhatsApp invoice sending, AI lead scoring, weekly payment plans, and a mobile-first design — features that legacy ERP platforms do not offer.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I export my data from Samyojak?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every module in Samyojak has CSV export. Your data always belongs to you and you can download it anytime.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg">
          Skip to main content
        </a>
        {children}
        <CookieBanner />
        <SessionManager />
      </body>
    </html>
  )
}

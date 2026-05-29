import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm hover:underline mb-8 block">← Back to home</Link>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly when you create an account or use our services, including your name, email address, company name, and business data you enter into Samyojak.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send technical notices, and respond to your comments and questions.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Security</h2>
            <p>Your data is stored securely using Supabase infrastructure with row-level security enabled. We implement appropriate technical measures to protect your personal information against unauthorized access, alteration, or disclosure.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>We do not sell, trade, or transfer your personal information to third parties without your consent. We may share data with trusted service providers who assist us in operating our platform under strict confidentiality agreements.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time through your account settings or by contacting us at hello@samyojak.app</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
            <p>We use cookies to improve your experience. You can control cookies through your browser settings. Declining cookies may affect some features of our service.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at hello@samyojak.app</p>
          </section>
        </div>
      </div>
    </div>
  )
}

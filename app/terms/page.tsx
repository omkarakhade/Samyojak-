import Link from 'next/link'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm hover:underline mb-8 block">← Back to home</Link>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Samyojak you accept and agree to be bound by these Terms of Service. If you do not agree to these terms please do not use this service.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Use License</h2>
            <p>Permission is granted to use Samyojak for personal and commercial business management. You may not modify, copy, reverse engineer, or use the software for any unlawful purpose.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Subscription and Payments</h2>
            <p>Samyojak offers weekly, monthly, and yearly subscription plans. All payments are processed securely through Stripe. Subscriptions auto-renew unless cancelled before the renewal date. Refunds are available within 7 days of purchase.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Ownership</h2>
            <p>You retain full ownership of all data you enter into Samyojak. We do not claim any ownership rights over your business data. You can export your data at any time using the built-in CSV export features.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Service Availability</h2>
            <p>We strive for 99.9% uptime but cannot guarantee uninterrupted service. We are not liable for any downtime or data loss caused by third-party services including Supabase, Airtable, or Vercel.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Governing Law</h2>
            <p>These terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact</h2>
            <p>Questions about these Terms? Contact us at hello@samyojak.app</p>
          </section>
        </div>
      </div>
    </div>
  )
}

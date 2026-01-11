export const metadata = {
  title: 'Privacy Policy - The Session',
  description: 'Privacy policy for The Session. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-title text-cream-100 mb-4">Privacy Policy</h1>
        <p className="text-stout-400">
          Last updated: January 2025
        </p>
      </div>

      <div className="space-y-8 text-stout-300">
        {/* Introduction */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Introduction</h2>
          <p className="mb-4">
            The Session (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy
            explains how we collect, use, and safeguard your personal information when you
            use our website and services.
          </p>
          <p>
            We operate in compliance with the General Data Protection Regulation (GDPR) and
            the Irish Data Protection Acts. If you&apos;re in the EU, you have specific rights
            regarding your personal data.
          </p>
        </section>

        {/* What We Collect */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Information We Collect</h2>

          <h3 className="text-lg font-semibold text-cream-100 mt-4 mb-2">Account Information</h3>
          <p className="mb-4">
            When you create an account, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stout-400 mb-4">
            <li>Email address</li>
            <li>Username (optional display name)</li>
            <li>Password (securely hashed, never stored in plain text)</li>
          </ul>

          <h3 className="text-lg font-semibold text-cream-100 mt-4 mb-2">Content You Submit</h3>
          <p className="mb-4">
            When you contribute to The Session, we store:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stout-400 mb-4">
            <li>Price submissions</li>
            <li>Pub reviews and ratings</li>
            <li>Votes on price accuracy</li>
          </ul>

          <h3 className="text-lg font-semibold text-cream-100 mt-4 mb-2">Automatically Collected</h3>
          <p>
            Like most websites, we automatically receive standard log information including
            your IP address, browser type, and pages visited. This helps us understand how
            people use The Session and improve the service.
          </p>
        </section>

        {/* How We Use Data */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">How We Use Your Information</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">✓</span>
              <span><strong className="text-cream-100">Provide the service:</strong> Display prices, reviews, and pub information</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">✓</span>
              <span><strong className="text-cream-100">Improve accuracy:</strong> Use votes to identify outdated or incorrect information</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">✓</span>
              <span><strong className="text-cream-100">Prevent abuse:</strong> Detect and prevent spam or fraudulent submissions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">✓</span>
              <span><strong className="text-cream-100">Communicate:</strong> Send essential service updates (rarely)</span>
            </li>
          </ul>
          <p className="mt-4 text-stout-400 text-sm">
            We never sell your personal information to third parties. Full stop.
          </p>
        </section>

        {/* Cookies */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Cookies</h2>
          <p className="mb-4">
            We use cookies to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stout-400 mb-4">
            <li>Keep you logged in to your account</li>
            <li>Remember your preferences</li>
            <li>Understand how people use the site (analytics)</li>
          </ul>
          <p>
            You can disable cookies in your browser settings, but this may affect
            some functionality like staying logged in.
          </p>
        </section>

        {/* Your Rights */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Your Rights (GDPR)</h2>
          <p className="mb-4">
            Under GDPR, you have the right to:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">•</span>
              <span><strong className="text-cream-100">Access:</strong> Request a copy of your personal data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">•</span>
              <span><strong className="text-cream-100">Rectification:</strong> Correct inaccurate personal data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">•</span>
              <span><strong className="text-cream-100">Erasure:</strong> Request deletion of your account and data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">•</span>
              <span><strong className="text-cream-100">Portability:</strong> Receive your data in a portable format</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-irish-green-500 mt-1">•</span>
              <span><strong className="text-cream-100">Object:</strong> Object to processing of your personal data</span>
            </li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:privacy@thesession.ie" className="text-irish-green-500 hover:text-irish-green-400">
              privacy@thesession.ie
            </a>
          </p>
        </section>

        {/* Data Retention */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Data Retention</h2>
          <p className="mb-4">
            We retain your account information for as long as your account is active.
            If you delete your account:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stout-400">
            <li>Your personal information will be deleted within 30 days</li>
            <li>Your price submissions and reviews may be anonymised and retained to maintain the accuracy of our database</li>
          </ul>
        </section>

        {/* Security */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Security</h2>
          <p>
            We use industry-standard security measures to protect your data, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stout-400 mt-4">
            <li>HTTPS encryption for all data in transit</li>
            <li>Secure password hashing</li>
            <li>Regular security updates</li>
            <li>Limited access to personal data</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have questions about this privacy policy or how we handle your data:
          </p>
          <p>
            Email:{' '}
            <a href="mailto:privacy@thesession.ie" className="text-irish-green-500 hover:text-irish-green-400">
              privacy@thesession.ie
            </a>
          </p>
          <p className="mt-4 text-stout-400 text-sm">
            You also have the right to lodge a complaint with the Irish Data Protection
            Commission if you believe we have not handled your data appropriately.
          </p>
        </section>

        {/* Changes */}
        <section className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-bold text-cream-100 mb-4">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We&apos;ll notify you of
            any significant changes by posting a notice on the website. Your continued
            use of The Session after changes take effect constitutes acceptance of the
            revised policy.
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - The Session',
  description: 'Terms of Service for The Session - Dublin\'s pub price tracker',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-cream-100 mb-2">Terms of Service</h1>
      <p className="text-stout-400 mb-8">Last updated: February 2026</p>

      <div className="prose prose-invert max-w-none space-y-6 text-stout-300">
        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using The Session ("the Service"), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">2. Description of Service</h2>
          <p>
            The Session is a community-powered platform that allows users to share and discover
            pub prices, reviews, and information in Dublin, Ireland. The Service includes:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Browsing pub information and prices</li>
            <li>Submitting prices, reviews, and photos</li>
            <li>Creating user accounts and profiles</li>
            <li>Participating in community features</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">3. User Accounts</h2>
          <p>
            To submit content, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Providing accurate account information</li>
            <li>Maintaining the security of your account</li>
            <li>All activity that occurs under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">4. User Content</h2>
          <p>
            When you submit content (prices, reviews, photos, etc.), you:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Grant us a license to use, display, and distribute your content</li>
            <li>Confirm that the content is accurate to the best of your knowledge</li>
            <li>Confirm that you have the right to share any photos you upload</li>
            <li>Agree not to submit false, misleading, or harmful content</li>
          </ul>
          <p className="mt-2">
            We reserve the right to remove any content that violates these terms or is
            otherwise inappropriate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">5. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Submit intentionally false or misleading information</li>
            <li>Harass, abuse, or threaten other users</li>
            <li>Impersonate others or misrepresent your affiliation</li>
            <li>Attempt to manipulate rankings or reviews</li>
            <li>Use automated systems to scrape or spam the Service</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">6. Accuracy of Information</h2>
          <p>
            The Session relies on user-submitted information. While we strive to maintain
            accuracy, we cannot guarantee that all prices, hours, or other information is
            current or correct. Always verify important details directly with the establishment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">7. Pub Owner Claims</h2>
          <p>
            Pub owners may claim their listing to update information directly. By claiming
            a listing, you confirm that you are authorised to act on behalf of the establishment.
            We reserve the right to verify claims and revoke access if misuse is detected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">8. Points and Rewards</h2>
          <p>
            Points earned through the Service have no monetary value and cannot be exchanged
            for cash. We reserve the right to modify the points system or remove points
            earned through abuse of the system.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">9. Limitation of Liability</h2>
          <p>
            The Service is provided "as is" without warranties of any kind. We are not liable
            for any damages arising from your use of the Service, including but not limited to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Inaccurate information leading to poor decisions</li>
            <li>Service interruptions or data loss</li>
            <li>Actions of other users</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the Service after
            changes constitutes acceptance of the new terms. We will notify users of significant
            changes via email or on-site notification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-cream-100 mb-3">11. Contact</h2>
          <p>
            For questions about these terms, please contact us at:{' '}
            <a href="mailto:legal@thesession.ie" className="text-irish-green-500 hover:underline">
              legal@thesession.ie
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

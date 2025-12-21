import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata = {
  title: 'Terms of Service - Homezy',
  description: 'Read the terms and conditions for using Homezy services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 to-white py-16 border-b border-gray-200">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-normal text-gray-900 mb-4">
                Terms of Service
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: December 2024
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto prose prose-gray">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-blue-900 mb-0">
                  <strong>Important:</strong> Please read these Terms of Service carefully before
                  using the Homezy platform. By accessing or using our services, you agree to be
                  bound by these terms.
                </p>
              </div>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Homezy
                  platform (the &quot;Platform&quot;), operated by Avik Smart Home Services FZ-LLC
                  (&quot;Homezy&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By creating an account or using our
                  Platform, you agree to comply with and be bound by these Terms.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you do not agree to these Terms, you may not access or use the Platform.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">2. Platform Description</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Homezy is a home services marketplace connecting homeowners with verified
                  home improvement professionals (&quot;Pros&quot;) in the UAE. The Platform enables:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Homeowners to submit service requests and receive quotes from professionals</li>
                  <li>Professionals to access leads and grow their business</li>
                  <li>Communication between homeowners and professionals</li>
                  <li>Reviews and ratings to build trust</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Important:</strong> Homezy is a marketplace platform only. We do not employ
                  the professionals and are not responsible for the quality, safety, or legality of
                  their work. All services are performed by independent professionals.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">3. User Accounts</h2>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.1 Account Creation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To use certain features of the Platform, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.2 Professional Verification</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Professionals must undergo verification before accessing leads. Verification requires
                  submission of valid trade license, Emirates ID, and other relevant documentation.
                  Homezy reserves the right to approve or reject verification applications at our discretion.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">3.3 Eligibility</h3>
                <p className="text-gray-700 leading-relaxed">
                  You must be at least 18 years old to use the Platform. By using the Platform, you
                  represent and warrant that you meet this requirement.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">4. Homeowner Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">As a homeowner using Homezy, you agree to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Provide accurate information about your service needs and property</li>
                  <li>Communicate honestly with professionals</li>
                  <li>Make payment arrangements directly with the professional you hire</li>
                  <li>Leave honest reviews based on your actual experience</li>
                  <li>Not solicit professionals outside of the platform to avoid fees</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <strong>Free for Homeowners:</strong> Homezy is free for homeowners to use. There are
                  no fees to submit service requests or receive quotes.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">5. Professional Terms</h2>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">5.1 Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-4">As a professional using Homezy, you agree to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Maintain valid licenses and insurance as required by UAE law</li>
                  <li>Provide accurate information about your qualifications and experience</li>
                  <li>Respond to leads promptly and professionally</li>
                  <li>Complete work to the agreed-upon standards and timeline</li>
                  <li>Honor quoted prices unless changes are agreed in writing</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">5.2 Credits and Fees</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Professionals purchase credits to access homeowner leads</li>
                  <li>Credit prices vary based on estimated project value and category</li>
                  <li>Credits are generally non-refundable except for invalid leads</li>
                  <li>Refund requests for invalid leads must be submitted within 48 hours</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">5.3 Verification Benefits</h3>
                <p className="text-gray-700 leading-relaxed">
                  Verified professionals receive priority placement in search results, a verified badge
                  on their profile, and discounts on lead claims.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">6. Payments</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Payments for home improvement services are made directly between homeowners and professionals.
                  Homezy does not process payments for services performed. You should:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Agree on payment terms with your chosen professional before work begins</li>
                  <li>Never pay for services in full before work is completed</li>
                  <li>Keep records of all payments and agreements</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">7. Prohibited Activities</h2>
                <p className="text-gray-700 leading-relaxed mb-4">Users may not:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Engage in fraudulent or deceptive practices</li>
                  <li>Post false, misleading, or defamatory content</li>
                  <li>Manipulate reviews or ratings</li>
                  <li>Circumvent the Platform to avoid fees</li>
                  <li>Use automated systems (bots) without authorization</li>
                  <li>Harass, threaten, or abuse other users</li>
                  <li>Create multiple accounts to abuse promotions</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">8. Intellectual Property</h2>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">8.1 Platform Content</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Platform and its content, features, and functionality are owned by Homezy and
                  are protected by copyright, trademark, and other intellectual property laws.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">8.2 User Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain ownership of content you submit to the Platform. By submitting content,
                  you grant Homezy a worldwide, non-exclusive, royalty-free license to use, reproduce,
                  and display your content for the purpose of operating and promoting the Platform.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">9. Disclaimers and Limitation of Liability</h2>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">9.1 Platform &quot;As Is&quot;</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                  either express or implied. Homezy does not guarantee that the Platform will be
                  uninterrupted, secure, or error-free.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">9.2 Third-Party Services</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Homezy is a marketplace platform. We are not a party to transactions between homeowners
                  and professionals. We do not guarantee the quality, safety, or legality of services,
                  the accuracy of listings, or the ability of professionals to complete work.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">9.3 Limitation of Liability</h3>
                <p className="text-gray-700 leading-relaxed">
                  To the maximum extent permitted by law, Homezy shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages arising from your use of the
                  Platform. Our total liability shall not exceed the fees paid by you in the twelve
                  months preceding the claim.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">10. Indemnification</h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify and hold harmless Homezy, its affiliates, and their respective
                  officers, directors, employees, and agents from any claims, damages, losses, liabilities,
                  and expenses (including legal fees) arising from your use of the Platform or violation
                  of these Terms.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">11. Termination</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to suspend or terminate your account at any time for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Violation of these Terms</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Consistent poor ratings or complaints</li>
                  <li>Inactivity for an extended period</li>
                  <li>Any reason at our discretion</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You may terminate your account at any time through account settings or by contacting support.
                  Termination does not relieve you of obligations incurred prior to termination.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">12. Dispute Resolution</h2>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">12.1 Governing Law</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of the
                  United Arab Emirates.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">12.2 Arbitration</h3>
                <p className="text-gray-700 leading-relaxed">
                  Any disputes arising from these Terms or your use of the Platform shall be resolved
                  through binding arbitration in Dubai, UAE, in accordance with the arbitration rules
                  of the Dubai International Arbitration Centre (DIAC).
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">13. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of material
                  changes via email or through the Platform. Your continued use of the Platform after
                  changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">14. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions about these Terms, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-900 font-medium mb-2">Avik Smart Home Services FZ-LLC</p>
                  <p className="text-gray-700 mb-1">
                    Email: <a href="mailto:legal@homezy.co" className="text-primary-600 hover:text-primary-700">legal@homezy.co</a>
                  </p>
                  <p className="text-gray-700 mb-1">
                    Phone: <a href="tel:+971507730455" className="text-primary-600 hover:text-primary-700">+971 50 773 0455</a>
                  </p>
                  <p className="text-gray-700">
                    Address: D-66, DSO HQ, Dubai Silicon Oasis, Dubai, UAE
                  </p>
                </div>
              </section>

              <div className="border-t border-gray-200 pt-8 mt-12">
                <p className="text-sm text-gray-500 text-center">
                  By using Homezy, you acknowledge that you have read, understood, and agree to be bound
                  by these Terms of Service and our{' '}
                  <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

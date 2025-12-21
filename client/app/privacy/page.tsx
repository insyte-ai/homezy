import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata = {
  title: 'Privacy Policy - Homezy',
  description: 'Learn how Homezy collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 to-white py-16 border-b border-gray-200">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-normal text-gray-900 mb-4">
                Privacy Policy
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
                  <strong>Your Privacy Matters:</strong> This Privacy Policy explains how Homezy
                  collects, uses, and protects your personal information. We are committed to
                  maintaining the privacy and security of your data.
                </p>
              </div>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Avik Smart Home Services FZ-LLC (&quot;Homezy&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates
                  the Homezy home services marketplace platform (the &quot;Platform&quot;). This Privacy
                  Policy describes how we collect, use, disclose, and safeguard your information
                  when you use our Platform.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using the Platform, you consent to the data practices described in this policy.
                  If you do not agree with this policy, please do not access or use the Platform.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">2. Information We Collect</h2>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">2.1 Information You Provide</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
                  <li><strong>Profile Information:</strong> Profile photo, address, and property details</li>
                  <li><strong>Professional Information:</strong> For pros - business name, trade license, Emirates ID, certifications, and portfolio</li>
                  <li><strong>Service Requests:</strong> Project descriptions, photos, location, and preferences</li>
                  <li><strong>Communications:</strong> Messages, reviews, and feedback you send to us or other users</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">2.2 Information Collected Automatically</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you access or use the Platform, we automatically collect:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                  <li><strong>Usage Information:</strong> Pages viewed, features used, time spent on pages, and navigation paths</li>
                  <li><strong>Location Information:</strong> General geographic location based on IP address or with your permission</li>
                  <li><strong>Cookies and Similar Technologies:</strong> Information stored in cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Provide, maintain, and improve the Platform</li>
                  <li>Create and manage your account</li>
                  <li>Match homeowners with suitable professionals</li>
                  <li>Verify professional credentials and business information</li>
                  <li>Process transactions and send transaction notifications</li>
                  <li>Facilitate communication between homeowners and professionals</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send administrative information, updates, and security alerts</li>
                  <li>Analyze Platform usage and improve user experience</li>
                  <li>Detect, prevent, and address fraud, security issues, and technical problems</li>
                  <li>Comply with legal obligations and enforce our Terms of Service</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">4. How We Share Your Information</h2>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">4.1 With Other Users</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you submit a service request, relevant information is shared with professionals
                  who may provide quotes. When professionals claim leads, their profile information
                  is shared with homeowners.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">4.2 Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We share information with third-party service providers who perform services on our behalf, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Cloud hosting and storage services</li>
                  <li>Email and communication services</li>
                  <li>Analytics and performance monitoring</li>
                  <li>Customer support tools</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may disclose your information if required by law or in response to legal processes,
                  court orders, or government requests. We may also disclose information to protect the
                  rights, property, or safety of Homezy, our users, or the public.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We use cookies and similar tracking technologies to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your account and maintain security</li>
                  <li>Analyze Platform usage and performance</li>
                  <li>Provide personalized content and features</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can control cookies through your browser settings. However, disabling cookies may
                  limit your ability to use certain features of the Platform.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">6. Data Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures to protect your information, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security assessments and updates</li>
                  <li>Employee training on data protection</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  However, no method of transmission over the Internet or electronic storage is 100% secure.
                  While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">7. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your information for as long as necessary to provide our services and maintain
                  your account, comply with legal obligations, resolve disputes, and enforce our agreements.
                  When information is no longer needed, we will securely delete or anonymize it.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">8. Your Privacy Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">8.1 Access and Portability</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to access and receive a copy of your personal information.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">8.2 Correction</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can update or correct your account information at any time through your account settings.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">8.3 Deletion</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may request deletion of your account and personal information, subject to legal retention requirements.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">8.4 Marketing Communications</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can opt out of marketing emails by clicking the &quot;unsubscribe&quot; link in any marketing
                  email or updating your communication preferences in your account settings.
                </p>

                <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">8.5 Exercising Your Rights</h3>
                <p className="text-gray-700 leading-relaxed">
                  To exercise any of these rights, please contact us at{' '}
                  <a href="mailto:privacy@homezy.co" className="text-primary-600 hover:text-primary-700 underline">
                    privacy@homezy.co
                  </a>. We will respond to your request within a reasonable timeframe.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country
                  of residence. These countries may have different data protection laws. We ensure appropriate
                  safeguards are in place to protect your information in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Platform is intended for users who are at least 18 years old. We do not knowingly
                  collect personal information from children. If we become aware that we have collected
                  information from a child, we will take steps to delete such information.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of material changes
                  by posting the updated policy on the Platform and updating the &quot;Last Updated&quot; date. Your
                  continued use of the Platform after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-medium text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-900 font-medium mb-2">Avik Smart Home Services FZ-LLC</p>
                  <p className="text-gray-700 mb-1">
                    Email: <a href="mailto:privacy@homezy.co" className="text-primary-600 hover:text-primary-700">privacy@homezy.co</a>
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
                  By using Homezy, you acknowledge that you have read and understood this Privacy Policy.
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

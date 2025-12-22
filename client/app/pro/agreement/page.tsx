'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProAgreementPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/pro/onboarding"
            className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Onboarding
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          <article className="prose prose-neutral max-w-none">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Homezy Professional Participation Agreement
            </h1>
            <p className="text-sm text-neutral-500 mb-8">
              <strong>Version 1.0</strong> | Last Updated: December 2024
            </p>

            <hr className="my-8" />

            <h2>1. Agreement Title and Parties</h2>
            <p>
              This Homezy Professional Participation Agreement (&quot;Agreement&quot;) is entered into between:
            </p>
            <ul>
              <li><strong>Avik Smart Home Services FZ-LLC</strong>, operating the online platform Homezy.co in the United Arab Emirates (&quot;Homezy&quot;), and</li>
              <li><strong>The individual or entity</strong> registering as a home professional or service provider on Homezy.co (&quot;Professional&quot;).</li>
            </ul>
            <p>
              By creating a professional account, listing services, or claiming leads on Homezy.co, the Professional agrees to be bound by this Agreement and all policies referenced in it.
            </p>

            <hr className="my-8" />

            <h2>2. Purpose of the Platform</h2>
            <p>
              Homezy.co is a UAE-based online platform that connects homeowners with home professionals for design, renovation, repair, maintenance, and related home services.
            </p>
            <p><strong>The Platform enables homeowners to:</strong></p>
            <ul>
              <li>Browse Professional profiles and request to contact them.</li>
              <li>Submit job requests or project briefs visible to eligible Professionals.</li>
            </ul>
            <p><strong>Professionals use the Platform to:</strong></p>
            <ul>
              <li>Present their services and portfolio.</li>
              <li>Receive inquiries and claim leads.</li>
            </ul>
            <p>
              <strong>Important:</strong> Homezy is not a party to any service contracts between homeowners and Professionals and acts only as an intermediary to facilitate discovery and communication.
            </p>

            <hr className="my-8" />

            <h2>3. Professional Registration and Eligibility</h2>
            <p>3.1. Professionals must provide accurate and complete information during registration, including:</p>
            <ul>
              <li>Legal name and contact person</li>
              <li>Trade licence details (if applicable)</li>
              <li>Service categories and service areas</li>
            </ul>
            <p>
              3.2. Professionals must be legally entitled to provide their listed services in the UAE and must comply with all applicable UAE laws and regulations relevant to their trade.
            </p>
            <p>
              3.3. Homezy may request supporting documents, verify information, and approve, suspend, or reject Professional accounts at its discretion.
            </p>

            <hr className="my-8" />

            <h2>4. Service Listings, Profiles, and Conduct</h2>
            <p>
              4.1. Professionals may create a profile and list services, portfolios, and descriptions free of charge (no listing fee).
            </p>
            <p>4.2. All information, images, and descriptions must be:</p>
            <ul>
              <li>Truthful and not misleading</li>
              <li>Related to the Professional&apos;s actual services</li>
            </ul>
            <p>4.3. <strong>Professionals must not:</strong></p>
            <ul>
              <li>Post illegal, obscene, pornographic, defamatory, hateful, discriminatory, or otherwise offensive content.</li>
              <li>Post content that infringes intellectual property or privacy rights of third parties.</li>
              <li>Include direct contact details (such as phone numbers, email addresses, website URLs, social media handles, QR codes, or any other direct contact information) in profile names, descriptions, photos, or other public fields, where prohibited by Platform rules.</li>
              <li>Upload viruses, malware, or any harmful code.</li>
              <li>Manipulate reviews, ratings, or testimonials (including fake reviews or undisclosed incentives for positive reviews).</li>
              <li>Use abusive, harassing, threatening, or discriminatory language or imagery.</li>
            </ul>
            <p>
              4.4. Homezy may edit, hide, or remove content that violates this Agreement or its policies.
            </p>

            <hr className="my-8" />

            <h2>5. Leads, Credits, and Payments</h2>
            <p>5.1. Homezy offers two main ways for homeowners to engage Professionals:</p>
            <ul>
              <li><strong>Direct requests:</strong> &quot;Contact Professional&quot; requests from a Professional&apos;s profile.</li>
              <li><strong>Job requests:</strong> Project requests submitted by homeowners and visible to eligible Professionals.</li>
            </ul>
            <p>
              5.2. Each inquiry or project that can be claimed by a Professional is a &quot;lead.&quot; To claim a lead, the Professional must use credits, which are purchased or allocated via the Platform.
            </p>
            <p>
              5.3. The number of credits required for a lead depends on the estimated project value or category and is clearly shown before claiming.
            </p>
            <p>5.4. <strong>When a Professional claims a lead and confirms payment:</strong></p>
            <ul>
              <li>The corresponding credits will be deducted from the Professional&apos;s balance.</li>
              <li>The Professional will receive homeowner contact details or a communication channel as per Platform design.</li>
            </ul>
            <p>
              5.5. Credits are non-refundable once a lead is claimed, even if the homeowner does not proceed, unless explicitly stated otherwise in a specific promotion or policy.
            </p>

            <hr className="my-8" />

            <h2>6. Fees, Credits, and Non-Refundability</h2>
            <p>
              6.1. Listing on Homezy.co is free. Homezy monetizes by selling credits used to claim leads or by other paid features that may be introduced.
            </p>
            <p>6.2. <strong>Credits may be:</strong></p>
            <ul>
              <li>Purchased by the Professional using available payment methods on the Platform.</li>
              <li>Awarded as part of promotions or loyalty programs.</li>
            </ul>
            <p>6.3. Unless mandated by UAE law or expressly provided in a written policy, credits and any related fees are:</p>
            <ul>
              <li><strong>Non-refundable</strong></li>
              <li><strong>Non-transferable</strong> between accounts</li>
              <li><strong>Valid for twelve (12) months</strong> from the date of purchase or allocation, unless a different validity period is communicated at the time of purchase or award</li>
            </ul>
            <p>
              6.4. Homezy may adjust pricing, credit packages, and lead pricing upon reasonable notice on the Platform or by email.
            </p>

            <hr className="my-8" />

            <h2>7. Contact Rules and Anti-Circumvention</h2>
            <p>
              7.1. Professionals must keep all initial communication with homeowners within the Platform&apos;s communication tools where required by Homezy.
            </p>
            <p>7.2. <strong>Professionals shall not:</strong></p>
            <ul>
              <li>Circumvent Homezy by encouraging homeowners to delete, bypass, or avoid the Platform for initial lead acquisition.</li>
              <li>Insert contact details in profile fields or posts where such details are restricted.</li>
              <li>Misuse any homeowners&apos; data obtained via the Platform to send unsolicited marketing or spam unrelated to the specific leads or services.</li>
            </ul>
            <p>
              7.3. Once a connection has been lawfully established and subject to Platform rules, Professionals and homeowners may agree on preferred communication channels for ongoing project coordination.
            </p>

            <hr className="my-8" />

            <h2>8. Role of Homezy and Professional&apos;s Responsibility</h2>
            <p>
              8.1. Homezy is not a contractor, employer, or agent of the Professional and does not guarantee any particular number of leads, projects, or revenue.
            </p>
            <p>8.2. <strong>The Professional is solely responsible for:</strong></p>
            <ul>
              <li>The quality, safety, and legality of services provided to homeowners.</li>
              <li>Obtaining and maintaining all licences, approvals, and insurances required under UAE law (e.g., trade licence, municipality approvals, professional liability insurance where applicable).</li>
              <li>Negotiating service scope, pricing, timing, warranties, and other terms directly with homeowners.</li>
            </ul>
            <p>
              8.3. Any agreement for services is strictly between the Professional and the homeowner. Homezy is not responsible for execution, quality, delays, damages, or payment between the parties.
            </p>

            <hr className="my-8" />

            <h2>9. Content Ownership and Intellectual Property</h2>
            <p>
              9.1. The Professional retains ownership of its own content (photos, logos, descriptions, project images).
            </p>
            <p>
              9.2. The Professional grants Homezy a non-exclusive, worldwide, royalty-free licence to use, reproduce, display, modify, and distribute such content on Homezy.co and in related marketing or promotional materials.
            </p>
            <p>
              9.3. The Professional warrants that it has all necessary rights to such content and that it does not infringe third-party rights.
            </p>
            <p>
              9.4. Homezy may remove or disable content suspected to be infringing or inappropriate.
            </p>

            <hr className="my-8" />

            <h2>10. Professional Conduct and Legal Compliance</h2>
            <p>
              10.1. Professionals must maintain high standards of professional behaviour on the Platform and comply with all applicable UAE laws and regulations, including:
            </p>
            <ul>
              <li>Federal Decree-Law No. 45/2021 on Personal Data Protection</li>
              <li>Consumer protection regulations (as applicable)</li>
              <li>Cybercrime laws</li>
              <li>Advertising and trade regulations</li>
            </ul>
            <p>
              10.2. Professionals should respond to claimed leads within a reasonable timeframe (recommended: within 48 hours) to maintain good standing on the Platform.
            </p>

            <hr className="my-8" />

            <h2>11. Privacy, Data Use, and Confidentiality</h2>
            <p>
              11.1. Homezy will handle personal data in accordance with its Privacy Policy and UAE Federal Decree-Law No. 45/2021 on Personal Data Protection.
            </p>
            <p>11.2. <strong>Professionals may only use homeowners&apos; personal data obtained through Homezy for:</strong></p>
            <ul>
              <li>Responding to the specific inquiry or job request.</li>
              <li>Performing the agreed services and reasonable after-sales support.</li>
            </ul>
            <p>
              11.3. Professionals may not sell, share, or use such data for unrelated marketing without proper legal basis and any required consent.
            </p>
            <p>
              11.4. Both parties must keep non-public, confidential information of the other party secure and use it only for purposes of this Agreement.
            </p>

            <hr className="my-8" />

            <h2>12. Reviews, Ratings, and Dispute Handling</h2>
            <p>
              12.1. Homeowners may leave reviews and ratings about Professionals on the Platform.
            </p>
            <p>
              12.2. Homezy may moderate, publish, highlight, de-rank, or remove reviews at its discretion, in accordance with its policies.
            </p>
            <p>
              12.3. Professionals may respond to reviews but must do so politely and professionally.
            </p>
            <p>
              12.4. For disputes between homeowners and Professionals, Homezy may, but is not obligated to, assist with communication or mediation as a neutral intermediary. Homezy is not liable for any outcome of such disputes.
            </p>

            <hr className="my-8" />

            <h2>13. Suspension, Termination, and Consequences</h2>
            <p>13.1. <strong>Homezy may suspend or terminate a Professional&apos;s account, reduce visibility, or restrict access to features without prior notice if:</strong></p>
            <ul>
              <li>The Professional violates this Agreement or Platform policies.</li>
              <li>The Professional posts illegal, obscene, or harmful content.</li>
              <li>There are multiple serious complaints or evidence of fraud, non-performance, or unsafe work.</li>
              <li>Required licences or legal permissions appear invalid or expire.</li>
            </ul>
            <p>
              13.2. The Professional may terminate its account by following the prescribed process on the Platform.
            </p>
            <p>
              13.3. Upon account termination, the Professional may request export of their own content and data, subject to technical feasibility and applicable law.
            </p>
            <p>
              13.4. Suspension or termination does not entitle the Professional to refunds of unused credits unless required by applicable law or explicitly stated by Homezy.
            </p>
            <p>
              13.5. Clauses about intellectual property, confidentiality, limitation of liability, and similar terms survive termination.
            </p>

            <hr className="my-8" />

            <h2>14. Limitation of Liability and Indemnity</h2>
            <p>
              14.1. To the maximum extent permitted by UAE law, Homezy is not liable for any indirect, incidental, consequential, or punitive damages, or for loss of profit, goodwill, or business opportunities arising from the use of the Platform.
            </p>
            <p>
              14.2. Homezy&apos;s total aggregate liability to any Professional, if any, shall not exceed the total fees paid by that Professional to Homezy for credits in the three (3) months immediately preceding the event giving rise to the claim.
            </p>
            <p>14.3. <strong>The Professional agrees to indemnify and hold harmless Homezy, its affiliates, and personnel against any claims, losses, damages, costs, and expenses arising from:</strong></p>
            <ul>
              <li>The Professional&apos;s services, work quality, or conduct.</li>
              <li>Breach of this Agreement or Platform policies.</li>
              <li>Violation of UAE law or third-party rights by the Professional.</li>
            </ul>

            <hr className="my-8" />

            <h2>15. Force Majeure</h2>
            <p>
              15.1. Neither party shall be liable for any failure or delay in performing its obligations under this Agreement if such failure or delay results from circumstances beyond the reasonable control of that party, including but not limited to:
            </p>
            <ul>
              <li>Natural disasters, acts of God, or severe weather events</li>
              <li>War, terrorism, civil unrest, or government actions</li>
              <li>Pandemics, epidemics, or public health emergencies</li>
              <li>Cyberattacks, infrastructure failures, or telecommunications outages</li>
              <li>Changes in applicable laws or regulations</li>
            </ul>
            <p>
              15.2. The affected party shall notify the other party as soon as reasonably practicable and use reasonable efforts to mitigate the effects of the force majeure event.
            </p>

            <hr className="my-8" />

            <h2>16. Governing Law and Jurisdiction (UAE)</h2>
            <p>
              16.1. This Agreement is governed by the laws of the United Arab Emirates, as applied in the Emirate of Dubai.
            </p>
            <p>16.2. <strong>Dispute Resolution Process:</strong></p>
            <ul>
              <li>The parties shall first attempt to resolve any dispute through good-faith negotiation within fifteen (15) days.</li>
              <li>If unresolved, the parties may engage in mediation for an additional fifteen (15) days.</li>
              <li>Any dispute that cannot be resolved within thirty (30) days shall be submitted to the exclusive jurisdiction of the courts of Dubai (on-shore), unless the parties agree in writing to alternative dispute resolution such as arbitration.</li>
            </ul>

            <hr className="my-8" />

            <h2>17. Amendments and Entire Agreement</h2>
            <p>
              17.1. Homezy may update this Agreement and related policies from time to time by publishing revised versions on the Platform or notifying Professionals by email.
            </p>
            <p>
              17.2. Material changes will be communicated at least fourteen (14) days before taking effect, where practicable.
            </p>
            <p>
              17.3. Continued use of the Platform after such updates constitutes acceptance of the updated terms.
            </p>
            <p>
              17.4. This Agreement, together with the Platform Terms of Use, Privacy Policy, and applicable guidelines, forms the entire agreement between Homezy and the Professional concerning participation on Homezy.co.
            </p>

            <hr className="my-8" />

            <h2>18. Acceptance</h2>
            <p>
              By registering as a Professional, completing the onboarding steps, purchasing credits, listing services, or claiming leads on Homezy.co, the Professional acknowledges having read, understood, and agreed to this Homezy Professional Participation Agreement.
            </p>

            <hr className="my-8" />

            <div className="bg-neutral-100 rounded-lg p-4 mt-8">
              <p className="text-sm text-neutral-600 mb-1"><strong>Document Information:</strong></p>
              <ul className="text-sm text-neutral-600 list-none pl-0">
                <li>Version: 1.0</li>
                <li>Last Updated: December 2024</li>
                <li>Document ID: HOMEZY-PRO-AGREEMENT-V1</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

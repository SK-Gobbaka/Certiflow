import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-6">Terms of Service</h1>
      
      <div className="space-y-6 text-muted">
        <p><strong>Last Updated:</strong> October 8, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Certiflow, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">2. Description of Service</h2>
          <p>
            Certiflow is a tool designed to help users generate and send customized certificates via email to a list of participants.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">3. User Conduct</h2>
          <p>You agree to use Certiflow only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others or otherwise cause damage to the site or the content. You agree not to use Certiflow to send spam or unsolicited emails.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">4. Google Account Integration</h2>
          <p>
            Our service allows you to connect your Google account to send emails using the Gmail API. By using this feature, you grant us permission to send emails on your behalf as explicitly requested by you within the app. You are responsible for ensuring that your use of the email sending feature complies with Google's terms and any applicable anti-spam legislation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">5. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an "as is" and "as available" basis. We disclaim all warranties of any kind, whether express or implied, including, but not limited to the implied warranties of merchantability, fitness for a particular purpose and non-infringement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">6. Limitation of Liability</h2>
          <p>
            We shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use or the inability to use the service.
          </p>
        </section>
      </div>
    </div>
  );
}

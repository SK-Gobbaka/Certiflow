import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink mb-6">Privacy Policy</h1>
      
      <div className="space-y-6 text-muted">
        <p><strong>Last Updated:</strong> October 8, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">1. Introduction</h2>
          <p>
            Welcome to Certiflow ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">2. Data We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you, including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Identity Data:</strong> First name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> Email address.</li>
            <li><strong>Google API Data:</strong> Our application accesses your Gmail account to send certificates on your behalf. We only request the minimum permissions required to send emails (<code>https://www.googleapis.com/auth/gmail.send</code>). We do not read, store, or share your incoming emails.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">3. How We Use Your Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>To provide the Certiflow service (generating and emailing certificates).</li>
            <li>To manage our relationship with you.</li>
            <li>To improve our website, products/services, marketing or customer relationships.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">4. Google Workspace APIs</h2>
          <p>
            Certiflow's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-seal hover:underline" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
          </p>
          <p className="mt-2">
            We do not use your Google Workspace API data for developing, improving, or training generalized AI and/or ML models.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">5. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink mb-3">6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us.
          </p>
        </section>
      </div>
    </div>
  );
}

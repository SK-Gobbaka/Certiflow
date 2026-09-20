import { useGoogleLogin } from '@react-oauth/google'
import { useStore } from '../lib/store'

export default function LandingPage() {
  const { setToken } = useStore()

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/gmail.send',
    onSuccess: (codeResponse) => setToken(codeResponse.access_token),
    onError: (error) => console.log('Login Failed:', error)
  })

  return (
    <div className="flex flex-col items-center bg-page min-h-full">
      {/* 1. Hero Section */}
      <section className="w-full max-w-6xl px-5 py-20 md:py-24 mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-8">
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-ink drop-shadow-sm">
            Automate Your Certificates <br />
            <span className="text-seal">in Minutes.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted max-w-2xl md:mx-0 mx-auto leading-relaxed">
            Upload your participants, design your template, and dispatch personalized certificates directly from your Gmail account. Zero hassle, zero backend.
          </p>
          <div className="mt-10 flex justify-center md:justify-start">
            <button
              onClick={() => login()}
              className="rounded-full bg-ink px-10 py-4 text-lg font-bold text-white shadow-xl hover:brightness-125 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google to Start
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md mx-auto relative flex justify-center animate-fade-in-up">
          <img
            src="/hero.png"
            alt="CertiFlow Envelope"
            className="w-full h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
      </section>

      {/* 2. About Us */}
      <section className="w-full max-w-6xl px-5 py-16 text-center">
        <div className="bg-paper p-10 md:p-16 rounded-[2rem] border border-line shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-seal-soft rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-page rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>

          <h2 className="relative font-display text-3xl md:text-4xl font-bold text-ink mb-6">About CertiFlow</h2>
          <p className="relative text-lg text-muted max-w-3xl mx-auto leading-relaxed">
            CertiFlow was built to eliminate the tedious, manual work involved in generating and emailing certificates for events, workshops, and courses. We believe that recognizing achievements should be fast, free, and completely secure. By processing everything directly in your browser and dispatching via your own Google account, we've created a zero-friction tool that respects your privacy and saves you hours of time.
          </p>
        </div>
      </section>

      {/* 3. Steps Section */}
      <section className="w-full max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-bold text-center text-ink mb-12">How it works</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Upload Participants',
              desc: 'Drop in a CSV with names and emails.'
            },
            {
              step: '02',
              title: 'Upload Template',
              desc: 'Provide your certificate background (PNG/JPG).'
            },
            {
              step: '03',
              title: 'Customize Email',
              desc: 'Draft a personalized message for your attendees.'
            },
            {
              step: '04',
              title: 'Dispatch',
              desc: 'Generate PDFs and send them instantly via Gmail.'
            }
          ].map((s, i) => (
            <div key={i} className="bg-paper p-8 rounded-2xl shadow-sm border border-line flex flex-col items-center text-center hover:border-seal hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-seal-soft text-seal flex items-center justify-center font-display font-bold text-2xl mb-6">
                {s.step}
              </div>
              <h3 className="font-bold text-ink text-xl mb-3">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Rules and Regulations */}
      <section className="w-full max-w-4xl px-5 py-16 mb-8">
        <h2 className="font-display text-3xl font-bold text-center text-ink mb-12">Rules & Regulations</h2>
        <div className="bg-paper rounded-2xl border border-line p-8 md:p-12 shadow-sm text-sm text-muted space-y-8 leading-relaxed">
          <div>
            <h3 className="font-bold text-ink text-lg mb-2">1. Anti-Spam Policy</h3>
            <p className="text-base">You must have explicit permission to send emails to the participants listed in your CSV. Do not use CertiFlow to distribute unsolicited emails, spam, phishing links, or any malicious content. Doing so violates Google's API policies and will result in your account being restricted.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink text-lg mb-2">2. Gmail Rate Limits</h3>
            <p className="text-base">Because CertiFlow sends emails directly through your personal or workspace Gmail account, you are subject to Google's standard sending limits (typically 500 emails per day for standard accounts, or 2,000 for Google Workspace accounts). We recommend batching large events.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink text-lg mb-2">3. Data Privacy & Local Processing</h3>
            <p className="text-base">CertiFlow operates entirely on the client-side. We do not operate a backend server that stores your participants' names, emails, or the generated certificates. Your data passes directly from your browser to Google's API. By using this service, you acknowledge that you are responsible for the data you process.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink text-lg mb-2">4. Provided "As Is"</h3>
            <p className="text-base">This software is provided "as is", without warranty of any kind. We are not liable for any issues arising from the delivery failure of emails, incorrect template configurations, or account restrictions imposed by Google due to misuse.</p>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="w-full max-w-6xl px-5 py-20 mb-16 bg-ink rounded-[2.5rem] text-white text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-seal blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">Ready to Automate?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg mb-10 leading-relaxed">
            Stop wasting hours manually creating PDFs and sending repetitive emails. Join now and dispatch your first batch in seconds.
          </p>
          <button
            onClick={() => login()}
            className="rounded-full bg-seal px-10 py-4 text-lg font-bold text-white shadow-lg hover:brightness-110 transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            Sign in with Google
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="w-full bg-paper border-t border-line py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between text-sm text-muted">
          <div className="flex items-center mb-4 md:mb-0">
            <img src="/logo.png" alt="CertiFlow Logo" className="h-6 w-auto" />
          </div>
          <div className="text-center md:text-left">
            <p>© {new Date().getFullYear()} CertiFlow. All rights reserved.</p>
            <p className="text-xs mt-1">Built for speed, security, and simplicity.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

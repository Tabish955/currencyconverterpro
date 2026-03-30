import { ArrowLeft, Shield, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'hsl(var(--converter-bg))', color: 'hsl(var(--converter-text))' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm transition-colors hover:opacity-80"
          style={{ color: 'hsl(var(--converter-accent))' }}>
          <ArrowLeft className="h-4 w-4" /> Back to Converter
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8" style={{ color: 'hsl(var(--converter-accent))' }} />
          <h1 className="text-3xl font-black" style={{
            background: 'linear-gradient(135deg, hsl(234 89% 74%), hsl(262 83% 68%))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'hsl(var(--converter-text-muted))' }}>
          <p><strong style={{ color: 'hsl(var(--converter-text))' }}>Last updated:</strong> March 2026</p>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>1. Information We Collect</h2>
            <p>Currency Converter Pro does not collect personal information. We do not require user registration or accounts. The only data stored locally in your browser includes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Cached exchange rates (for offline functionality)</li>
              <li>Your lite mode preference</li>
              <li>Recent currency pair selections</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>2. Cookies & Local Storage</h2>
            <p>We use browser local storage to cache exchange rates and your preferences. No tracking cookies are used. No data is sent to any analytics service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>3. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong style={{ color: 'hsl(var(--converter-text))' }}>fawazahmed0 Exchange API</strong> – for currency exchange rate data</li>
              <li><strong style={{ color: 'hsl(var(--converter-text))' }}>jsDelivr CDN</strong> – for cryptocurrency icon assets</li>
              <li><strong style={{ color: 'hsl(var(--converter-text))' }}>flag-icons</strong> – for country flag icons</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>4. Data Security</h2>
            <p>All data is stored locally in your browser. We do not transmit personal data to any server. API requests to fetch exchange rates do not include any personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>5. Children's Privacy</h2>
            <p>Our Service is not directed at children under 13. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>6. Changes to Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>7. Contact</h2>
            <p>For privacy concerns, contact the owner Tabish via WhatsApp at <a href="https://wa.me/923142839944" className="underline" style={{ color: 'hsl(var(--converter-accent))' }}>+92 314 2839944</a>.</p>
          </section>
        </div>

        <div className="mt-12 mb-8 pt-6 border-t" style={{ borderColor: 'hsl(var(--converter-border))' }}>
          <Link to="/terms" className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: 'hsl(var(--converter-accent))' }}>
            <FileText className="h-4 w-4" /> View Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

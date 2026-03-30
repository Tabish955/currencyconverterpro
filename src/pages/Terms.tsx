import { ArrowLeft, Shield, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'hsl(var(--converter-bg))', color: 'hsl(var(--converter-text))' }}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm transition-colors hover:opacity-80"
          style={{ color: 'hsl(var(--converter-accent))' }}>
          <ArrowLeft className="h-4 w-4" /> Back to Converter
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-8 w-8" style={{ color: 'hsl(var(--converter-accent))' }} />
          <h1 className="text-3xl font-black" style={{
            background: 'linear-gradient(135deg, hsl(234 89% 74%), hsl(262 83% 68%))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Terms of Service</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'hsl(var(--converter-text-muted))' }}>
          <p><strong style={{ color: 'hsl(var(--converter-text))' }}>Last updated:</strong> March 2026</p>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>1. Acceptance of Terms</h2>
            <p>By accessing and using Currency Converter Pro ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>2. Service Description</h2>
            <p>Currency Converter Pro provides real-time and historical currency exchange rate information for educational and informational purposes. We aggregate data from third-party APIs and do not guarantee the accuracy, completeness, or timeliness of exchange rates.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>3. Disclaimer</h2>
            <p>Exchange rates displayed are for informational purposes only and should not be used as the sole basis for financial decisions. Actual exchange rates may vary. We are not responsible for any financial losses resulting from the use of this Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>4. Data Sources</h2>
            <p>We use the open-source fawazahmed0 Exchange API for currency data. Rates are updated regularly but may experience delays. Historical data availability depends on the source API.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>5. Intellectual Property</h2>
            <p>All content, design, and functionality of Currency Converter Pro are the property of the Service owner. You may not reproduce, distribute, or create derivative works without prior written consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>6. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of this Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>7. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'hsl(var(--converter-text))' }}>8. Contact</h2>
            <p>For questions about these terms, contact the owner Tabish via WhatsApp at <a href="https://wa.me/923142839944" className="underline" style={{ color: 'hsl(var(--converter-accent))' }}>+92 314 2839944</a>.</p>
          </section>
        </div>

        <div className="mt-12 mb-8 pt-6 border-t" style={{ borderColor: 'hsl(var(--converter-border))' }}>
          <Link to="/privacy" className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
            style={{ color: 'hsl(var(--converter-accent))' }}>
            <Shield className="h-4 w-4" /> View Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;

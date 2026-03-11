import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeftRight, Globe, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative"
      style={{ background: 'hsl(var(--converter-bg))' }}
    >
      {/* Ambient glow orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
        style={{ background: 'radial-gradient(circle, hsl(234 89% 64% / 0.4), transparent 70%)' }}
      />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-25"
        style={{ background: 'radial-gradient(circle, hsl(262 83% 58% / 0.4), transparent 70%)' }}
      />
      <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
        style={{ background: 'radial-gradient(circle, hsl(142 76% 36% / 0.3), transparent 70%)' }}
      />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="particle particle-7"></div>
        <div className="particle particle-8"></div>
      </div>

      <div className="w-full max-w-5xl animate-fade-in z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-4 border"
            style={{
              background: 'hsl(var(--converter-card) / 0.6)',
              borderColor: 'hsl(var(--converter-border))',
              color: 'hsl(var(--converter-accent))',
            }}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>170+ World Currencies</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, hsl(234 89% 74%), hsl(262 83% 68%), hsl(234 89% 74%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 6s ease-in-out infinite',
            }}
          >
            Currency Converter
          </h1>
          <p className="text-sm md:text-base max-w-md mx-auto" style={{ color: 'hsl(var(--converter-text-muted))' }}>
            Real-time exchange rates with historical trends and AI-powered insights
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--converter-card) / 0.9), hsl(var(--converter-card) / 0.6))',
            borderColor: 'hsl(var(--converter-border) / 0.5)',
            boxShadow: '0 25px 60px -15px hsl(234 89% 64% / 0.15), 0 0 0 1px hsl(var(--converter-border) / 0.3), inset 0 1px 0 hsl(var(--converter-text) / 0.05)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="p-6 md:p-8">
            <CurrencyConverter />
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {[
            { icon: ArrowLeftRight, label: "Live Rates" },
            { icon: Shield, label: "Accurate Data" },
            { icon: Globe, label: "ISO 4217 Standard" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{
                color: 'hsl(var(--converter-text-muted))',
                background: 'hsl(var(--converter-card) / 0.4)',
                border: '1px solid hsl(var(--converter-border) / 0.3)',
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Toaster position="top-center" theme="dark" />
    </div>
  );
};

export default Index;

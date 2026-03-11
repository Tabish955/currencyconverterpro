import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  inline?: boolean;
}

const ErrorDisplay = ({ message, onRetry, inline = false }: ErrorDisplayProps) => {
  if (inline) {
    return (
      <div className="w-full rounded-xl p-3 mb-4 animate-fade-in border"
        style={{
          background: 'hsl(0 84% 60% / 0.08)',
          borderColor: 'hsl(0 84% 60% / 0.2)',
        }}
      >
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: 'hsl(0 84% 65%)' }} />
          <p className="text-sm flex-1" style={{ color: 'hsl(0 84% 70%)' }}>{message}</p>
          {onRetry && (
            <button onClick={onRetry}
              className="ml-auto text-xs font-medium px-3 py-1 rounded-lg flex items-center gap-1 border transition-all hover:scale-105"
              style={{
                background: 'hsl(0 84% 60% / 0.1)',
                borderColor: 'hsl(0 84% 60% / 0.2)',
                color: 'hsl(0 84% 70%)',
              }}
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-xl overflow-hidden animate-fade-in border"
      style={{
        background: 'hsl(var(--converter-card) / 0.8)',
        borderColor: 'hsl(var(--converter-border) / 0.5)',
      }}
    >
      <div className="p-6">
        <div className="flex items-center justify-center p-6 rounded-xl border"
          style={{
            background: 'hsl(0 84% 60% / 0.06)',
            borderColor: 'hsl(0 84% 60% / 0.15)',
          }}
        >
          <div className="relative mr-5">
            <div className="w-12 h-12 flex items-center justify-center rounded-full"
              style={{ background: 'hsl(0 84% 60% / 0.15)' }}
            >
              <AlertTriangle className="h-6 w-6" style={{ color: 'hsl(0 84% 65%)' }} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-1" style={{ color: 'hsl(0 84% 70%)' }}>Unable to Load Data</h3>
            <p className="text-sm" style={{ color: 'hsl(var(--converter-text-muted))' }}>{message}</p>
          </div>
        </div>
        {onRetry && (
          <div className="mt-6 text-center">
            <button onClick={onRetry}
              className="px-5 py-2.5 font-medium rounded-xl flex items-center justify-center mx-auto transition-all hover:scale-105 border"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--converter-accent) / 0.2), hsl(var(--converter-accent-glow) / 0.2))',
                borderColor: 'hsl(var(--converter-accent) / 0.3)',
                color: 'hsl(var(--converter-accent))',
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;

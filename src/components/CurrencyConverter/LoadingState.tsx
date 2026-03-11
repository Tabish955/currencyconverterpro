interface LoadingStateProps {
  message: string;
  attempt?: number;
}

const LoadingState = ({ message, attempt }: LoadingStateProps) => {
  return (
    <div className="w-full max-w-md mx-auto rounded-xl overflow-hidden animate-fade-in p-8"
      style={{
        background: 'hsl(var(--converter-card) / 0.6)',
        border: '1px solid hsl(var(--converter-border) / 0.5)',
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-full animate-spin"
            style={{ borderTop: '3px solid hsl(var(--converter-accent))', borderBottom: '3px solid transparent', borderLeft: '3px solid transparent', borderRight: '3px solid hsl(var(--converter-accent) / 0.3)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full animate-spin-slow"
              style={{ borderTop: '3px dotted hsl(var(--converter-accent-glow) / 0.5)', borderBottom: '3px solid transparent', borderLeft: '3px solid transparent', borderRight: '3px solid transparent' }}
            />
          </div>
        </div>
        <p className="text-lg font-medium" style={{ color: 'hsl(var(--converter-text))' }}>{message}</p>
        <p className="text-sm mt-2" style={{ color: 'hsl(var(--converter-text-muted))' }}>
          {attempt ? `Attempt ${attempt} of 3...` : 'Fetching exchange rates...'}
        </p>
      </div>
    </div>
  );
};

export default LoadingState;

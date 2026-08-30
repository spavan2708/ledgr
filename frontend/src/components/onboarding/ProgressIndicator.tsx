interface ProgressIndicatorProps { currentStep: number; labels: string[]; }

export function ProgressIndicator({ currentStep, labels }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Onboarding progress">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        <span>Step {currentStep + 1} of {labels.length}</span><span className="text-emerald-300">{labels[currentStep]}</span>
      </div>
      <div className="flex gap-2" aria-hidden="true">
        {labels.map((label, index) => <div key={label} className={`h-1.5 flex-1 rounded-full ${index <= currentStep ? "bg-emerald-400" : "bg-white/10"}`} />)}
      </div>
    </nav>
  );
}

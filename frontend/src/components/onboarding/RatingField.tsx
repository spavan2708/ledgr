interface RatingFieldProps {
  id: string;
  label: string;
  value: number;
  lowLabel: string;
  highLabel: string;
  onChange: (value: number) => void;
}

export function RatingField({ id, label, value, lowLabel, highLabel, onChange }: RatingFieldProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-slate-200">{label}</legend>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className={`cursor-pointer rounded-xl border py-3 text-center text-sm font-bold transition ${value === rating ? "border-emerald-400 bg-emerald-400 text-slate-950" : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-emerald-400/50"}`}>
            <input className="sr-only" type="radio" name={id} value={rating} checked={value === rating} onChange={() => onChange(rating)} />
            {rating}
          </label>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{lowLabel}</span><span>{highLabel}</span></div>
    </fieldset>
  );
}

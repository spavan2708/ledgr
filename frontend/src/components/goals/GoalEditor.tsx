import type { GoalInput } from "@/types/goals";

export function GoalEditor({ goal, index, onChange, onRemove, removable }: { goal: GoalInput; index: number; onChange: (goal: GoalInput) => void; onRemove: () => void; removable: boolean }) {
  const update = <K extends keyof GoalInput>(key: K, value: GoalInput[K]) => onChange({ ...goal, [key]: value });
  return <fieldset className="rounded-2xl border border-white/10 bg-black/15 p-5"><div className="mb-5 flex items-center justify-between"><legend className="text-lg font-bold text-white">Goal {index + 1}</legend>{removable && <button type="button" onClick={onRemove} className="text-sm font-semibold text-rose-300 hover:text-rose-200">Remove</button>}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Field label="Goal name"><input required value={goal.name} onChange={(event) => update("name", event.target.value)} className="goal-input" /></Field>
    <Field label="Category"><select value={goal.category} onChange={(event) => update("category", event.target.value as GoalInput["category"])} className="goal-input">{["emergency_reserve","education","vehicle","house","travel","business","retirement","wealth_creation","custom"].map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></Field>
    <Field label="Priority"><select value={goal.priority} onChange={(event) => update("priority", event.target.value as GoalInput["priority"])} className="goal-input">{["essential","high","medium","low"].map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></Field>
    <Money label="Target amount" value={goal.target_amount} onChange={(value) => update("target_amount", value)} min={1} />
    <Field label="Amount basis"><select value={goal.amount_basis} onChange={(event) => update("amount_basis", event.target.value as GoalInput["amount_basis"])} className="goal-input"><option value="today_value">Today&apos;s value</option><option value="future_value">Future value</option></select></Field>
    <Money label="Already saved" value={goal.current_saved} onChange={(value) => update("current_saved", value)} />
    <Field label="Timeline (months)"><input required type="number" min={1} max={600} value={goal.horizon_months} onChange={(event) => update("horizon_months", Number(event.target.value))} className="goal-input" /><small>{(goal.horizon_months / 12).toFixed(1)} years</small></Field>
    <Money label="Planned monthly contribution" value={goal.planned_monthly_contribution} onChange={(value) => update("planned_monthly_contribution", value)} />
    <Field label="Annual contribution step-up"><div className="goal-prefix"><input type="number" min={0} max={100} step={0.5} value={goal.annual_step_up_percentage} onChange={(event) => update("annual_step_up_percentage", Number(event.target.value))} className="goal-input !border-0" /><span>%</span></div></Field>
    <Field label="Flexibility"><select value={goal.flexibility} onChange={(event) => update("flexibility", event.target.value as GoalInput["flexibility"])} className="goal-input">{["fixed","somewhat_flexible","flexible"].map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></Field>
    <Field label="Inflation override (optional)"><div className="goal-prefix"><input type="number" min={0} max={20} step={0.1} value={goal.inflation_rate ?? ""} placeholder="Use scenario" onChange={(event) => update("inflation_rate", event.target.value === "" ? undefined : Number(event.target.value))} className="goal-input !border-0" /><span>%</span></div></Field>
    <Field label="Notes (optional)"><input maxLength={1000} value={goal.notes ?? ""} onChange={(event) => update("notes", event.target.value)} className="goal-input" /></Field>
  </div></fieldset>;
}

function Field({ label: text, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold text-slate-300"><span className="mb-2 block">{text}</span>{children}</label>; }
function Money({ label: text, value, onChange, min = 0 }: { label: string; value: number; onChange: (value: number) => void; min?: number }) { return <Field label={text}><div className="goal-prefix"><span>₹</span><input required type="number" min={min} step={100} value={value} onChange={(event) => onChange(Number(event.target.value))} className="goal-input !border-0" /></div></Field>; }
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

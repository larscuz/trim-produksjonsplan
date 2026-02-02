export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/30 px-3 py-2">
      <span className="text-sm text-zinc-200">{label}</span>
      <input
        type="checkbox"
        className="h-4 w-4 accent-white"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

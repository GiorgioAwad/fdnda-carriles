import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-surf focus:ring-2 focus:ring-surf/20 focus:shadow-[0_0_0_4px_rgba(15,139,168,0.08)] hover:border-slate-300",
        props.className
      )}
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-surf focus:ring-2 focus:ring-surf/20 focus:shadow-[0_0_0_4px_rgba(15,139,168,0.08)] hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400",
        props.className
      )}
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-surf focus:ring-2 focus:ring-surf/20 focus:shadow-[0_0_0_4px_rgba(15,139,168,0.08)] hover:border-slate-300",
        props.className
      )}
      {...props}
    />
  );
}

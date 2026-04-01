import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]",
        variant === "primary" && "bg-ink text-white shadow-sm hover:bg-ocean hover:shadow-md focus:ring-ocean",
        variant === "secondary" && "bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 hover:ring-slate-300 hover:shadow focus:ring-slate-200",
        variant === "ghost" && "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
        variant === "danger" && "bg-coral text-white shadow-sm hover:bg-red-600 hover:shadow-md focus:ring-coral",
        className
      )}
      {...props}
    />
  );
}

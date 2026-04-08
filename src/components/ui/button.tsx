import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95 shadow-sm hover:shadow-md",
        variant === "primary" && "bg-gradient-to-r from-surf to-ocean text-white border-transparent hover:from-ocean hover:to-ink",
        variant === "secondary" && "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 hover:text-slate-900",
        variant === "ghost" && "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none hover:shadow-none",
        variant === "danger" && "bg-gradient-to-r from-coral to-red-600 text-white hover:from-red-600 hover:to-red-700",
        className
      )}
      {...props}
    />
  );
}

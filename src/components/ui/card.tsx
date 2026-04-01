import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/60 bg-white/95 p-6 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-md transition-all duration-300 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}

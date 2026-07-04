import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-black hover:bg-yellow-400 disabled:bg-neutral-700 disabled:text-neutral-400",
  secondary: "bg-surface border border-border text-neutral-100 hover:border-neutral-500",
  ghost: "text-neutral-400 hover:text-neutral-100",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

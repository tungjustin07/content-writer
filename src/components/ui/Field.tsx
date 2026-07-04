import { TextareaHTMLAttributes } from "react";

export function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">{children}</div>;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-accent resize-y ${
        props.className ?? ""
      }`}
    />
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface border border-border rounded-lg p-5 ${className}`}>{children}</div>;
}

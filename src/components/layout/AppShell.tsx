import type { ReactNode } from "react";

interface AppShellProps {
  top: ReactNode;
  preview: ReactNode;
  grid: ReactNode;
}

export function AppShell({ top, preview, grid }: AppShellProps) {
  return (
    <div className="app-shell">
      <section className="panel">{top}</section>
      <section className="panel">{preview}</section>
      <section className="panel">{grid}</section>
    </div>
  );
}

import type { ReactNode } from "react";

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export function AppShell({ sidebar, main }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="app-shell-split">
        {sidebar}
        <main className="main-stage panel">{main}</main>
      </div>
    </div>
  );
}

import type { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-canvas text-slate-100"><Sidebar /><div className="lg:pl-64">{children}</div></div>;
}

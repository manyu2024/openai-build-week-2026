import type { PropsWithChildren } from "react";
export function Badge({ children }: PropsWithChildren) { return <span className="rounded bg-panel-secondary px-2 py-1 font-mono text-[9.5px] uppercase tracking-wide text-slate-300">{children}</span>; }

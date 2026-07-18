import { AttackGraph } from "./AttackGraph";
import { Timeline } from "./Timeline";
export function VisualWorkspace() { return <section className="panel p-4"><div className="flex gap-4 border-b border-border pb-3 text-sm"><button type="button" className="text-cyan">Timeline</button><button type="button" className="text-slate-500">Attack graph</button></div><div className="mt-4"><Timeline /><AttackGraph /></div></section>; }

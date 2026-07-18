import { AssetForm } from "./AssetForm";
import { ConnectionForm } from "./ConnectionForm";
import { ArchitectureGraph } from "./ArchitectureGraph";

export function ArchitectureBuilder() {
  return <section><header><p className="eyebrow">Architecture builder</p><h1 className="mt-1 text-2xl font-semibold">Define your infrastructure</h1></header><div className="mt-6 grid gap-4 xl:grid-cols-[360px_1fr]"><div className="space-y-4"><AssetForm /><ConnectionForm /></div><ArchitectureGraph /></div></section>;
}

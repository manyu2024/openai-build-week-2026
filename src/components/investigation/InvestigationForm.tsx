import { SampleScenarioSelector } from "./SampleScenarioSelector";
import { UploadControl } from "./UploadControl";

export function InvestigationForm() { return <section className="mx-auto max-w-3xl"><p className="eyebrow">New investigation</p><h1 className="mt-1 text-2xl font-semibold">Bring in incident data</h1><div className="mt-6 grid gap-4"><label className="panel p-4 text-sm">Paste raw logs / alerts<textarea className="mt-3 min-h-52 w-full rounded border bg-panel-secondary p-3 font-mono text-xs" placeholder="Paste raw log data here..." /></label><UploadControl /><SampleScenarioSelector /><button type="button" className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium">Run Analysis</button></div></section>; }

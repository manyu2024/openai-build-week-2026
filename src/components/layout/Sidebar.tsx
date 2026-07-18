import Link from "next/link";

const links = [["Dashboard", "/"], ["Architecture", "/architecture"], ["New Investigation", "/investigations/new"]] as const;
export function Sidebar() {
  return <aside className="fixed inset-y-0 hidden w-64 border-r border-border bg-panel p-5 lg:block"><Link href="/" className="font-mono text-xl font-bold tracking-[0.2em] text-cyan">ARGUS</Link><nav className="mt-10 space-y-1">{links.map(([label, href]) => <Link key={href} href={href} className="block rounded px-3 py-2 text-sm text-slate-300 hover:bg-panel-secondary">{label}</Link>)}</nav></aside>;
}

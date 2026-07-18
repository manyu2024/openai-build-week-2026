import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export function EmptyState() {
  return <AppShell><section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center text-center"><p className="eyebrow text-cyan">Security incident reasoning</p><h1 className="mt-4 text-4xl font-semibold">See the attack. Understand the story.</h1><p className="mt-4 text-slate-400">Create your first organization to map its architecture and begin an investigation.</p><Link href="/organizations/new" className="mt-8 rounded bg-primary px-4 py-2 text-sm font-medium text-white">Create Your First Organization</Link></section></AppShell>;
}

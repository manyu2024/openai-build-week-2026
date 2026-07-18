import { InvestigationWorkspace } from "@/components/investigation/InvestigationWorkspace";

export default function InvestigationPage({ params }: { params: { id: string } }) {
  return <main className="min-h-screen p-4"><InvestigationWorkspace investigationId={params.id} /></main>;
}

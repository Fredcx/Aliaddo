import { DemoWorkspace } from "@/components/crm/demo-workspace";
import { todayInBrazil } from "@/lib/crm";

export const metadata = { title: "Conheça o novo Aliaddo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function DemoPage({ searchParams }: { searchParams: { view?: string } }) {
  return <DemoWorkspace view={searchParams.view || "home"} today={todayInBrazil()} />;
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BrainCircuit, LayoutList, FileImage, Link2, LogOut, Home, Users, ListTodo, Menu, X, GitBranch, ArrowUpRight, HelpCircle, Settings2 } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { signout } from "@/app/login/actions";

const GROUPS = [
  { label: "Atendimento", links: [{ href: "/forms", label: "Formulários", icon: LayoutList }, { href: "/dashboard", label: "Respostas e entregas", icon: LayoutDashboard }] },
  { label: "Gestão", links: [{ href: "/clients", label: "Clientes", icon: Users }, { href: "/pipeline", label: "Oportunidades", icon: GitBranch }, { href: "/follow-ups", label: "Tarefas", icon: ListTodo }] },
];
const SETTINGS = [{ href: "/logic", label: "Método e IA", icon: BrainCircuit }, { href: "/appearance", label: "Aparência das entregas", icon: FileImage }, { href: "/integrations", label: "Integrações", icon: Link2 }];

export default function AppSidebar({ demo = false, demoView = "home" }: { demo?: boolean; demoView?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const demoViews = ["home", "pipeline", "clients", "follow-ups", "forms", "guide"];
  function navItem(item: typeof SETTINGS[number]) {
    const view = item.href.slice(1), available = !demo || demoViews.includes(view);
    const active = demo ? demoView === view : pathname === item.href || pathname.startsWith(`${item.href}/`);
    const content = <><item.icon size={18} strokeWidth={1.8} /><span>{item.label}</span></>;
    return available ? <Link key={item.href} href={demo ? `/demo?view=${view}` : item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`workspace-nav ${active ? "workspace-nav-active" : ""}`}>{content}</Link> : <span key={item.href} className="workspace-nav opacity-50" title="Disponível na sua conta">{content}</span>;
  }
  return <aside className="sticky top-0 z-30 flex w-full shrink-0 flex-col border-b border-[#E3E7EC] bg-white/95 backdrop-blur-xl md:h-screen md:w-[240px] md:border-b-0 md:border-r">
    <div className="flex items-center justify-between px-6 py-5 md:py-8"><Link href={demo ? "/demo" : "/home"} aria-label="Aliaddo, início"><BrandLogo compact /></Link><button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="app-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} className="rounded-xl border border-[#E3E7EC] p-2 md:hidden">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    <p className="mb-6 hidden px-6 text-xs font-medium text-[#64748B] md:block">{demo ? "Espaço de demonstração" : "Meu espaço de trabalho"}</p>
    <nav id="app-navigation" aria-label="Menu principal" className={`${menuOpen ? "block" : "hidden"} max-h-[70dvh] flex-1 space-y-7 overflow-y-auto px-4 pb-5 md:block md:max-h-none`}>
      {navItem({ href: "/home", label: "Visão geral", icon: Home })}
      {GROUPS.map(group => <div key={group.label}><p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[#64748B]">{group.label}</p><div className="space-y-1">{group.links.map(navItem)}</div></div>)}
      <details open={!demo && SETTINGS.some(item => pathname.startsWith(item.href)) || undefined} className="group"><summary className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#526071] hover:bg-[#F5F6F8]"><Settings2 size={18} />Configurações<span className="ml-auto text-xs group-open:rotate-180">⌄</span></summary><div className="mt-1 space-y-1">{SETTINGS.map(navItem)}</div></details>
    </nav>
    <div className={`${menuOpen ? "block" : "hidden"} space-y-1 border-t border-[#E3E7EC] p-4 md:block`}>
      {navItem({ href: "/guide", label: "Como usar o Aliaddo", icon: HelpCircle })}
      {demo ? <Link href="/login" className="workspace-nav text-[#087F8C]">Entrar na minha conta<ArrowUpRight size={16} /></Link> : <form action={signout}><button className="workspace-nav w-full hover:!text-red-700"><LogOut size={18} />Sair da conta</button></form>}
    </div>
  </aside>;
}

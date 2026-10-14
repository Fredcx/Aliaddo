"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BrainCircuit, LayoutList, FileImage, Link2, LogOut, Home, Users, CalendarDays, Menu, X, GitBranch, ArrowUpRight, Circle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { signout } from "@/app/login/actions";

const GROUPS = [
  { label: "Seu dia a dia", links: [{ href: "/home", label: "Hoje", icon: Home }, { href: "/clients", label: "Clientes", icon: Users }, { href: "/pipeline", label: "Funil de oportunidades", icon: GitBranch }, { href: "/follow-ups", label: "Retornos", icon: CalendarDays }] },
  { label: "Seu atendimento", links: [{ href: "/forms", label: "Formulários", icon: LayoutList }, { href: "/dashboard", label: "Respostas e entregas", icon: LayoutDashboard }, { href: "/logic", label: "Método e IA", icon: BrainCircuit }] },
  { label: "Seu espaço", links: [{ href: "/appearance", label: "Identidade das entregas", icon: FileImage }, { href: "/integrations", label: "Integrações", icon: Link2 }] },
];

export default function AppSidebar({ demo = false, demoView = "home" }: { demo?: boolean; demoView?: string }) {
  const pathname = usePathname(); const [menuOpen, setMenuOpen] = useState(false);
  const demoViews = ["home", "pipeline", "clients", "follow-ups", "forms"];
  return <aside className="sticky top-0 z-30 flex w-full flex-col border-b border-r border-[#e7ebe3] bg-white md:h-screen md:w-[230px] md:min-w-[230px]">
    <div className="flex items-center justify-between px-6 py-5 md:pb-6 md:pt-7"><Link href={demo ? "/demo" : "/home"} aria-label="Aliaddo, início"><BrandLogo compact /></Link><button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="app-navigation" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} className="rounded-lg border p-2 md:hidden">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button></div>
    <div className="mx-5 mb-5 hidden items-center gap-2 rounded-lg border border-[#eef0e9] bg-[#fafbf8] px-3 py-2.5 text-[11px] text-[#7f8b78] md:flex"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#eaf1e1] font-semibold text-[#738b56]">A</span>{demo ? "Espaço de demonstração" : "Meu espaço de trabalho"}</div>
    <nav id="app-navigation" aria-label="Menu principal" className={`${menuOpen ? "block" : "hidden"} max-h-[65vh] flex-1 overflow-y-auto px-3 pb-4 md:block md:max-h-none`}>
      {GROUPS.map(group => <div key={group.label} className="mb-5"><p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.15em] text-[#a1aa9c]">{group.label}</p><div className="space-y-1">{group.links.map(item => {
        const view = item.href.slice(1), available = !demo || demoViews.includes(view);
        const active = demo ? demoView === view : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return available ? <Link key={item.href} href={demo ? `/demo?view=${view}` : item.href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[12px] font-medium transition ${active ? "bg-[#eaf3e8] text-[#346d47]" : "text-[#7f897c] hover:bg-[#f6f8f2] hover:text-[#3f573d]"}`}><item.icon size={17} strokeWidth={1.6} /><span className="flex-1">{item.label}</span>{active && <Circle size={5} fill="currentColor" />}</Link> : <span key={item.href} className="flex items-center gap-3 px-3 py-3 text-[12px] text-[#b0b7a9]" title="Disponível na sua conta"><item.icon size={17} strokeWidth={1.6} />{item.label}</span>;
      })}</div></div>)}
    </nav>
    <div className="mx-5 mb-5 hidden rounded-xl bg-[#f6f8f0] p-4 md:block"><p className="text-xs font-medium text-[#627851]">Mais presença. Menos pendências.</p><p className="mt-2 text-[10px] leading-relaxed text-[#9aa48b]">Seu aliado para cuidar dos clientes e fazer o negócio acontecer.</p></div>
    <div className={`${menuOpen ? "block" : "hidden"} border-t border-[#eef0e9] p-4 md:block`}>{demo ? <Link href="/login" className="flex items-center justify-between px-2 text-xs font-medium text-[#147D69]">Entrar na minha conta<ArrowUpRight size={15} /></Link> : <form action={signout}><button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-xs text-[#96a08d] hover:bg-red-50 hover:text-red-600"><LogOut size={16} />Sair da conta</button></form>}</div>
  </aside>;
}

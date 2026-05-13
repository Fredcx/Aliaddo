"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard, BrainCircuit, LayoutList, FileImage, Link2,
    ChevronRight, CheckCircle2, Circle, Sparkles, Home
} from "lucide-react";
import Spinner from "@/components/spinner";

const SECTIONS = [
    {
        href: "/form",
        icon: LayoutList,
        color: "#F59E0B",
        bg: "#FFFBEB",
        border: "#FDE68A",
        step: "Passo 1",
        title: "Formulário",
        description: "Monte as perguntas para seus clientes. Compartilhe o link e as respostas chegam automaticamente na Mesa de Trabalho.",
        cta: "Configurar Formulário",
    },
    {
        href: "/logic",
        icon: BrainCircuit,
        color: "#0E9E82",
        bg: "#EBF9F6",
        border: "#C6EFE7",
        step: "Passo 2",
        title: "Motor IA",
        description: "O coração do Aliaddo. Descreva sua lógica em linguagem natural — a IA aprende e gera documentos precisos sem inventar nada.",
        cta: "Configurar Motor IA",
    },
    {
        href: "/dashboard",
        icon: LayoutDashboard,
        color: "#3B82F6",
        bg: "#EFF6FF",
        border: "#BFDBFE",
        step: "Passo 3",
        title: "Mesa de Trabalho",
        description: "Acompanhe clientes em tempo real. Gere documentos, revise e entregue com IA — tudo organizado por etapas.",
        cta: "Abrir Mesa de Trabalho",
    },
    {
        href: "/appearance",
        icon: FileImage,
        color: "#EC4899",
        bg: "#FDF2F8",
        border: "#FBCFE8",
        title: "Aparência PDF",
        description: "Personalize cor, template e textos dos documentos entregues aos seus clientes.",
        cta: "Personalizar PDF",
    },
    {
        href: "/integrations",
        icon: Link2,
        color: "#8B5CF6",
        bg: "#F5F3FF",
        border: "#DDD6FE",
        title: "Integrações",
        description: "Configure webhooks, use o link público nativo e personalize os templates de disparo de WhatsApp e E-mail.",
        cta: "Ver Integrações",
    },
];

import { useSettings } from "@/components/settings-context";

export default function HomePage() {
    const { settings, username: contextUsername, isLoading: contextLoading } = useSettings();
    const [setup, setSetup] = useState({ logic: false, form: false });
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!contextLoading) {
            if (settings) {
                try {
                    const p = JSON.parse(settings.rules_text || "{}");
                    setSetup(prev => ({ ...prev, logic: (p.rules?.length ?? 0) > 0 }));
                } catch {
                    setSetup(prev => ({ ...prev, logic: (settings.rules_text || "").trim().length > 30 }));
                }
                setSetup(prev => ({ ...prev, form: (settings.form_fields?.length ?? 0) > 0 }));
            }
            setUsername(contextUsername || "");
            setIsLoading(false);
        }
    }, [settings, contextUsername, contextLoading]);

    const allDone = setup.logic && setup.form;
    const doneCount = [setup.logic, setup.form].filter(Boolean).length;

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">

            {/* ── Hero ── */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-[16px] bg-[#1D1D1F] flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5 text-[#15B392]" strokeWidth={1.8} />
                    </div>
                    <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight">Início</h1>
                </div>
                <p className="text-[15px] text-[#86868B] ml-[56px] leading-relaxed max-w-lg">
                    Configure uma vez e a IA entrega documentos personalizados para cada cliente automaticamente.
                </p>
            </div>

            {/* ── Fluxo em 3 passos ── */}
            <div className="mb-8 bg-white rounded-[24px] border border-[#E5E5EA] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest mb-5">Como funciona</p>
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { n: 1, title: "Configure o formulário", desc: "Monte as perguntas para seus clientes. Compartilhe o link de respostas.", href: "/form", color: "#F59E0B", bg: "#FFFBEB" },
                        { n: 2, title: "Configure o Motor IA", desc: "Descreva sua lógica. A IA extrai e estrutura suas regras automaticamente.", href: "/logic", color: "#0E9E82", bg: "#EBF9F6" },
                        { n: 3, title: "Revise e entregue", desc: "A IA gera o documento. Você aprova e envia ao cliente.", href: "/dashboard", color: "#3B82F6", bg: "#EFF6FF" },
                    ].map((f, i) => (
                        <Link key={f.n} href={f.href} style={{ textDecoration: "none" }} className="group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: f.bg, color: f.color }}>
                                    {f.n}
                                </div>
                                {i < 2 && <div className="flex-1 h-px bg-[#F0F0F5]" />}
                            </div>
                            <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-1 group-hover:text-[#15B392] transition-colors">{f.title}</h3>
                            <p className="text-[12.5px] text-[#86868B] leading-relaxed">{f.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Setup checklist (apenas quando incompleto) ── */}
            {!isLoading && !allDone && (
                <div className="mb-8 bg-white rounded-[24px] border border-[#E5E5EA] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[15px] font-semibold text-[#1D1D1F]">Primeiros passos</h2>
                        <span className="text-[13px] font-semibold text-[#86868B]">{doneCount}/2 concluídos</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F5F5F7] rounded-full mb-4 overflow-hidden">
                        <div className="h-full bg-[#15B392] rounded-full transition-all duration-500" style={{ width: `${(doneCount / 2) * 100}%` }} />
                    </div>
                    <div className="space-y-1">
                        <SetupItem done={setup.form} label="Configurar o Formulário" href="/form" desc="Monte as perguntas que seus clientes vão responder." />
                        <SetupItem done={setup.logic} label="Configurar o Motor IA" href="/logic" desc="Registre sua lógica profissional para a IA aprender." />
                    </div>
                </div>
            )}

            {/* Banner: tudo pronto */}
            {!isLoading && allDone && (
                <div className="mb-8 flex items-center gap-4 bg-[#EBF9F6] rounded-[20px] border border-[#C6EFE7] p-5">
                    <div className="w-10 h-10 rounded-full bg-[#15B392] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[14px] font-semibold text-[#1D1D1F]">Sistema ativo e pronto para uso</p>
                        <p className="text-[12.5px] text-[#86868B] mt-0.5">Compartilhe o formulário com seus clientes e aguarde as respostas.</p>
                    </div>
                    <Link href="/dashboard" style={{ textDecoration: "none" }}
                        className="px-4 py-2 bg-[#1D1D1F] hover:bg-black text-white text-[13px] font-medium rounded-full flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0">
                        Mesa de Trabalho <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {/* ── Seções ── */}
            <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest mb-4">Todas as seções</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SECTIONS.map(s => (
                    <Link
                        key={s.href}
                        href={s.href}
                        style={{ textDecoration: "none" }}
                        className="group bg-white rounded-[20px] p-5 border border-[#E5E5EA] hover:border-transparent hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center border shrink-0" style={{ backgroundColor: s.bg, borderColor: s.border }}>
                                <s.icon className="w-5 h-5" style={{ color: s.color }} strokeWidth={1.8} />
                            </div>
                            {s.step && (
                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border" style={{ backgroundColor: s.bg, borderColor: s.border, color: s.color }}>
                                    {s.step}
                                </span>
                            )}
                        </div>
                        <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-1">{s.title}</h3>
                        <p className="text-[12.5px] text-[#86868B] leading-relaxed flex-1 mb-3">{s.description}</p>
                        <div className="flex items-center gap-1 text-[12.5px] font-semibold mt-auto" style={{ color: s.color }}>
                            {s.cta} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    );

}

function SetupItem({ done, label, href, desc }: { done: boolean; label: string; href: string; desc: string }) {
    return (
        <Link href={href} style={{ textDecoration: "none" }}
            className="flex items-center gap-3.5 p-3 rounded-[14px] hover:bg-[#F5F5F7] transition-colors group">
            {done
                ? <CheckCircle2 className="w-5 h-5 text-[#15B392] shrink-0" />
                : <Circle className="w-5 h-5 text-[#D1D1D6] shrink-0" />
            }
            <div className="flex-1 min-w-0">
                <p className={`text-[13.5px] font-medium leading-tight ${done ? "text-[#86868B] line-through" : "text-[#1D1D1F]"}`}>{label}</p>
                <p className="text-[12px] text-[#86868B] mt-0.5">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C7C7CC] group-hover:text-[#86868B] group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
    );
}

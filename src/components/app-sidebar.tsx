"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BrainCircuit, LayoutList, FileImage, Link2, LogOut, AlertCircle, ChevronRight, Home } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { signout } from "@/app/login/actions";

const NAV = [
    { href: "/home", label: "Início", icon: Home },
    { href: "/dashboard", label: "Mesa de Trabalho", icon: LayoutDashboard },
    { href: "/forms", label: "Formulários", icon: LayoutList },
    { href: "/logic", label: "Motor IA", icon: BrainCircuit, needsSetup: true },
    { href: "/appearance", label: "Aparência PDF", icon: FileImage },
    { href: "/integrations", label: "Integrações", icon: Link2 },
];

import { useSettings } from "@/components/settings-context";

export default function AppSidebar() {
    const pathname = usePathname();
    const { settings } = useSettings();
    const [hasLogic, setHasLogic] = useState<boolean | null>(null);

    useEffect(() => {
        if (!settings) return;
        try {
            const p = JSON.parse(settings.rules_text || "{}");
            setHasLogic((p.rules?.length ?? 0) > 0);
        } catch {
            setHasLogic((settings.rules_text || "").trim().length > 30);
        }
    }, [settings]);

    return (
        <aside className="w-[228px] min-w-[228px] min-h-screen bg-white border-r border-[#EBEBEF] flex flex-col sticky top-0 h-screen overflow-hidden shadow-[1px_0_0_0_#EBEBEF]">

            {/* Logo */}
            <div className="px-5 py-5 border-b border-[#F3F3F7]">
                <BrandLogo className="text-[56px] leading-none" variant="full" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 pt-3 pb-2 space-y-0.5 overflow-y-auto">
                {NAV.map(item => {
                    const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const showAlert = item.needsSetup && hasLogic === false;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{ textDecoration: "none" }}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[13.5px] font-medium transition-all duration-150 outline-none ${
                                active
                                    ? "bg-[#EBF9F6] text-[#0E9E82]"
                                    : "text-[#6B7280] hover:bg-[#F7F7FA] hover:text-[#1D1D1F]"
                            }`}
                        >
                            <item.icon
                                className="w-[17px] h-[17px] shrink-0"
                                strokeWidth={active ? 2.2 : 1.8}
                            />
                            <span className="flex-1 leading-none">{item.label}</span>
                            {showAlert && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Setup alert — only when Motor IA is not configured */}
            {hasLogic === false && (
                <div className="mx-3 mb-3 p-4 rounded-[16px] bg-amber-50 border border-amber-200/80">
                    <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <p className="text-[12px] font-semibold text-amber-900 leading-tight mb-1">Motor IA pendente</p>
                            <p className="text-[11.5px] text-amber-700/80 leading-relaxed mb-2.5">
                                Configure sua lógica para ativar a geração automática de documentos.
                            </p>
                            <Link
                                href="/logic"
                                style={{ textDecoration: "none" }}
                                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                            >
                                Configurar agora
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout */}
            <div className="p-3 border-t border-[#F3F3F7]">
                <form action={signout}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[13.5px] font-medium text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 transition-all duration-150 outline-none cursor-pointer"
                    >
                        <LogOut className="w-[17px] h-[17px] shrink-0" strokeWidth={1.8} />
                        Sair da conta
                    </button>
                </form>
            </div>
        </aside>
    );
}

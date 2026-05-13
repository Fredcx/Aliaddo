"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Copy, CheckCircle, PenLine, FileText as FileTextIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/client";

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    { ssr: false }
);

interface ReviewClientProps {
    id: string;
    initialContent: string;
    clientName: string;
    primaryColor: string;
    logoUrl?: string;
    responses: { question: string; answer: string }[];
    clientStatus: string;
}

export default function ReviewClient({ id, initialContent, clientName, primaryColor, logoUrl, responses, clientStatus }: ReviewClientProps) {
    const [activeTab, setActiveTab] = useState("editor");
    const [markdown, setMarkdown] = useState(initialContent);
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPrintMode, setIsPrintMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined" && window.location.search.includes("print")) {
            setIsPrintMode(true);
            setTimeout(() => {
                window.print();
            }, 800);
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendToClient = async () => {
        setIsSaving(true);
        try {
            const supabase = createClient();
            
            // Salva as últimas alterações do texto primeiro
            await supabase
                .from("documents")
                .update({ content: markdown })
                .eq("client_id", id);
            
            // Move o cliente para o próximo status (Enviado)
            const { error } = await supabase
                .from("clients")
                .update({ status: "Enviado" })
                .eq("id", id);
                
            if (error) throw error;
            
            // Redireciona de volta para a mesa de trabalho, onde ele poderá ver na coluna "Enviados"
            router.push("/dashboard");
        } catch (e: any) {
            console.error("Erro ao enviar cliente:", e);
            alert("Erro ao processar envio: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("documents")
                .update({ content: markdown })
                .eq("client_id", id);
                
            if (error) throw error;
            alert("Documento salvo com sucesso!");
        } catch (e: any) {
            console.error(e);
            alert("Erro ao salvar documento: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isPrintMode) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] p-8 flex justify-center items-start overflow-y-auto">
                <div className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-sm rounded-sm p-[80px] relative flex flex-col justify-between">
                    <div>
                        {/* Visual Mock PDF Header */}
                        <div className="mb-12 border-b-2 pb-6 flex justify-between items-center" style={{ borderColor: primaryColor }}>
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="max-h-12 w-auto object-contain" />
                            ) : (
                                <span className="text-2xl font-bold tracking-tight text-[#1D1D1F]">DOCUMENTO</span>
                            )}
                            <span className="text-xl font-medium" style={{ color: primaryColor }}>Análise e Planejamento</span>
                        </div>

                        <div className="prose prose-slate max-w-none print-prose" dangerouslySetInnerHTML={{ __html: require('markdown-it')().render(markdown) }}></div>
                    </div>
                    <div className="mt-auto pt-10 border-t border-[#E5E5EA] flex justify-center">
                        <BrandLogo className="text-[56px] opacity-100" />
                    </div>
                </div>
            </div>
        );
    }

    // Print CSS embedded inline to apply primary color accurately and hide UI
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                        position: relative;
                        background: white;
                        margin: 0;
                        padding: 0;
                        width: 100%;
                    }
                    @page {
                        margin: 15mm 20mm 15mm 20mm;
                        size: A4 portrait;
                    }
                    .print-footer {
                        position: fixed;
                        bottom: 0;
                        left: 20mm;
                        right: 20mm;
                        height: 18mm;
                        display: flex !important;
                        justify-content: center;
                        align-items: center;
                        border-top: 1px solid #E5E5EA !important;
                        background: white;
                        z-index: 9999;
                    }
                    .print-content {
                        margin: 0;
                        padding: 0;
                    }
                    p, h1, h2, h3, li, blockquote {
                        break-inside: avoid !important;
                    }
                }
                .print-only {
                    display: none;
                }
                
                /* Adiciona a barra colorida na lateral esquerda do primeiro parágrafo (introdução) */
                .print-prose p:first-of-type, .prose p:first-of-type {
                    border-left: 4px solid ${primaryColor} !important;
                    padding-left: 18px !important;
                    font-size: 15px !important;
                    color: #1D1D1F !important;
                    font-style: italic !important;
                    margin-top: 1.5rem !important;
                    margin-bottom: 2.5rem !important;
                    line-height: 1.6 !important;
                }
            ` }} />

            {/* Print Only Container (Fora da div no-print) */}
            <div className="print-only">
                {/* Rodapé fixo impresso na base de todas as páginas */}
                <div className="print-footer">
                    <BrandLogo className="text-[52px] opacity-100" />
                </div>

                {/* Tabela estrutural para gerenciar quebras de página sem sobreposição */}
                <table className="w-full border-collapse">
                    <tbody>
                        <tr>
                            <td>
                                <div className="print-content">
                                    {/* Cabeçalho que aparece APENAS na primeira página */}
                                    <div className="mb-12 border-b-2 pb-6 flex justify-between items-center" style={{ borderColor: primaryColor }}>
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="max-h-12 w-auto object-contain" />
                                        ) : (
                                            <span className="text-2xl font-bold tracking-tight text-[#1D1D1F]">DOCUMENTO</span>
                                        )}
                                        <span className="text-xl font-medium" style={{ color: primaryColor }}>Análise e Planejamento</span>
                                    </div>

                                    <div className="prose prose-slate max-w-none print-prose" dangerouslySetInnerHTML={{ __html: require('markdown-it')().render(markdown) }}></div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>
                                {/* Reservatório de espaço para o rodapé fixo na base de cada página */}
                                <div className="h-[22mm]"></div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex h-screen bg-[#F5F5F7] overflow-hidden no-print">

            {/* Sidebar (Left) */}
            <aside className="w-[30%] min-w-[320px] max-w-[400px] bg-[#F5F5F7] border-r border-[#E5E5EA] flex flex-col h-full z-10 relative">
                <div className="p-6 pb-4 pt-8 sticky top-0 bg-[#F5F5F7]/80 backdrop-blur-xl z-20">
                    <Link href="/dashboard" className="text-[15px] font-medium flex items-center gap-1.5 mb-8 w-fit transition-opacity hover:opacity-80" style={{ color: primaryColor }}>
                        <ArrowLeft className="w-[18px] h-[18px]" stroke="currentColor" /> Voltar
                    </Link>
                    <BrandLogo className="text-[80px] mb-4 -ml-1" />
                    <h2 className="text-[18px] font-semibold text-[#1D1D1F] tracking-tight">Contexto do Cliente</h2>
                    <p className="text-[12px] text-[#86868B] mt-0.5 font-mono">ID: {id}</p>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E5E5EA]/50">
                            <h3 className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-2">Cliente</h3>
                            <p className="text-[15px] text-[#1D1D1F] font-medium leading-relaxed">{clientName}</p>

                            {responses.length > 0 && (
                                <div className="mt-5 space-y-4 border-t border-[#E5E5EA]/50 pt-4">
                                    {responses.map((resp, idx) => (
                                        <div key={idx}>
                                            <h4 className="text-[13px] font-medium text-[#1D1D1F] mb-1">{resp.question}</h4>
                                            <p className="text-[14px] text-[#86868B] font-light leading-relaxed">{resp.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Fixado */}
                <div className="p-6 border-t border-[#E5E5EA] bg-white sticky bottom-0 z-20">
                    {["Enviado", "Finalizado"].includes(clientStatus) ? (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-3.5 bg-[#1D1D1F] hover:bg-black text-white rounded-full font-medium text-[15px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-3 shadow-[0_4px_14px_rgba(0,0,0,0.1)] outline-none"
                        >
                            <Save className="w-[18px] h-[18px]" /> {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                    ) : (
                        <button
                            onClick={handleSendToClient}
                            disabled={isSaving}
                            className="w-full py-3.5 bg-[#1D1D1F] hover:bg-black text-white rounded-full font-medium text-[15px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-3 shadow-[0_4px_14px_rgba(0,0,0,0.1)] outline-none disabled:opacity-50"
                        >
                            <CheckCircle className="w-[18px] h-[18px]" /> {isSaving ? "Enviando..." : "Enviar para Cliente"}
                        </button>
                    )}
                    <button className="w-full py-3 bg-transparent border border-[#E5E5EA] text-[#86868B] hover:text-[#EF4444] hover:bg-[#F5F5F7] hover:border-transparent rounded-full font-medium text-[14px] transition-all outline-none">
                        Descartar e Refazer
                    </button>
                </div>
            </aside>

            {/* Main Content (Right) / Document Area */}
            <main className="flex-1 flex flex-col h-full bg-white relative">
                {/* Header Interno: Toggle Editor / Preview */}
                <header className="h-[80px] border-b border-[#E5E5EA] flex items-center px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-20 shrink-0">
                    <div className="bg-[#1D1D1F] p-1.5 rounded-full flex gap-1 shadow-md">
                        <button
                            onClick={() => setActiveTab("editor")}
                            className={`px-5 py-2.5 rounded-full text-[14px] font-medium flex items-center gap-2 transition-all outline-none ${activeTab === "editor" ? "bg-white text-[#1D1D1F] shadow-sm transform scale-[1.02]" : "text-[#A1A1A6] hover:text-white"}`}
                        >
                            <PenLine className="w-4 h-4" style={{ color: activeTab === 'editor' ? primaryColor : undefined }} /> Editar
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`px-5 py-2.5 rounded-full text-[14px] font-medium flex items-center gap-2 transition-all outline-none ${activeTab === "preview" ? "bg-white text-[#1D1D1F] shadow-sm transform scale-[1.02]" : "text-[#A1A1A6] hover:text-white"}`}
                        >
                            <FileTextIcon className="w-4 h-4" style={{ color: activeTab === 'preview' ? primaryColor : undefined }} /> Visualizar PDF
                        </button>
                    </div>

                    <div className="ml-auto flex gap-3">
                        <button
                            onClick={handleCopy}
                            className="p-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] rounded-full transition-colors flex items-center gap-2 outline-none group shadow-sm"
                            title="Copiar Markdown"
                        >
                            {copied ? <CheckCircle className="w-4 h-4 text-[#34C759]" /> : <Copy className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors" />}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-3 text-white rounded-full text-[14px] font-medium transition-opacity flex items-center gap-2 outline-none shadow-sm hover:opacity-90"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse text-white/70' : ''}`} /> {isSaving ? "Salvando..." : "Salvar Configuração"}
                        </button>
                    </div>
                </header>

                {/* Área de Trabalho */}
                <div className="flex-1 overflow-y-auto bg-[#F5F5F7]">
                    {activeTab === "editor" ? (
                        <div className="h-full" data-color-mode="light">
                            <MDEditor
                                value={markdown}
                                onChange={(val) => setMarkdown(val || "")}
                                height="100%"
                                preview="edit"
                                hideToolbar={false}
                                className="!rounded-none !border-0 !h-full"
                            />
                        </div>
                    ) : (
                        <div className="p-8 pb-32 flex justify-center w-full min-h-full">
                            <div className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-sm p-[80px] transition-all relative flex flex-col justify-between">
                                <div>
                                    {/* Visual Mock PDF Header */}
                                    <div className="mb-12 border-b-2 pb-6 flex justify-between items-center" style={{ borderColor: primaryColor }}>
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="max-h-12 w-auto object-contain" />
                                        ) : (
                                            <span className="text-2xl font-bold tracking-tight text-[#1D1D1F]">DOCUMENTO</span>
                                        )}
                                        <span className="text-xl font-medium" style={{ color: primaryColor }}>Análise e Planejamento</span>
                                    </div>

                                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: require('markdown-it')().render(markdown) }}></div>
                                </div>
                                <div className="mt-auto pt-10 border-t border-[#E5E5EA] flex justify-center">
                                    <BrandLogo className="text-[56px] opacity-100" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
        </>
    );
}

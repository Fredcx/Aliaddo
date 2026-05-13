"use client";

import { BrandLogo } from "@/components/brand-logo";
import { Printer } from "lucide-react";
import markdownIt from "markdown-it";

interface PublicDocumentClientProps {
    clientName: string;
    content: string;
    primaryColor: string;
    logoUrl?: string;
}

export default function PublicDocumentClient({ clientName, content, primaryColor, logoUrl }: PublicDocumentClientProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                    }
                    @page {
                        margin: 15mm 20mm 15mm 20mm;
                        size: A4 portrait;
                    }
                }
                .print-prose p:first-of-type {
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

            {/* Top Bar for Client */}
            <div className="no-print sticky top-0 w-full bg-white/80 backdrop-blur-md border-b border-[#E5E5EA] py-4 px-6 flex justify-between items-center z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <BrandLogo className="text-[28px]" />
                    <span className="text-xs text-[#86868B] border-l border-[#E5E5EA] pl-3">Relatório de Planejamento</span>
                </div>
                <button
                    onClick={handlePrint}
                    className="py-2 px-5 bg-[#1D1D1F] hover:bg-black text-white rounded-full font-medium text-[13px] transition-all flex items-center gap-1.5 shadow-sm outline-none active:scale-[0.98]"
                >
                    <Printer className="w-4 h-4" /> Imprimir ou Salvar PDF
                </button>
            </div>

            {/* Document Body */}
            <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 flex justify-center items-start">
                <div className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-lg p-10 md:p-[80px] relative flex flex-col justify-between">
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

                        <div className="prose prose-slate max-w-none print-prose" dangerouslySetInnerHTML={{ __html: markdownIt().render(content) }}></div>
                    </div>
                    <div className="mt-auto pt-10 border-t border-[#E5E5EA] flex justify-center">
                        <BrandLogo className="text-[56px] opacity-100" />
                    </div>
                </div>
            </div>
        </>
    );
}

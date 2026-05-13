"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Send, FileText, Sparkles, ArrowRight, Eye, RefreshCw, Copy, Check, ExternalLink, LayoutDashboard, Mail, Phone, Printer, PenLine, Trash2, X, CheckSquare, CheckCircle } from "lucide-react";
import Spinner from "@/components/spinner";
import { createClient } from "@/utils/supabase/client";

import { useSettings } from "@/components/settings-context";

export default function DashboardPage() {
    const { username: contextUsername, isLoading: contextLoading } = useSettings();
    const [clients, setClients] = useState<any[]>([]);
    const [forms, setForms] = useState<any[]>([]);
    const [selectedFormId, setSelectedFormId] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [activeModalClient, setActiveModalClient] = useState<any | null>(null);
    const [modalResponses, setModalResponses] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalGenerating, setModalGenerating] = useState(false);

    const load = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Fetch forms for the filter dropdown
        const { data: f } = await supabase.from("forms").select("id, title").eq("profile_id", user.id).order("created_at", { ascending: true });
        if (f) setForms(f);

        // Fetch clients with their related form title
        const { data: c } = await supabase
            .from("clients")
            .select("*, forms(id, title)")
            .eq("profile_id", user.id)
            .order("created_at", { ascending: false });
        
        if (c) setClients(c);
        setIsLoading(false);
    };

    useEffect(() => { 
        if (!contextLoading) {
            load(); 
            
            // Subescrever ao Realtime do Supabase para atualizar a lista de clientes instantaneamente
            const supabase = createClient();
            const channel = supabase
                .channel("realtime-clients-dashboard")
                .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
                    load();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [contextLoading, contextUsername]);

    const openAnswersModal = async (client: any) => {
        setActiveModalClient(client);
        setModalLoading(true);
        const supabase = createClient();
        const { data } = await supabase.from("responses").select("question, answer").eq("client_id", client.id);
        if (data) setModalResponses(data);
        setModalLoading(false);
    };

    const fmt = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    
    // Filter clients based on selected form and search term
    const filteredClients = clients.filter(c => {
        const matchesForm = selectedFormId === "all" || c.form_id === selectedFormId;
        const matchesSearch = !searchTerm.trim() || 
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesForm && matchesSearch;
    });

    const newC = filteredClients.filter(c => c.status === "Aguardando");
    const reviewC = filteredClients.filter(c => ["Pronto", "Processando", "Revisão Pendente"].includes(c.status));
    const sentC = filteredClients.filter(c => c.status === "Enviado");
    const doneC = filteredClients.filter(c => c.status === "Finalizado");

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-11 h-11 rounded-[16px] bg-[#1D1D1F] flex items-center justify-center shrink-0">
                            <LayoutDashboard className="w-5 h-5 text-[#15B392]" strokeWidth={1.8} />
                        </div>
                        <h1 className="text-[26px] font-semibold text-[#1D1D1F] tracking-tight">Mesa de Trabalho</h1>
                    </div>
                    <p className="text-[14px] text-[#86868B] mt-1 ml-[52px]">Acompanhe suas consultorias em tempo real.</p>
                </div>
                
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-[#E5E5EA] rounded-xl pl-4 pr-16 py-2.5 text-[14px] text-[#1D1D1F] placeholder-[#86868B]/70 outline-none focus:border-[#1D1D1F] shadow-sm w-full sm:min-w-[260px] transition-colors"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors bg-[#F5F5F7] px-2 py-1 rounded-md"
                            >
                                Limpar
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    {forms.length > 0 && (
                        <div className="relative w-full sm:w-auto">
                            <select 
                                value={selectedFormId}
                                onChange={(e) => setSelectedFormId(e.target.value)}
                                className="bg-white border border-[#E5E5EA] rounded-xl px-4 py-2.5 text-[14px] text-[#1D1D1F] outline-none focus:border-[#1D1D1F] shadow-sm appearance-none cursor-pointer w-full sm:min-w-[180px]"
                            >
                                <option value="all">Todos os Formulários</option>
                                {forms.map(f => (
                                    <option key={f.id} value={f.id}>{f.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Col 1 */}
                    <Column title="Novas Respostas" count={newC.length} icon={<Clock className="w-4 h-4 text-amber-500" />}>
                        {newC.length === 0
                            ? <EmptyCol icon="🕐" text="Nenhuma resposta ainda" sub="Compartilhe o link do formulário para começar." />
                            : newC.map(c => <NewCard key={c.id} {...c} date={fmt(c.created_at)} formTitle={c.forms?.title} onRefresh={load} onViewAnswers={() => openAnswersModal(c)} />)
                        }
                    </Column>

                    {/* Col 2 */}
                    <Column title="Prontos para Revisão" count={reviewC.length} icon={<FileText className="w-4 h-4 text-[#15B392]" />}>
                        {reviewC.length === 0
                            ? <EmptyCol icon="📄" text="Nenhuma revisão pendente" sub="Quando a IA gerar um documento, ele aparece aqui." />
                            : reviewC.map(c => <ReviewCard key={c.id} {...c} date={fmt(c.created_at)} formTitle={c.forms?.title} href={`/review/${c.id}`} onRefresh={load} />)
                        }
                    </Column>

                    {/* Col 3 */}
                    <Column title="Enviar" count={sentC.length} icon={<Send className="w-4 h-4 text-[#0071E3]" />}>
                        {sentC.length === 0
                            ? <EmptyCol icon="✉️" text="Nenhum envio pendente" sub="Aprove os documentos na revisão para enviá-los daqui." />
                            : sentC.map(c => <SentCard key={c.id} {...c} date={fmt(c.created_at)} formTitle={c.forms?.title} onRefresh={load} />)
                        }
                    </Column>

                    {/* Col 4 */}
                    <Column title="Finalizados" count={doneC.length} icon={<CheckCircle className="w-4 h-4 text-[#34C759]" />}>
                        {doneC.length === 0
                            ? <EmptyCol icon="🏆" text="Nenhum concluído" sub="Arraste ou finalize atendimentos para arquivar aqui." />
                            : doneC.map(c => <DoneCard key={c.id} {...c} date={fmt(c.created_at)} formTitle={c.forms?.title} onRefresh={load} />)
                        }
                    </Column>
                </div>
            )}

            {/* Answers Preview Modal */}
            {activeModalClient && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/[0.04] flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-[#E5E5EA]/50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-[18px] font-semibold text-[#1D1D1F] tracking-tight">{activeModalClient.name}</h3>
                                <p className="text-[12px] text-[#86868B] mt-0.5 font-mono">{activeModalClient.email || "Sem e-mail"}</p>
                            </div>
                            <button onClick={() => { setActiveModalClient(null); setModalResponses([]); }} className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors outline-none">
                                <X className="w-5 h-5 text-[#86868B] hover:text-[#1D1D1F]" />
                            </button>
                        </div>

                        {/* Scrollable Answers Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-[#F5F5F7]/50">
                            {modalLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Spinner size="md" />
                                </div>
                            ) : modalResponses.length === 0 ? (
                                <p className="text-center text-[13px] text-[#86868B] py-8">Nenhuma resposta gravada.</p>
                            ) : (
                                modalResponses.map((r, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-2xl border border-black/[0.02] shadow-sm">
                                        <h4 className="text-[13px] font-semibold text-[#1D1D1F] mb-1.5 leading-snug">{r.question}</h4>
                                        <p className="text-[14px] text-[#86868B] font-light leading-relaxed whitespace-pre-wrap">{r.answer}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[#E5E5EA]/50 flex gap-3 bg-white">
                            <button
                                onClick={async () => {
                                    if (!confirm(`Deseja mesmo excluir o cliente ${activeModalClient.name}?`)) return;
                                    const supabase = createClient();
                                    await supabase.from("clients").delete().eq("id", activeModalClient.id);
                                    setActiveModalClient(null);
                                    load();
                                }}
                                className="px-6 py-3 border border-red-100 text-red-500 hover:bg-red-50 rounded-full text-[14px] font-medium transition-all"
                            >
                                Excluir
                            </button>
                            
                            <button
                                onClick={async () => {
                                    setModalGenerating(true);
                                    try {
                                        const r = await fetch("/api/generate", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ clientId: activeModalClient.id })
                                        });
                                        if (r.ok) {
                                            setActiveModalClient(null);
                                            load();
                                        } else {
                                            alert("Erro ao processar geração com IA.");
                                        }
                                    } catch {
                                        alert("Erro ao processar geração com IA.");
                                    } finally {
                                        setModalGenerating(false);
                                    }
                                }}
                                disabled={modalGenerating || modalLoading}
                                className="flex-1 py-3 bg-[#1D1D1F] hover:bg-black text-white rounded-full text-[14px] font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-40"
                            >
                                {modalGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {modalGenerating ? "Gerando Relatório..." : "Gerar com IA"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Column({ title, count, icon, children }: { title: string; count: number; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white/50 rounded-[24px] p-5 min-h-[500px] flex flex-col border border-black/[0.02]">
            <div className="flex items-center gap-2 mb-5 px-1">
                <span className="text-[#86868B]">{icon}</span>
                <h2 className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider flex-1">{title}</h2>
                <span className="text-[12px] font-semibold text-[#86868B] bg-[#F5F5F7] rounded-full px-2 py-0.5">{count}</span>
            </div>
            <div className="space-y-3 flex-1">{children}</div>
        </div>
    );
}

function EmptyCol({ icon, text, sub }: { icon: string; text: string; sub: string }) {
    return (
        <div className="flex flex-col items-center text-center py-12 px-4 h-full justify-center">
            <span className="text-3xl mb-3 opacity-40">{icon}</span>
            <p className="text-[13px] font-medium text-[#1D1D1F] mb-1">{text}</p>
            <p className="text-[12px] text-[#86868B] leading-relaxed">{sub}</p>
        </div>
    );
}

function FormBadge({ title }: { title?: string }) {
    if (!title) return null;
    return (
        <div className="mt-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F5F7] text-[#86868B] border border-[#E5E5EA]">
                {title}
            </span>
        </div>
    );
}

function NewCard({ id, name, email, date, status, formTitle, onRefresh, onViewAnswers }: any) {
    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o cliente ${name}?`)) return;
        const supabase = createClient();
        await supabase.from("clients").delete().eq("id", id);
        onRefresh();
    };

    return (
        <div className="bg-white rounded-[18px] p-4 border border-black/[0.05] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <p className="font-semibold text-[14px] text-[#1D1D1F] leading-tight">{name}</p>
                    {email && <p className="text-[12px] text-[#86868B] mt-0.5 break-all leading-tight">{email}</p>}
                    <p className="text-[11px] text-[#86868B]/75 mt-1">{date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">{status}</span>
                    <button onClick={handleDelete} className="p-1 hover:bg-red-50 text-[#86868B] hover:text-red-500 rounded-md transition-colors" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <FormBadge title={formTitle} />
            <div className="mt-3">
                <button onClick={onViewAnswers}
                    className="w-full py-2 rounded-full text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all outline-none bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] active:scale-95">
                    <Eye className="w-3.5 h-3.5" /> Ver Respostas
                </button>
            </div>
        </div>
    );
}

function ReviewCard({ id, name, email, date, status, formTitle, href, onRefresh }: any) {
    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o cliente ${name}?`)) return;
        const supabase = createClient();
        await supabase.from("clients").delete().eq("id", id);
        onRefresh();
    };

    return (
        <div className="bg-white rounded-[18px] p-4 border border-black/[0.05] shadow-sm">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <p className="font-semibold text-[14px] text-[#1D1D1F] leading-tight">{name}</p>
                    {email && <p className="text-[12px] text-[#86868B] mt-0.5 break-all leading-tight">{email}</p>}
                    <p className="text-[11px] text-[#86868B]/75 mt-1">{date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#15B392]/10 text-[#15B392]">{status === "Pronto" ? "Pronto" : status}</span>
                    <button onClick={handleDelete} className="p-1 hover:bg-red-50 text-[#86868B] hover:text-red-500 rounded-md transition-colors" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="mt-3">
                <Link href={href} className="w-full py-2 bg-[#1D1D1F] text-white hover:bg-black rounded-full text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors">
                    Revisar <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </div>
    );
}

function SentCard({ id, name, email, phone, date, formTitle, onRefresh }: any) {
    const cleanPhone = phone ? phone.replace(/\D/g, "") : "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const subject = `Seu Planejamento Personalizado - Aliaddo`;

    const [provider, setProvider] = useState("gmail");
    const [waBody, setWaBody] = useState("");
    const [emailBody, setEmailBody] = useState("");

    useEffect(() => {
        const storedProvider = localStorage.getItem("emailProvider") || "gmail";
        const storedWa = localStorage.getItem("waTemplate") || "Olá {{nome}}! Preparei o seu planejamento personalizado do Aliaddo. Você pode acessá-lo diretamente através deste link: {{link}}";
        const storedEmail = localStorage.getItem("emailTemplate") || "Olá {{nome}}! Preparei o seu planejamento personalizado do Aliaddo. Você pode acessá-lo diretamente através deste link: {{link}}";

        setProvider(storedProvider);
        
        const link = `${origin}/documento/${id}`;
        setWaBody(storedWa.replace(/{{nome}}/g, name).replace(/{{link}}/g, link));
        setEmailBody(storedEmail.replace(/{{nome}}/g, name).replace(/{{link}}/g, link));
    }, [name, id, origin]);

    let emailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    if (provider === "outlook") {
        emailHref = `https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    } else if (provider === "yahoo") {
        emailHref = `https://compose.mail.yahoo.com/?to=${email}&subj=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    } else if (provider === "mailto") {
        emailHref = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    }

    const waHref = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waBody)}`;

    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o cliente ${name}?`)) return;
        const supabase = createClient();
        const { error } = await supabase.from("clients").delete().eq("id", id);
        if (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao deletar: " + error.message);
        } else {
            onRefresh();
        }
    };

    const handleFinalize = async () => {
        const supabase = createClient();
        const { error } = await supabase.from("clients").update({ status: "Finalizado" }).eq("id", id);
        if (error) {
            console.error("Erro ao finalizar:", error);
            alert("Erro ao finalizar: " + error.message);
        } else {
            onRefresh();
        }
    };

    return (
        <div className="bg-white/60 rounded-[18px] p-4 border border-black/[0.04]">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <p className="font-semibold text-[14px] text-[#1D1D1F] opacity-80 leading-tight">{name}</p>
                    {email && <p className="text-[11.5px] text-[#86868B] mt-0.5 break-all leading-tight">{email}</p>}
                    {phone && <p className="text-[11.5px] text-[#86868B] mt-0.5">{phone}</p>}
                    <p className="text-[11px] text-[#86868B]/50 mt-1">{date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 bg-[#0071E3]/10 text-[#0071E3]">Pronto p/ Enviar</span>
                    <button onClick={handleDelete} className="p-1 hover:bg-red-50 text-[#86868B] hover:text-red-500 rounded-md transition-colors" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <FormBadge title={formTitle} />
            
            {/* Linha de botões de ações agrupadas e elegantes com tamanhos idênticos e harmônicos */}
            <div className="mt-4 pt-3 border-t border-black/[0.03] flex gap-1 justify-between w-full">
                <Link href={`/review/${id}`} title="Editar Relatório"
                    className="py-2 px-1 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] rounded-xl flex-1 flex items-center justify-center transition-colors outline-none">
                    <PenLine className="w-[15px] h-[15px] text-[#86868B]" />
                </Link>
                
                {cleanPhone && (
                    <a href={waHref} target="_blank" rel="noreferrer" title="Enviar via WhatsApp"
                        className="py-2 px-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl flex-1 flex items-center justify-center transition-colors outline-none">
                        <Phone className="w-[15px] h-[15px]" />
                    </a>
                )}
                
                {email && (
                    <a href={emailHref} target="_blank" rel="noreferrer" title="Enviar via E-mail"
                        className="py-2 px-1 bg-[#0071E3]/10 hover:bg-[#0071E3]/20 text-[#0071E3] rounded-xl flex-1 flex items-center justify-center transition-colors outline-none">
                        <Mail className="w-[15px] h-[15px]" />
                    </a>
                )}
                
                <Link href={`/review/${id}?print=true`} title="Imprimir"
                    className="py-2 px-1 bg-[#86868B]/10 hover:bg-[#86868B]/20 text-[#86868B] rounded-xl flex-1 flex items-center justify-center transition-colors outline-none">
                    <Printer className="w-[15px] h-[15px]" />
                </Link>
                
                <button onClick={handleFinalize} title="Arquivar em Finalizados"
                    className="py-2 px-1 bg-[#15B392]/10 hover:bg-[#15B392]/20 text-[#15B392] rounded-xl flex-1 flex items-center justify-center transition-colors outline-none">
                    <CheckSquare className="w-[15px] h-[15px]" />
                </button>
            </div>
        </div>
    );
}

function DoneCard({ id, name, email, phone, date, status, formTitle, onRefresh }: any) {
    const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja excluir o cliente finalizado ${name}?`)) return;
        const supabase = createClient();
        await supabase.from("clients").delete().eq("id", id);
        onRefresh();
    };

    const handleRestore = async () => {
        const supabase = createClient();
        const { error } = await supabase.from("clients").update({ status: "Enviado" }).eq("id", id);
        if (error) {
            console.error("Erro ao restaurar:", error);
            alert("Erro ao restaurar: " + error.message);
        } else {
            onRefresh();
        }
    };

    return (
        <div className="bg-white/40 rounded-[18px] p-4 border border-black/[0.03]">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <p className="font-semibold text-[14px] text-[#1D1D1F] leading-tight opacity-70">{name}</p>
                    {email && <p className="text-[11.5px] text-[#86868B] mt-0.5 break-all leading-tight">{email}</p>}
                    {phone && <p className="text-[11.5px] text-[#86868B] mt-0.5">{phone}</p>}
                    <p className="text-[11px] text-[#86868B]/50 mt-1">{date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 bg-emerald-100 text-emerald-700">Concluído</span>
                    <button onClick={handleDelete} className="p-1 hover:bg-red-50 text-[#86868B] hover:text-red-500 rounded-md transition-colors" title="Excluir">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <FormBadge title={formTitle} />
            
            {/* Linha de botões de ações para cards Finalizados */}
            <div className="mt-4 pt-3 border-t border-black/[0.03] flex gap-1.5 w-full">
                <a href={`/documento/${id}`} target="_blank" rel="noreferrer" title="Visualizar Relatório do Cliente"
                    className="py-2 px-1 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] rounded-xl flex-1 flex items-center justify-center gap-1 transition-colors outline-none text-[11px] font-medium whitespace-nowrap">
                    <Eye className="w-[14px] h-[14px] text-[#86868B]" /> Ver Relatório
                </a>
                
                <button onClick={handleRestore} title="Trazer de Volta para Enviar"
                    className="py-2 px-1 bg-[#0071E3]/10 hover:bg-[#0071E3]/20 text-[#0071E3] rounded-xl flex-1 flex items-center justify-center gap-1 transition-colors outline-none text-[11px] font-medium whitespace-nowrap">
                    <RefreshCw className="w-[12px] h-[12px]" /> Trazer de Volta
                </button>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Link2, Webhook, Settings, Save, Sparkles } from "lucide-react";
import { useSettings } from "@/components/settings-context";

export default function IntegrationsPage() {
    const { username: contextUsername, isLoading: contextLoading } = useSettings();
    const [username, setUsername] = useState("");
    const [copiedWebhook, setCopiedWebhook] = useState(false);
    const [copiedForm, setCopiedForm] = useState(false);

    // Configuração de Disparos Customizados
    const [emailProvider, setEmailProvider] = useState("gmail");
    const [waTemplate, setWaTemplate] = useState("Olá {{nome}}! Preparei o seu planejamento personalizado do Aliaddo. Você pode acessá-lo diretamente através deste link: {{link}}");
    const [emailTemplate, setEmailTemplate] = useState("Olá {{nome}}! Preparei o seu planejamento personalizado do Aliaddo. Você pode acessá-lo diretamente através deste link: {{link}}");
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!contextLoading) {
            setUsername(contextUsername || "");
        }
    }, [contextUsername, contextLoading]);

    useEffect(() => {
        const storedProvider = localStorage.getItem("emailProvider");
        const storedWa = localStorage.getItem("waTemplate");
        const storedEmail = localStorage.getItem("emailTemplate");
        
        if (storedProvider) setEmailProvider(storedProvider);
        if (storedWa) setWaTemplate(storedWa);
        if (storedEmail) setEmailTemplate(storedEmail);
    }, []);

    const handleSaveConfig = () => {
        localStorage.setItem("emailProvider", emailProvider);
        localStorage.setItem("waTemplate", waTemplate);
        localStorage.setItem("emailTemplate", emailTemplate);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const webhookUrl = `${origin}/api/webhook/form/${username}`;
    const formUrl = `${origin}/f/${username}`;

    const copy = (text: string, which: "webhook" | "form") => {
        navigator.clipboard.writeText(text);
        if (which === "webhook") { setCopiedWebhook(true); setTimeout(() => setCopiedWebhook(false), 2000); }
        else { setCopiedForm(true); setTimeout(() => setCopiedForm(false), 2000); }
    };

    return (
        <div className="max-w-5xl mx-auto px-8 py-10">

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-11 h-11 rounded-[16px] bg-[#1D1D1F] flex items-center justify-center shrink-0">
                        <Link2 className="w-5 h-5 text-[#15B392]" strokeWidth={1.8} />
                    </div>
                    <h1 className="text-[26px] font-semibold text-[#1D1D1F] tracking-tight">Integrações</h1>
                </div>
                <p className="text-[14px] text-[#86868B] mt-1 ml-[52px]">Conecte ferramentas externas ou use o formulário nativo do Aliaddo para coletar respostas dos seus clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Webhook */}
                <div className="bg-white rounded-[24px] p-7 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-[14px] bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center">
                            <Webhook className="w-5 h-5 text-[#1D1D1F]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[15px] text-[#1D1D1F]">Webhook</h3>
                            <p className="text-[12px] text-[#86868B]">Typeform, Tally, Google Forms...</p>
                        </div>
                    </div>
                    <p className="text-[13px] text-[#86868B] leading-relaxed mb-5">
                        Cole este URL nas configurações de webhook do seu formulário externo. Quando um cliente responder, o Aliaddo receberá automaticamente.
                    </p>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">URL do Webhook</label>
                    <div className="flex gap-2">
                        <input readOnly value={webhookUrl}
                            className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-[14px] py-3 px-4 text-[12.5px] font-mono text-[#1D1D1F] outline-none min-w-0" />
                        <button onClick={() => copy(webhookUrl, "webhook")}
                            className="px-4 py-3 bg-[#1D1D1F] hover:bg-black text-white rounded-[14px] text-[13px] font-medium flex items-center gap-2 transition-colors whitespace-nowrap outline-none">
                            {copiedWebhook ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
                        </button>
                    </div>
                    <div className="mt-5 p-4 bg-[#F9F9F9] rounded-[14px] border border-[#E5E5EA]">
                        <p className="text-[12px] font-semibold text-[#1D1D1F] mb-2">Como configurar no Typeform</p>
                        <ol className="text-[12px] text-[#86868B] space-y-1.5 list-decimal list-inside leading-relaxed">
                            <li>Abra seu formulário no Typeform</li>
                            <li>Vá em <strong className="text-[#1D1D1F]">Connect → Webhooks</strong></li>
                            <li>Cole o URL acima e salve</li>
                        </ol>
                    </div>
                </div>

                {/* Native form */}
                <div className="bg-white rounded-[24px] p-7 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-[14px] bg-[#15B392]/10 border border-[#15B392]/20 flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-[#15B392]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[15px] text-[#1D1D1F]">Formulário Nativo</h3>
                            <p className="text-[12px] text-[#86868B]">Seu link exclusivo Aliaddo</p>
                        </div>
                    </div>
                    <p className="text-[13px] text-[#86868B] leading-relaxed mb-5">
                        Você possui um formulário público gerado automaticamente. Configure as perguntas na aba <strong className="text-[#1D1D1F]">Formulário</strong> e envie este link diretamente para seus clientes.
                    </p>
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Seu Link Público</label>
                    <div className="flex gap-2 mb-4">
                        <input readOnly value={formUrl}
                            className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-[14px] py-3 px-4 text-[12.5px] font-mono text-[#15B392] font-medium outline-none min-w-0" />
                        <button onClick={() => copy(formUrl, "form")}
                            className="px-4 py-3 bg-[#1D1D1F] hover:bg-black text-white rounded-[14px] text-[13px] font-medium flex items-center gap-2 transition-colors whitespace-nowrap outline-none">
                            {copiedForm ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
                        </button>
                    </div>
                    <a href={formUrl} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] rounded-[14px] text-[13px] font-medium transition-colors">
                        <ExternalLink className="w-4 h-4" /> Abrir formulário
                    </a>
                    <div className="mt-5 p-4 bg-[#15B392]/5 rounded-[14px] border border-[#15B392]/15">
                        <p className="text-[12px] text-[#15B392] font-semibold">✅ Pronto para usar</p>
                        <p className="text-[12px] text-[#86868B] mt-1 leading-relaxed">Configure as perguntas em <strong className="text-[#1D1D1F]">Formulário</strong> e o link já funciona.</p>
                    </div>
                </div>

            </div>

            {/* Configuração de Canais de Envio e Mensagens */}
            <div className="mt-6 bg-white rounded-[24px] p-7 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-[14px] bg-[#1D1D1F] flex items-center justify-center">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[15px] text-[#1D1D1F]">Canais de Envio & Mensagens Customizadas</h3>
                        <p className="text-[12px] text-[#86868B]">Escolha como quer enviar os e-mails e personalize seus textos</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Provedor de E-mail de Preferência</label>
                        <select
                            value={emailProvider}
                            onChange={(e) => setEmailProvider(e.target.value)}
                            className="w-full md:w-[320px] bg-[#F5F5F7] border border-[#E5E5EA] rounded-[14px] py-3 px-4 text-[13px] text-[#1D1D1F] font-medium outline-none"
                        >
                            <option value="gmail">Gmail Web (Recomendado)</option>
                            <option value="outlook">Outlook / Hotmail Web</option>
                            <option value="yahoo">Yahoo Mail Web</option>
                            <option value="mailto">Aplicativo de E-mail Padrão (Mailto)</option>
                        </select>
                        <p className="text-[11.5px] text-[#86868B] mt-2">Determina qual ferramenta será usada quando você clicar no ícone de e-mail dos seus cards.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-black/[0.03]">
                        <div>
                            <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Template de Mensagem (WhatsApp)</label>
                            <textarea
                                value={waTemplate}
                                onChange={(e) => setWaTemplate(e.target.value)}
                                rows={4}
                                className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-[14px] py-3 px-4 text-[13px] text-[#1D1D1F] outline-none leading-relaxed resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-2">Template de Mensagem (E-mail)</label>
                            <textarea
                                value={emailTemplate}
                                onChange={(e) => setEmailTemplate(e.target.value)}
                                rows={4}
                                className="w-full bg-[#F5F5F7] border border-[#E5E5EA] rounded-[14px] py-3 px-4 text-[13px] text-[#1D1D1F] outline-none leading-relaxed resize-none"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-[#F5F5F7] rounded-[14px] border border-[#E5E5EA] flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-[#86868B] leading-relaxed">
                            <strong className="text-[#1D1D1F]">Dica de Customização:</strong> Use os marcadores <code className="px-1.5 py-0.5 bg-white border border-[#E5E5EA] rounded font-mono text-[11px] text-[#1D1D1F] font-semibold">{"{{nome}}"}</code> para inserir o nome do lead e <code className="px-1.5 py-0.5 bg-white border border-[#E5E5EA] rounded font-mono text-[11px] text-[#1D1D1F] font-semibold">{"{{link}}"}</code> para colar o link público de acesso ao relatório de forma dinâmica!
                        </p>
                    </div>

                    <div className="flex justify-end pt-3">
                        <button
                            onClick={handleSaveConfig}
                            className="px-6 py-3 bg-[#1D1D1F] hover:bg-black text-white rounded-[14px] text-[13px] font-medium flex items-center gap-2 transition-all outline-none"
                        >
                            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {isSaved ? "Configurações Salvas!" : "Salvar Configurações"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Platforms */}
            <div className="mt-6 bg-white rounded-[24px] p-6 border border-[#E5E5EA] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <h3 className="font-semibold text-[14px] text-[#1D1D1F] mb-4">Plataformas compatíveis com Webhook</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { name: "Typeform", emoji: "📝", desc: "Formulários conversacionais" },
                        { name: "Tally", emoji: "📋", desc: "Formulários gratuitos" },
                        { name: "Google Forms", emoji: "📊", desc: "Via Zapier/Make" },
                        { name: "Outros", emoji: "🔗", desc: "Qualquer webhook JSON" },
                    ].map(p => (
                        <div key={p.name} className="p-4 bg-[#F9F9F9] rounded-[16px] border border-[#E5E5EA] text-center">
                            <div className="text-2xl mb-2">{p.emoji}</div>
                            <p className="text-[13px] font-semibold text-[#1D1D1F]">{p.name}</p>
                            <p className="text-[11.5px] text-[#86868B] mt-0.5">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


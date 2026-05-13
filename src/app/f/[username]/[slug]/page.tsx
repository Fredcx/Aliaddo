"use client";

import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";

interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'tel' | 'number' | 'date' | 'boolean';
    required: boolean;
    placeholder: string;
}

export default function PublicFormPage({ params }: { params: { username: string, slug: string } }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profile, setProfile] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});

    const [step, setStep] = useState(1);
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");

    useEffect(() => {
        fetch(`/api/form/${params.username}/${params.slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setProfile(data.profile);
                    setSettings(data.settings);
                    // Initialize form data
                    const initialData: Record<string, string> = {};
                    data.settings?.form_fields?.forEach((f: FormField) => {
                        initialData[f.id] = "";
                    });
                    setFormData(initialData);
                }
                setIsLoading(false);
            })
            .catch(() => {
                setError("Erro de conexão.");
                setIsLoading(false);
            });
    }, [params.username, params.slug]);

    const handleChange = (id: string, value: string) => {
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            "Nome Completo": clientName,
            "E-mail": clientEmail,
            "Telefone": clientPhone
        };

        try {
            // We'll submit straight to the new webhook route
            const res = await fetch(`/api/webhook/form/${params.username}/${params.slug}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsSuccess(true);
            } else {
                alert("Erro ao enviar formulário. Tente novamente.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão ao enviar formulário.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
                <Loader2 className="w-8 h-8 text-[#1D1D1F] animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-sm border border-black/[0.04]">
                    <h1 className="text-xl font-semibold text-[#1D1D1F] mb-2">Formulário Indisponível</h1>
                    <p className="text-[#86868B]">{error || "Página não encontrada."}</p>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors" style={{ backgroundColor: `${settings?.primary_color || '#15B392'}15` }}>
                        <CheckCircle className="w-8 h-8" style={{ color: settings?.primary_color || '#15B392' }} />
                    </div>
                    <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-3">Tudo Certo!</h1>
                    <p className="text-[#86868B] text-[15px] leading-relaxed">
                        Recebemos suas respostas com sucesso. Obrigado pelo preenchimento!
                    </p>
                </div>
            </div>
        );
    }

    const formFields: FormField[] = settings?.form_fields || [];
    const focusStyle = settings?.primary_color ? { "--tw-ring-color": settings.primary_color } as React.CSSProperties : {};

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center py-12 px-6">
            <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Cabeçalho do Form */}
                <div className="text-center mb-10">
                    <h1 className="text-[28px] font-semibold tracking-tight text-[#1D1D1F] mb-3">
                        {profile?.company_name || profile?.full_name || "Diagnóstico Inicial"}
                    </h1>
                    <p className="text-[#86868B] text-[16px]">
                        {step === 1 
                            ? "Identifique-se para darmos início ao seu diagnóstico personalizado." 
                            : "Responda às perguntas abaixo com o máximo de detalhes possível."}
                    </p>
                </div>

                {/* Form Wrapper */}
                <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/[0.04]">
                    {settings?.form_cover_image_url && (
                        <div className="w-full h-40 md:h-56 bg-[#E5E5EA] relative">
                            <img src={settings.form_cover_image_url} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                    )}

                    {/* Barra de Progresso */}
                    <div className="px-8 pt-6 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-[#F5F5F7] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-300" 
                                 style={{ 
                                     width: step === 1 ? '50%' : '100%', 
                                     backgroundColor: settings?.primary_color || '#1D1D1F' 
                                 }} />
                        </div>
                        <span className="text-[11px] font-bold text-[#86868B] shrink-0">
                            Etapa {step} de 2
                        </span>
                    </div>

                    <div className="p-8 sm:p-10 pt-6">
                        {step === 1 ? (
                            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                                <div>
                                    <label className="block text-[14px] font-semibold text-[#1D1D1F] mb-2">Qual o seu Nome Completo?</label>
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="Ex: João da Silva"
                                        className="w-full bg-[#F5F5F7] border border-[#F5F5F7] focus:bg-white focus:border-current focus:ring-1 focus:ring-current rounded-2xl px-5 py-3.5 text-[15px] text-[#1D1D1F] outline-none transition-all"
                                        style={{ color: settings?.primary_color || '#15B392', ...focusStyle }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[14px] font-semibold text-[#1D1D1F] mb-2">Qual o seu melhor E-mail?</label>
                                    <input
                                        type="email"
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        placeholder="Ex: joao@exemplo.com"
                                        className="w-full bg-[#F5F5F7] border border-[#F5F5F7] focus:bg-white focus:border-current focus:ring-1 focus:ring-current rounded-2xl px-5 py-3.5 text-[15px] text-[#1D1D1F] outline-none transition-all"
                                        style={{ color: settings?.primary_color || '#15B392', ...focusStyle }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[14px] font-semibold text-[#1D1D1F] mb-2">Qual o seu WhatsApp / Telefone?</label>
                                    <input
                                        type="tel"
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        placeholder="Ex: (11) 99999-9999"
                                        className="w-full bg-[#F5F5F7] border border-[#F5F5F7] focus:bg-white focus:border-current focus:ring-1 focus:ring-current rounded-2xl px-5 py-3.5 text-[15px] text-[#1D1D1F] outline-none transition-all"
                                        style={{ color: settings?.primary_color || '#15B392', ...focusStyle }}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 mt-8 text-white rounded-full font-medium text-[15px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                                    style={{ backgroundColor: settings?.primary_color || '#1D1D1F' }}
                                >
                                    Iniciar Diagnóstico <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                                {formFields.map((field) => (
                                    <div key={field.id}>
                                        <label className="block text-[14px] font-semibold text-[#1D1D1F] mb-2">{field.label}</label>

                                        {field.type === 'textarea' ? (
                                            <textarea
                                                value={formData[field.id] || ""}
                                                onChange={(e) => handleChange(field.id, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full bg-[#F5F5F7] border border-[#F5F5F7] focus:bg-white focus:border-current focus:ring-1 focus:ring-current rounded-2xl px-5 py-4 text-[15px] text-[#1D1D1F] outline-none transition-all min-h-[120px] resize-y"
                                                style={{ color: settings?.primary_color || '#15B392', ...focusStyle }}
                                                required={field.required}
                                            />
                                        ) : field.type === 'boolean' ? (
                                            <div className="flex gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleChange(field.id, "Sim")}
                                                    className={`flex-1 py-3.5 rounded-2xl border text-[15px] font-medium transition-all ${
                                                        formData[field.id] === "Sim"
                                                            ? "text-white border-transparent"
                                                            : "bg-[#F5F5F7] text-[#1D1D1F] border-transparent hover:bg-[#E8E8ED]"
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: formData[field.id] === "Sim" ? (settings?.primary_color || '#1D1D1F') : undefined
                                                    }}
                                                >
                                                    Sim
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleChange(field.id, "Não")}
                                                    className={`flex-1 py-3.5 rounded-2xl border text-[15px] font-medium transition-all ${
                                                        formData[field.id] === "Não"
                                                            ? "text-white border-transparent"
                                                            : "bg-[#F5F5F7] text-[#1D1D1F] border-transparent hover:bg-[#E8E8ED]"
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: formData[field.id] === "Não" ? (settings?.primary_color || '#1D1D1F') : undefined
                                                    }}
                                                >
                                                    Não
                                                </button>
                                            </div>
                                        ) : field.type === 'select' ? (
                                            <select
                                                value={formData[field.id] || ""}
                                                onChange={(e) => handleChange(field.id, e.target.value)}
                                                className="w-full bg-[#F5F5F7] border border-[#F5F5F7] focus:bg-white focus:border-current focus:ring-1 focus:ring-current rounded-2xl px-5 py-3.5 text-[15px] text-[#1D1D1F] outline-none transition-all cursor-pointer"
                                                style={{ color: settings?.primary_color || '#15B392', ...focusStyle }}
                                                required={field.required}
                                            >
                                                <option value="" disabled hidden>{field.placeholder || "Selecione uma opção..."}</option>
                                                {(field.options || []).map((opt, idx) => (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={formData[field.id] || ""}
                                                onChange={(e) => handleChange(field.id, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full bg-[#F5F5F7] border border-[#F5F5F7] focus:bg-white focus:border-current focus:ring-1 focus:ring-current rounded-2xl px-5 py-3.5 text-[15px] text-[#1D1D1F] outline-none transition-all"
                                                style={{ color: settings?.primary_color || '#15B392', ...focusStyle }}
                                                required={field.required}
                                            />
                                        )}
                                    </div>
                                ))}

                                {formFields.length > 0 && (
                                    <div className="flex flex-col gap-3 mt-8">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 text-white rounded-full font-medium text-[15px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                                            style={{ backgroundColor: settings?.primary_color || '#1D1D1F' }}
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>Finalizar e Enviar <ArrowRight className="w-4 h-4" /></>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="w-full py-3 bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F] rounded-full font-medium text-[13px] transition-all flex items-center justify-center gap-1"
                                        >
                                            Voltar para Meus Dados
                                        </button>
                                    </div>
                                )}

                                {formFields.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-[#86868B]">Nenhuma pergunta configurada neste formulário.</p>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="mt-4 px-6 py-2.5 bg-[#F5F5F7] text-[#1D1D1F] rounded-full font-medium text-[13px] transition-all"
                                        >
                                            Voltar
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

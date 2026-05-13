"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Trash2, Plus, Check, X, ChevronDown, ChevronUp, PenLine, AlertCircle, CheckCircle2 } from "lucide-react";
import Spinner from "@/components/spinner";

export interface RuleCondition { field: string; operator: string; value: string; }
export interface Rule { id: string; label: string; conditions: RuleCondition[]; then: Record<string, string>; }
export type LogicStep = "write" | "extracting" | "review" | "saved";

const OPERATORS = ["=", "!=", ">", "<", ">=", "<=", "contém", "não contém"];

function RuleCard({ rule, onDelete, onSave }: { rule: Rule; onDelete: () => void; onSave: (r: Rule) => void; }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Rule>(rule);

    const updateCondition = (i: number, key: keyof RuleCondition, val: string) => {
        const c = [...draft.conditions];
        c[i] = { ...c[i], [key]: val };
        setDraft({ ...draft, conditions: c });
    };
    const addCondition = () => setDraft({ ...draft, conditions: [...draft.conditions, { field: "", operator: "=", value: "" }] });
    const removeCondition = (i: number) => setDraft({ ...draft, conditions: draft.conditions.filter((_, idx) => idx !== i) });
    const updateThen = (oldKey: string, newKey: string, val: string) => {
        const t = { ...draft.then };
        delete t[oldKey];
        t[newKey] = val;
        setDraft({ ...draft, then: t });
    };
    const addThen = () => setDraft({ ...draft, then: { ...draft.then, "": "" } });
    const removeThen = (k: string) => { const t = { ...draft.then }; delete t[k]; setDraft({ ...draft, then: t }); };

    const displayRule = editing ? draft : rule;

    return (
        <div className="bg-white border border-[#E5E5EA] rounded-[20px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-5 py-4 bg-[#F5F5F7] border-b border-[#E5E5EA]">
                {editing
                    ? <input value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} className="flex-1 bg-white border border-[#E5E5EA] rounded-lg px-3 py-1.5 text-[14px] font-semibold outline-none mr-3" />
                    : <span className="text-[14px] font-semibold text-[#1D1D1F] truncate">{rule.label}</span>
                }
                <div className="flex items-center gap-2 shrink-0">
                    {editing ? (
                        <>
                            <button onClick={() => { onSave(draft); setEditing(false); }} className="p-1.5 bg-[#34C759]/10 hover:bg-[#34C759]/20 text-[#34C759] rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                            <button onClick={() => { setDraft(rule); setEditing(false); }} className="p-1.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { setDraft(rule); setEditing(true); }} className="p-1.5 hover:bg-[#E5E5EA] text-[#86868B] rounded-lg transition-colors"><PenLine className="w-4 h-4" /></button>
                            <button onClick={onDelete} className="p-1.5 hover:bg-[#FF3B30]/10 text-[#FF3B30] rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </>
                    )}
                </div>
            </div>
            <div className="p-5 space-y-4">
                <div>
                    <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-2">SE</p>
                    {editing ? (
                        <div className="space-y-2">
                            {draft.conditions.map((c, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input value={c.field} onChange={e => updateCondition(i, "field", e.target.value)} placeholder="campo" className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg px-3 py-1.5 text-[13px] outline-none min-w-0" />
                                    <select value={c.operator} onChange={e => updateCondition(i, "operator", e.target.value)} className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg px-2 py-1.5 text-[13px] outline-none">
                                        {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                                    </select>
                                    <input value={c.value} onChange={e => updateCondition(i, "value", e.target.value)} placeholder="valor" className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg px-3 py-1.5 text-[13px] outline-none min-w-0" />
                                    <button onClick={() => removeCondition(i)} className="text-[#FF3B30] p-1 shrink-0"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            ))}
                            <button onClick={addCondition} className="text-[13px] text-[#86868B] hover:text-[#1D1D1F] flex items-center gap-1 mt-1"><Plus className="w-3.5 h-3.5" />Adicionar condição</button>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {displayRule.conditions.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-[13px]">
                                    {i > 0 && <span className="text-[11px] font-bold text-[#86868B] w-6">E</span>}
                                    <span className="font-mono bg-[#F5F5F7] px-2 py-0.5 rounded text-[#1D1D1F]">{c.field}</span>
                                    <span className="text-[#86868B] font-medium">{c.operator}</span>
                                    <span className="font-mono bg-[#F5F5F7] px-2 py-0.5 rounded text-[#15B392] font-semibold">{c.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider mb-2">ENTÃO</p>
                    {editing ? (
                        <div className="space-y-2">
                            {Object.entries(draft.then).map(([k, v]) => (
                                <div key={k} className="flex gap-2 items-center">
                                    <input defaultValue={k} onBlur={e => updateThen(k, e.target.value, v)} placeholder="chave" className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg px-3 py-1.5 text-[13px] outline-none min-w-0 font-mono" />
                                    <span className="text-[#86868B]">=</span>
                                    <input value={v} onChange={e => updateThen(k, k, e.target.value)} placeholder="valor" className="flex-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg px-3 py-1.5 text-[13px] outline-none min-w-0" />
                                    <button onClick={() => removeThen(k)} className="text-[#FF3B30] p-1 shrink-0"><X className="w-3.5 h-3.5" /></button>
                                </div>
                            ))}
                            <button onClick={addThen} className="text-[13px] text-[#86868B] hover:text-[#1D1D1F] flex items-center gap-1 mt-1"><Plus className="w-3.5 h-3.5" />Adicionar saída</button>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {Object.entries(displayRule.then).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-2 text-[13px]">
                                    <span className="font-mono bg-[#F5F5F7] px-2 py-0.5 rounded text-[#1D1D1F]">{k}</span>
                                    <span className="text-[#86868B]">=</span>
                                    <span className="font-semibold text-[#1D1D1F]">{v}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface LogicBuilderProps {
    initialStep: LogicStep;
    initialSourceText: string;
    initialRules: Rule[];
    onSave: (rules: Rule[], sourceText: string) => Promise<void>;
}

export default function LogicBuilder({ initialStep, initialSourceText, initialRules, onSave }: LogicBuilderProps) {
    const [step, setStep] = useState<LogicStep>(initialStep);
    const [sourceText, setSourceText] = useState(initialSourceText);
    const [rules, setRules] = useState<Rule[]>(initialRules);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [extractError, setExtractError] = useState("");

    const handleExtract = async () => {
        if (!sourceText.trim()) return;
        setIsExtracting(true);
        setStep("extracting");
        setExtractError("");
        try {
            const res = await fetch("/api/logic/extract", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: sourceText }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao extrair regras");
            if (!data.rules?.length) throw new Error("Nenhuma regra encontrada. Tente descrever com mais detalhes.");
            setRules(data.rules);
            setStep("review");
        } catch (e: any) {
            setExtractError(e.message);
            setStep("write");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSaveRules = async () => {
        setIsSaving(true);
        try {
            await onSave(rules, sourceText);
            setStep("saved");
        } finally {
            setIsSaving(false);
        }
    };

    const addRule = () => {
        const newRule: Rule = { id: `rule_${Date.now()}`, label: "Nova Regra", conditions: [{ field: "", operator: "=", value: "" }], then: { resultado: "" } };
        setRules(prev => [...prev, newRule]);
    };

    if (step === "extracting") {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
                <div className="w-16 h-16 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
                <div className="text-center">
                    <p className="text-[18px] font-semibold text-[#1D1D1F] mb-1">Analisando sua lógica...</p>
                    <p className="text-[14px] text-[#86868B]">Estamos lendo sua descrição e estruturando as regras</p>
                </div>
            </div>
        );
    }

    if (step === "write") {
        return (
            <div className="space-y-6">
                {extractError && (
                    <div className="flex items-start gap-3 p-4 bg-[#FF3B30]/5 border border-[#FF3B30]/20 rounded-[16px]">
                        <AlertCircle className="w-5 h-5 text-[#FF3B30] shrink-0 mt-0.5" />
                        <p className="text-[14px] text-[#FF3B30]">{extractError}</p>
                    </div>
                )}
                <div className="bg-white rounded-[32px] p-8 border border-black/[0.04] shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
                    <div className="flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#181C25] to-[#15B392] flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-semibold text-[#1D1D1F]">Descreva como você trabalha</h3>
                            <p className="text-[14px] text-[#86868B] mt-0.5">Escreva em linguagem natural, como você explicaria para um colega. O sistema vai identificar e estruturar suas regras automaticamente.</p>
                        </div>
                    </div>
                    <textarea
                        value={sourceText}
                        onChange={e => setSourceText(e.target.value)}
                        rows={10}
                        className="w-full p-5 border border-[#E5E5EA] rounded-[20px] text-[14px] text-[#1D1D1F] leading-relaxed focus:ring-2 focus:ring-[#15B392]/20 focus:border-[#15B392] outline-none transition-all resize-none bg-[#F5F5F7]"
                        placeholder={'Exemplo:\n\n"Quando minha paciente tem IMC acima de 30 e quer emagrecer, indico o protocolo de déficit calórico moderado com 1500kcal e reavaliação em 30 dias. Se ela for ativa (academia 3x ou mais por semana), subo para 1800kcal. Para quem quer ganhar massa com IMC abaixo de 25, uso superávit de 300kcal com foco em proteína..."'}
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleExtract}
                            disabled={!sourceText.trim() || isExtracting}
                            className="px-6 py-3 bg-[#1D1D1F] hover:bg-black text-white rounded-full text-[14px] font-medium flex items-center gap-2 transition-all active:scale-95 outline-none disabled:opacity-40"
                        >
                            <Sparkles className="w-4 h-4" />
                            Analisar minha lógica
                        </button>
                    </div>
                </div>
                <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-[20px] p-5">
                    <p className="text-[13px] font-semibold text-[#1D1D1F] mb-3">💡 Dicas para melhores resultados</p>
                    <ul className="text-[13px] text-[#86868B] space-y-1.5 list-disc list-inside leading-relaxed">
                        <li>Descreva suas regras no formato <strong className="text-[#1D1D1F]">"SE [condição], ENTÃO [ação]"</strong></li>
                        <li>Mencione valores específicos: números, categorias, faixas ("acima de 30", "3x por semana")</li>
                        <li>Separe casos diferentes em frases distintas</li>
                        <li>Quanto mais detalhado, mais preciso será o resultado</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (step === "review") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between p-5 bg-[#15B392]/5 border border-[#15B392]/20 rounded-[20px]">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#15B392] shrink-0" />
                        <div>
                            <p className="text-[15px] font-semibold text-[#1D1D1F]">Extraímos {rules.length} {rules.length === 1 ? "regra" : "regras"} da sua lógica</p>
                            <p className="text-[13px] text-[#86868B]">Revise, edite ou adicione regras antes de salvar</p>
                        </div>
                    </div>
                    <button onClick={() => setStep("write")} className="text-[13px] text-[#86868B] hover:text-[#1D1D1F] underline shrink-0">Reescrever</button>
                </div>

                <div className="space-y-4">
                    {rules.map(rule => (
                        <RuleCard
                            key={rule.id}
                            rule={rule}
                            onDelete={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                            onSave={updated => setRules(prev => prev.map(r => r.id === updated.id ? updated : r))}
                        />
                    ))}
                </div>

                <button onClick={addRule} className="w-full py-3 border-2 border-dashed border-[#E5E5EA] hover:border-[#15B392]/50 hover:bg-[#15B392]/5 text-[#86868B] hover:text-[#15B392] rounded-[20px] text-[14px] font-medium flex items-center justify-center gap-2 transition-all">
                    <Plus className="w-4 h-4" /> Adicionar regra manualmente
                </button>

                <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep("write")} className="flex-1 py-3 border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[#86868B] rounded-full text-[14px] font-medium transition-colors outline-none">
                        Reescrever
                    </button>
                    <button onClick={handleSaveRules} disabled={isSaving || rules.length === 0} className="flex-1 py-3 bg-[#1D1D1F] hover:bg-black text-white rounded-full text-[14px] font-medium flex items-center justify-center gap-2 transition-all active:scale-95 outline-none disabled:opacity-40">
                        {isSaving ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
                        {isSaving ? "Salvando..." : "Salvar lógica"}
                    </button>
                </div>
            </div>
        );
    }

    // saved — fully editable inline
    return (
        <div className="space-y-4">
            {/* Status + rewrite option */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#34C759]/5 border border-[#34C759]/20 rounded-[16px]">
                <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
                    <p className="text-[13.5px] font-semibold text-[#1D1D1F]">
                        {rules.length} {rules.length === 1 ? "regra ativa" : "regras ativas"}
                    </p>
                </div>
                <button
                    onClick={() => setStep("write")}
                    className="text-[12px] text-[#86868B] hover:text-[#1D1D1F] transition-colors outline-none underline"
                >
                    Reescrever texto
                </button>
            </div>

            {/* Editable rules list */}
            <div className="space-y-3">
                {rules.map(rule => (
                    <RuleCard
                        key={rule.id}
                        rule={rule}
                        onDelete={() => setRules(prev => prev.filter(r => r.id !== rule.id))}
                        onSave={updated => setRules(prev => prev.map(r => r.id === updated.id ? updated : r))}
                    />
                ))}
            </div>

            {/* Add rule */}
            <button
                onClick={addRule}
                className="w-full py-3 border-2 border-dashed border-[#E5E5EA] hover:border-[#15B392]/40 hover:bg-[#15B392]/5 text-[#86868B] hover:text-[#15B392] rounded-[18px] text-[13px] font-medium flex items-center justify-center gap-2 transition-all outline-none"
            >
                <Plus className="w-4 h-4" /> Adicionar nova regra
            </button>

            {/* Save changes */}
            <button
                onClick={handleSaveRules}
                disabled={isSaving || rules.length === 0}
                className="w-full py-3 bg-[#1D1D1F] hover:bg-black text-white rounded-full text-[14px] font-medium flex items-center justify-center gap-2 transition-all active:scale-95 outline-none disabled:opacity-40"
            >
                {isSaving ? <Spinner size="sm" /> : <Check className="w-4 h-4" />}
                {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
        </div>
    );
}

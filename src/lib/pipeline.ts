export const SALES_STAGES = { new: "Novos", conversation: "Em conversa", proposal: "Proposta", won: "Conquistados", lost: "Encerrados" } as const;
export const ORIGINS = { manual: "Cadastro manual", form: "Formulário", referral: "Indicação", whatsapp: "WhatsApp", other: "Outra origem" } as const;
export type SalesStage = keyof typeof SALES_STAGES;
export type Origin = keyof typeof ORIGINS;
export type Opportunity = {
  id: string; contact_id: string; title: string; stage: SalesStage; origin: Origin;
  amount_cents: number | null; next_step: string; next_date: string | null;
  lost_reason: string; notes: string; version: number; source_submission_id: string | null;
  contacts?: { name: string; email?: string | null; phone?: string | null } | null;
};
export function isSalesStage(value: unknown): value is SalesStage {
  return typeof value === "string" && Object.hasOwn(SALES_STAGES, value);
}
export function isOpenStage(stage: SalesStage) { return ["new", "conversation", "proposal"].includes(stage); }
export function nextSalesStage(stage: SalesStage): SalesStage | null {
  return ({ new: "conversation", conversation: "proposal", proposal: "won", won: null, lost: null } as const)[stage];
}
export function currency(cents: number | null) {
  return cents === null ? "Valor a combinar" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
export function parseOpportunity(data: FormData) {
  const text = (key: string, max: number) => {
    const raw = data.get(key);
    if (raw !== null && typeof raw !== "string") throw new Error("Campo inválido.");
    const value = (raw || "").trim();
    if (value.length > max) throw new Error("Um dos campos excedeu o limite permitido.");
    return value;
  };
  const title = text("title", 160), stage = text("stage", 20) || "new", origin = text("origin", 20) || "manual";
  const next_step = text("next_step", 200), next_date = text("next_date", 10) || null;
  const lost_reason = text("lost_reason", 500), notes = text("notes", 5000), amount = text("amount", 16);
  if (!title) throw new Error("Informe o serviço ou interesse da oportunidade.");
  if (!isSalesStage(stage) || !Object.hasOwn(ORIGINS, origin)) throw new Error("Etapa ou origem inválida.");
  if (Boolean(next_step) !== Boolean(next_date)) throw new Error("Preencha o próximo passo e a data juntos.");
  if (next_date && (!/^\d{4}-\d{2}-\d{2}$/.test(next_date) || !Number.isFinite(Date.parse(next_date)) || new Date(next_date).toISOString().slice(0, 10) !== next_date)) throw new Error("Informe uma data válida.");
  if (stage === "lost" && !lost_reason) throw new Error("Registre o motivo do encerramento.");
  if (amount && !/^\d{1,7}([,.]\d{1,2})?$/.test(amount)) throw new Error("Use um valor como 1500,00, sem separador de milhar.");
  const amount_cents = amount ? Math.round(Number(amount.replace(",", ".")) * 100) : null;
  if (amount_cents !== null && amount_cents > 100000000) throw new Error("O valor máximo é R$ 1.000.000,00.");
  return { title, stage, origin: origin as Origin, amount_cents, next_step, next_date, lost_reason: stage === "lost" ? lost_reason : "", notes };
}

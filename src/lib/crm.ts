export const STAGES = {
  lead: "Novo contato",
  active: "Em acompanhamento",
  paused: "Pausado",
  archived: "Arquivado",
} as const;

export type ContactStage = keyof typeof STAGES;
export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  stage: ContactStage;
  notes: string;
}
export interface ClientTask {
  id: string;
  contact_id: string;
  title: string;
  due_date: string;
  completed_at: string | null;
}
export type ActionResult = { error?: string; id?: string; success?: boolean };

export function isStage(value: string): value is ContactStage {
  return Object.prototype.hasOwnProperty.call(STAGES, value);
}

export function isUUID(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function field(data: FormData, key: string, max: number): string {
  const value = data.get(key);
  if (value !== null && typeof value !== "string") throw new Error("Campo inválido.");
  const text = (value || "").trim();
  if (text.length > max) throw new Error(`O campo ${key} excede o limite de ${max} caracteres.`);
  return text;
}

export function parseContact(data: FormData) {
  const name = field(data, "name", 160);
  const email = field(data, "email", 254).toLowerCase();
  const phone = field(data, "phone", 40);
  const stage = field(data, "stage", 20) || "lead";
  const notes = field(data, "notes", 10000);
  if (!name) throw new Error("Informe o nome do cliente.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  if (!isStage(stage)) throw new Error("Etapa inválida.");
  return { name, email: email || null, phone: phone || null, stage, notes };
}

export function parseTask(data: FormData) {
  const title = field(data, "title", 200);
  const due_date = field(data, "due_date", 10);
  if (!title) throw new Error("Descreva o próximo passo.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date) || !Number.isFinite(Date.parse(due_date)) ||
      new Date(due_date).toISOString().slice(0, 10) !== due_date) {
    throw new Error("Informe uma data válida para o retorno.");
  }
  return { title, due_date };
}

// A return is a calendar day, not a UTC appointment time.
export function todayInBrazil(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatDueDate(value: string) {
  return value.split("-").reverse().join("/");
}

// Keep user search text out of PostgREST's filter syntax and wildcard language.
export function searchTerm(value: unknown = "") {
  if (typeof value !== "string") return "";
  return value.replace(/[^\p{L}\p{N}@ .+\-]/gu, " ").trim().slice(0, 100);
}

export function pageNumber(value?: string) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? Math.min(number, 100000) : 1;
}

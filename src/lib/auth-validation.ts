export function recoveryEmail(value: unknown): string {
  if (typeof value !== "string") throw new Error("Informe seu e-mail.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  return email;
}

export function recoveryRedirect(siteUrl: string | undefined): string {
  if (!siteUrl) throw new Error("A recuperação de acesso ainda precisa ser configurada pelo administrador.");
  let url: URL;
  try { url = new URL(siteUrl); } catch { throw new Error("Endereço do aplicativo inválido na configuração."); }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password) {
    throw new Error("Endereço do aplicativo inválido na configuração.");
  }
  return `${url.origin}/auth/callback?next=/reset-password`;
}

export function authDestination(value: string | null) {
  return value === "/reset-password" ? value : "/home";
}

export function newPassword(password: unknown, confirmation: unknown): string {
  if (typeof password !== "string" || password.length < 8) throw new Error("Use uma senha com pelo menos 8 caracteres.");
  if (new TextEncoder().encode(password).length > 72) throw new Error("A senha é muito longa. Use uma senha menor.");
  if (password !== confirmation) throw new Error("As senhas não coincidem.");
  return password;
}

export function isPublicAuthRoute(pathname: string) {
  return ["/login", "/forgot-password", "/auth/callback"].includes(pathname);
}

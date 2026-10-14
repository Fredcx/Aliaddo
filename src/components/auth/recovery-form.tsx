"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { requestPasswordReset } from "@/app/forgot-password/actions";
import { changePassword } from "@/app/reset-password/actions";

export function RecoveryForm({ reset = false }: { reset?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const locked = useRef(false);
  const field = "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#147D69] focus:ring-2 focus:ring-emerald-100";
  if (success) return <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
    <p>{reset ? "Sua senha foi alterada." : "Se houver uma conta com esse e-mail, você receberá um link para recuperar o acesso. Confira também a pasta de spam e abra o link neste mesmo navegador."}</p>
    <Link href={reset ? "/home" : "/login"} className="mt-4 inline-block font-semibold underline">{reset ? "Abrir o Aliaddo" : "Voltar para entrar"}</Link>
  </div>;
  return <form onSubmit={async event => {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    const data = new FormData(event.currentTarget);
    setPending(true); setError("");
    try {
      const result = await (reset ? changePassword(data) : requestPasswordReset(data));
      if (result.error) setError(result.error);
      else setSuccess(true);
    } catch { setError("Não foi possível confirmar a solicitação. Verifique sua conexão e tente novamente."); }
    finally { locked.current = false; setPending(false); }
  }} className="space-y-5">
    <fieldset disabled={pending} className="space-y-4">
      {reset ? <>
        <label className="block text-sm font-medium" htmlFor="new-password">Nova senha
          <input id="new-password" name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={field} />
        </label>
        <label className="block text-sm font-medium" htmlFor="confirm-password">Confirmar nova senha
          <input id="confirm-password" name="confirmPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={field} />
        </label>
      </> : <label className="block text-sm font-medium" htmlFor="recovery-email">E-mail da conta
        <input id="recovery-email" name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
      </label>}
    </fieldset>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={pending} type="submit" className="w-full rounded-full bg-[#147D69] px-5 py-3 font-medium text-white hover:bg-[#106653] disabled:opacity-50">{pending ? "Aguarde…" : reset ? "Salvar nova senha" : "Enviar link de recuperação"}</button>
  </form>;
}

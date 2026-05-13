"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { login, signup } from './actions';

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [isNicheOpen, setIsNicheOpen] = useState(false);
    const [selectedNiche, setSelectedNiche] = useState('');

    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-10 mx-auto">

            <div className="flex justify-center mb-4">
                <BrandLogo className="text-[160px]" />
            </div>

            <div className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
                        {view === 'login' ? 'Bem-vindo(a)' : 'Crie sua conta'}
                    </h1>
                    <p className="text-sm text-[#86868B] mt-1">
                        {view === 'login' ? 'Faça login para continuar.' : 'Comece a otimizar suas consultorias.'}
                    </p>
                </div>

                {/* Google Login Button */}
                <button
                    onClick={async () => {
                        const { createClient } = await import('@/utils/supabase/client');
                        const supabase = createClient();
                        await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                                redirectTo: `${window.location.origin}/auth/callback`
                            }
                        });
                    }}
                    className="flex justify-center items-center gap-3 bg-white border border-[#E5E5EA] hover:bg-[#F5F5F7] rounded-full px-4 py-3.5 text-[#1D1D1F] font-medium mb-4 w-full transition-all active:scale-[0.98] shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                    type="button"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continuar com Google
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-[#E5E5EA] flex-1"></div>
                    <span className="text-[13px] text-[#86868B] uppercase tracking-wider font-semibold">ou</span>
                    <div className="h-px bg-[#E5E5EA] flex-1"></div>
                </div>

                <form action={view === 'login' ? login : signup} className="flex flex-col w-full gap-2">
                    {view === 'signup' && (
                        <>
                            <label className="text-[13px] text-[#1D1D1F] font-medium mt-2" htmlFor="fullName">
                                Nome Completo
                            </label>
                            <input
                                className="rounded-xl px-4 py-3.5 bg-white border border-[#E5E5EA] mb-2 outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[15px]"
                                name="fullName"
                                placeholder="João da Silva"
                                required={view === 'signup'}
                            />

                            <label className="text-[13px] text-[#1D1D1F] font-medium mt-1" htmlFor="phone">
                                Celular / WhatsApp
                            </label>
                            <input
                                className="rounded-xl px-4 py-3.5 bg-white border border-[#E5E5EA] mb-2 outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[15px]"
                                name="phone"
                                type="tel"
                                placeholder="(11) 90000-0000"
                                required={view === 'signup'}
                            />

                            <label className="text-[13px] text-[#1D1D1F] font-medium mt-1" htmlFor="niche">
                                Sua Área/Nicho
                            </label>
                            
                            <div className="relative mb-2">
                                <input 
                                    type="text" 
                                    name="niche" 
                                    value={selectedNiche} 
                                    onChange={() => {}} 
                                    required={view === 'signup'} 
                                    className="absolute inset-0 w-full h-[1px] opacity-0 pointer-events-none -z-10 focus:outline-none focus:ring-0"
                                    tabIndex={-1}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsNicheOpen(!isNicheOpen)}
                                    className="w-full text-left rounded-xl px-4 py-3.5 bg-white border border-[#E5E5EA] outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[15px] flex justify-between items-center"
                                    aria-haspopup="listbox"
                                    aria-expanded={isNicheOpen}
                                >
                                    <span className={selectedNiche ? "text-[#1D1D1F]" : "text-gray-400"}>
                                        {selectedNiche || "Selecione seu nicho principal..."}
                                    </span>
                                    <svg className={`w-4 h-4 transition-transform text-[#86868B] ${isNicheOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                
                                {isNicheOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-[5]" 
                                            onClick={() => setIsNicheOpen(false)}
                                        ></div>
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-[#E5E5EA] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden py-1">
                                            {["Nutricionista", "Dermatologista", "Biomédico / Médico", "Médicos Estéticos", "Personal Trainer", "Consultores de saúde e bem estar", "Outros"].map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedNiche(option);
                                                        setIsNicheOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-[15px] hover:bg-[#F5F5F7] text-[#1D1D1F] transition-colors focus:bg-[#F5F5F7] outline-none"
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    <label className="text-[13px] text-[#1D1D1F] font-medium mt-1" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="rounded-xl px-4 py-3.5 bg-white border border-[#E5E5EA] mb-2 outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[15px]"
                        name="email"
                        type="email"
                        placeholder="voce@exemplo.com"
                        required
                    />

                    <label className="text-[13px] text-[#1D1D1F] font-medium mt-1" htmlFor="password">
                        Senha
                    </label>
                    <input
                        className="rounded-xl px-4 py-3.5 bg-white border border-[#E5E5EA] mb-2 outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[15px]"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />

                    {view === 'signup' && (
                        <>
                            <label className="text-[13px] text-[#1D1D1F] font-medium mt-1" htmlFor="confirmPassword">
                                Confirmar Senha
                            </label>
                            <input
                                className="rounded-xl px-4 py-3.5 bg-white border border-[#E5E5EA] mb-4 outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[15px]"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                required={view === 'signup'}
                            />
                        </>
                    )}                    {view === 'login' ? (
                        <>
                            <button
                                type="submit"
                                className="bg-[#1D1D1F] hover:bg-black rounded-full px-4 py-3.5 text-white font-medium mb-4 w-full transition-all active:scale-[0.98]"
                            >
                                Entrar com e-mail
                            </button>
                            <p className="text-center text-[14px] text-[#86868B]">
                                Não tem uma conta?{' '}
                                <button type="button" onClick={() => setView('signup')} className="text-[#1D1D1F] font-semibold hover:underline">
                                    Criar agora
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            <button
                                type="submit"
                                className="bg-[#1D1D1F] hover:bg-black rounded-full px-4 py-3.5 text-white font-medium mb-4 w-full transition-all active:scale-[0.98]"
                            >
                                Criar conta com e-mail
                            </button>
                            <p className="text-center text-[14px] text-[#86868B]">
                                Já tem uma conta?{' '}
                                <button type="button" onClick={() => setView('login')} className="text-[#1D1D1F] font-semibold hover:underline">
                                    Fazer login
                                </button>
                            </p>
                        </>
                    )}

                    {searchParams?.message && (
                        <p className={`mt-4 p-4 text-center rounded-xl font-medium text-[14px] ${searchParams.message.includes('Verifique') || searchParams.message.includes('Cadastro')
                            ? 'bg-[#34C759]/10 text-[#248A3D]'
                            : 'bg-[#EF4444]/10 text-[#EF4444]'
                            }`}>
                            {searchParams.message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}

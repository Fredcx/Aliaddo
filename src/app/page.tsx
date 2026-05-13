"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "./landing.css";
import { 
  ArrowRight, CheckCircle2, LayoutDashboard, BrainCircuit, 
  Send, Palette, ShieldCheck, FileText, Menu, X, XCircle, ChevronRight,
  Clock, Eye, Mail, Phone, PenLine
} from "lucide-react";

// Hook for fade-up animation
function useFadeObserver() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; 
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) { 
        el.classList.add("visible"); 
        obs.unobserve(el); 
      } 
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function FadeUp({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
  const r = useFadeObserver();
  return <div ref={r} className={`fade-up-element ${delay ? `delay-${delay}` : ""} ${className}`}>{children}</div>;
}

const FEATURES = [
  { stat: "10x", title: "Mais rápido", desc: "Reduza o tempo de criação de relatórios de horas para segundos.", icon: BrainCircuit },
  { stat: "100%", title: "Personalizável", desc: "Campos adaptados à sua necessidade com visual premium.", icon: Palette },
  { stat: "Zero", title: "Planilhas", desc: "Mesa Kanban visual atualizada em tempo real.", icon: LayoutDashboard },
  { stat: "1 Clique", title: "Envio fácil", desc: "Disparo automático do relatório direto para o WhatsApp.", icon: Send },
  { stat: "PDF", title: "Profissional", desc: "Geração de documentos bonitos, prontos para apresentar.", icon: FileText },
  { stat: "Seguro", title: "Seus dados", desc: "Privacidade total, nenhuma IA externa treina com seus leads.", icon: ShieldCheck },
];

// ── LIVE INTERACTIVE PRODUCT MOCKUPS FOR HIGHEST QUALITY (RETINA VECTOR) ──

function MockupForm() {
  return (
    <div className="w-full h-full bg-[#F9F9FB] flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-[360px] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.06)] border border-gray-100 p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between mb-1">
          <div className="h-1.5 w-2/3 bg-blue-600 rounded-full" />
          <span className="text-[10px] font-bold text-gray-400">Etapa 2 de 2</span>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1.5">Seu Nome Completo</label>
          <div className="w-full bg-[#F5F5F7] border border-[#E5E5EA] text-gray-500 text-[12px] px-3.5 py-2 rounded-xl font-medium">João Silva</div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1.5">Seu Melhor E-mail</label>
          <div className="w-full bg-[#F5F5F7] border border-[#E5E5EA] text-gray-500 text-[12px] px-3.5 py-2 rounded-xl font-medium">joao@empresa.com</div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-700 block mb-1.5">Qual seu maior desafio hoje?</label>
          <div className="w-full bg-[#F5F5F7] border border-[#E5E5EA] text-gray-400 text-[12px] px-3.5 py-2.5 rounded-xl h-20 leading-relaxed">Descreva o problema que você está enfrentando...</div>
        </div>
        <button className="w-full py-3 bg-[#0071E3] text-white text-[12px] font-semibold rounded-full flex items-center justify-center gap-1.5 hover:bg-blue-600 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,113,227,0.2)] mt-2">
          Finalizar e Enviar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function MockupKanban() {
  return (
    <div className="w-full h-full bg-[#F9F9FB] p-4 sm:p-6 overflow-hidden flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
        <div className="w-8 h-8 rounded-xl bg-[#1D1D1F] flex items-center justify-center shrink-0 shadow-sm">
          <LayoutDashboard className="w-4 h-4 text-[#1DB989]" />
        </div>
        <div>
          <div className="text-[12px] font-bold text-gray-900 tracking-tight leading-tight">Mesa de Trabalho</div>
          <div className="text-[10px] text-gray-400 font-medium">Consultoria em tempo real</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-1 overflow-hidden">
        {/* Col 1 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-1"><Clock className="w-2.5 h-2.5 text-amber-500" /> NOVAS</span>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-200/50 px-1.5 rounded-full">2</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-black/[0.02] shadow-sm flex flex-col gap-1 select-none">
            <div className="flex justify-between items-start gap-1">
              <div className="text-[11px] font-bold text-gray-800 leading-tight">Alice Costa</div>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 whitespace-nowrap">Aguardando</span>
            </div>
            <div className="text-[9px] text-gray-400 break-all font-mono mt-0.5">alice.costa@gmail.com</div>
            <div className="mt-2 w-full py-1 text-center bg-[#F5F5F7] text-[9px] font-bold rounded-lg flex items-center justify-center gap-1 text-gray-600 hover:bg-gray-200/60 transition-colors cursor-pointer"><Eye className="w-2.5 h-2.5"/> Ver Respostas</div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-1"><FileText className="w-2.5 h-2.5 text-[#1DB989]" /> REVISÃO</span>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-200/50 px-1.5 rounded-full">1</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-black/[0.02] shadow-sm flex flex-col gap-1 select-none border-l-2 border-l-[#1DB989]">
            <div className="flex justify-between items-start gap-1">
              <div className="text-[11px] font-bold text-gray-800 leading-tight">Carlos Mendes</div>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#1DB989]/10 text-[#1DB989] whitespace-nowrap">Processando</span>
            </div>
            <div className="text-[9px] text-gray-400 break-all font-mono mt-0.5">carlos.m@empresa.com</div>
            <div className="mt-2 w-full py-1.5 bg-[#1D1D1F] text-white text-[9px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-sm transition-colors hover:bg-black cursor-pointer">Revisar <ArrowRight className="w-2.5 h-2.5" /></div>
          </div>
        </div>

        {/* Col 3 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-1"><Send className="w-2.5 h-2.5 text-[#0071E3]" /> ENVIAR</span>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-200/50 px-1.5 rounded-full">1</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-black/[0.02] shadow-sm flex flex-col gap-1 select-none opacity-90">
            <div className="flex justify-between items-start gap-1">
              <div className="text-[11px] font-bold text-gray-800 leading-tight">Lucas Pereira</div>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 whitespace-nowrap">Pronto p/ Enviar</span>
            </div>
            <div className="text-[9px] text-gray-400 break-all font-mono mt-0.5">lucas.pr@gmail.com</div>
            <div className="mt-2.5 pt-2 border-t border-gray-100 flex gap-1 w-full">
              <div className="flex-1 py-1 bg-[#F5F5F7] rounded-md text-gray-400 flex justify-center items-center"><PenLine className="w-3 h-3"/></div>
              <div className="flex-1 py-1 bg-green-50 rounded-md text-green-500 flex justify-center items-center"><Phone className="w-3 h-3"/></div>
              <div className="flex-1 py-1 bg-blue-50 rounded-md text-blue-500 flex justify-center items-center"><Mail className="w-3 h-3"/></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupReport() {
  return (
    <div className="w-full h-full bg-[#F9F9FB] flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-500 relative">
      <div className="bg-white w-full max-w-[280px] sm:max-w-[320px] aspect-[1/1.41] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-8 flex flex-col gap-4 origin-top scale-[0.85] translate-y-2">
        <div className="border-b-2 pb-4 border-[#1DB989] flex justify-between items-center">
          <div className="text-[13px] font-black text-gray-900 tracking-tight uppercase">DOCUMENTO</div>
          <div className="text-[11px] font-semibold text-[#1DB989]">Diagnóstico IA</div>
        </div>
        
        <div className="border-l-4 border-[#1DB989] pl-3 py-2 text-[11px] leading-relaxed italic text-gray-600 bg-gray-50 rounded-r-lg">
          "Com base no diagnóstico do cliente, elaborei esta estratégia de investimento e redução..."
        </div>
        
        <div className="space-y-2.5 mt-3">
          <div className="h-3 w-2/3 bg-gray-800 rounded-sm mb-1" />
          <div className="h-2 w-full bg-gray-200/80 rounded-sm" />
          <div className="h-2 w-11/12 bg-gray-200/80 rounded-sm" />
          <div className="h-2 w-full bg-gray-200/80 rounded-sm" />
          <div className="h-2 w-4/5 bg-gray-200/80 rounded-sm" />
        </div>

        <div className="space-y-2 mt-2 pt-2">
          <div className="h-3 w-1/2 bg-gray-800 rounded-sm mb-1" />
          <div className="h-2 w-full bg-gray-200/80 rounded-sm" />
          <div className="h-2 w-full bg-gray-200/80 rounded-sm" />
          <div className="h-2 w-3/4 bg-gray-200/80 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"collect" | "analyze" | "deliver">("collect");
  const [menuOpen, setMenuOpen] = useState(false);
  const [stepperProgress, setStepperProgress] = useState(0);
  
  const stepperRef = useRef<HTMLDivElement>(null);
  const revealRef1 = useRef<HTMLSpanElement>(null);
  const revealRef2 = useRef<HTMLSpanElement>(null);

  // Scroll listeners
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      
      // Stepper progress logic
      if (stepperRef.current) {
        const rect = stepperRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // Start filling when the top of the stepper is 80% down the screen
        if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
          const totalDistance = rect.height + windowHeight * 0.4;
          const scrolledPast = (windowHeight * 0.8) - rect.top;
          let progress = (scrolledPast / totalDistance) * 100;
          progress = Math.max(0, Math.min(100, progress));
          setStepperProgress(progress);
        }
      }

      // Final CTA text reveal
      if (revealRef1.current) {
        if (revealRef1.current.getBoundingClientRect().top < window.innerHeight * 0.9) {
          revealRef1.current.classList.add("visible");
        }
      }
      if (revealRef2.current) {
        if (revealRef2.current.getBoundingClientRect().top < window.innerHeight * 0.9) {
          setTimeout(() => {
            if (revealRef2.current) revealRef2.current.classList.add("visible");
          }, 200);
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#FFFFFF", color: "#0A0A0A" }}>

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        menuOpen 
          ? "bg-white py-5 border-b border-transparent" 
          : scrolled 
            ? "nav-scrolled py-3" 
            : "py-5 bg-white/50 backdrop-blur-md"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="z-50 flex items-center">
            <img src="/logo-full-real.png" alt="AliaDDO" className="h-11 md:h-14 w-auto object-contain" />
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {[{l:"O Produto",h:"#produto"},{l:"Como Funciona",h:"#fluxo"},{l:"Diferenciais",h:"#diferenciais"},{l:"Planos",h:"#planos"}].map((t,i) => (
              <a key={i} href={t.h} className="text-[14px] text-gray-500 hover:text-black transition-colors font-medium">
                {t.l}
              </a>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-[14px] font-semibold text-gray-600 hover:text-black transition-colors">Entrar</Link>
            <Link href="/login" className="text-[14px] font-semibold px-5 py-2.5 rounded-full text-white transition-transform hover:scale-105 active:scale-95" style={{ background: "#0A0A0A" }}>
              Começar Grátis
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden z-50 p-2 -mr-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-white z-40 transition-all duration-300 ease-in-out md:hidden flex flex-col pt-28 px-6 ${
        menuOpen 
          ? "translate-y-0 opacity-100 pointer-events-auto visible" 
          : "-translate-y-8 opacity-0 pointer-events-none invisible"
      }`}>
        <nav className="flex flex-col gap-6 text-[24px] font-bold tracking-tight">
          <a href="#produto" onClick={() => setMenuOpen(false)}>O Produto</a>
          <a href="#fluxo" onClick={() => setMenuOpen(false)}>Como Funciona</a>
          <a href="#diferenciais" onClick={() => setMenuOpen(false)}>Diferenciais</a>
          <a href="#planos" onClick={() => setMenuOpen(false)}>Planos</a>
        </nav>
        <div className="mt-auto pb-12 flex flex-col gap-4">
          <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full py-4 text-center text-[16px] font-semibold border border-gray-200 rounded-full">Entrar na Conta</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full py-4 text-center text-[16px] font-semibold text-white rounded-full bg-[#0A0A0A]">Começar Grátis</Link>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="pt-[180px] lg:pt-[220px] pb-16 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <FadeUp delay={1}>
            <h1 className="text-[48px] md:text-[64px] lg:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-6">
              Colete, analise e entregue. <br className="hidden md:block" />
              <span style={{ color: "#1DB989" }}>Em um só lugar.</span>
            </h1>
          </FadeUp>
          <FadeUp delay={2}>
            <p className="text-[18px] md:text-[22px] text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
              A plataforma completa para consultores. Crie formulários inteligentes, organize leads visualmente e gere relatórios com IA em segundos.
            </p>
          </FadeUp>
          <FadeUp delay={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto text-[16px] font-semibold px-8 py-4 rounded-full text-white transition-all hover:scale-105 active:scale-95" style={{ background: "#0A0A0A" }}>
              Criar Conta Grátis
            </Link>
            <a href="#produto" className="w-full sm:w-auto text-[16px] font-semibold px-8 py-4 rounded-full transition-all hover:bg-gray-50" style={{ border: "1px solid #E5E7EB", color: "#0A0A0A" }}>
              Ver como funciona
            </a>
          </FadeUp>
          <FadeUp delay={4}>
            <p className="mt-8 text-[13px] font-medium text-gray-400 flex items-center justify-center gap-2">
              <span className="flex -space-x-2">
                <span className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></span>
                <span className="w-6 h-6 rounded-full border-2 border-white bg-gray-300"></span>
                <span className="w-6 h-6 rounded-full border-2 border-white bg-gray-400"></span>
              </span>
              Mais de 200 consultores já usam o AliaDDO
            </p>
          </FadeUp>

          {/* Floating Mockup */}
          <FadeUp delay={4} className="mt-16 md:mt-24 max-w-4xl mx-auto">
            <div className="floating-mockup bg-white overflow-hidden rounded-[24px] border border-black/[0.04] shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
              <img src="/real-kanban-dashboard.png" alt="AliaDDO Dashboard" className="w-full h-auto block object-cover object-top" />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── LOGOS / CONFIANÇA ── */}
      <section className="py-12 border-y border-gray-100 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <p className="text-[13px] font-bold tracking-[0.1em] text-gray-400 uppercase">Usado por consultores de</p>
        </div>
        <div className="marquee-container opacity-50 font-bold text-[24px] text-gray-800">
          <div className="marquee-content">
            <span>Marketing</span> <span>•</span>
            <span>Jurídico</span> <span>•</span>
            <span>Recursos Humanos</span> <span>•</span>
            <span>Financeiro</span> <span>•</span>
            <span>Vendas</span> <span>•</span>
            <span>Estratégia</span> <span>•</span>
            <span>Tecnologia</span> <span>•</span>
            {/* Duplicated for smooth loop */}
            <span>Marketing</span> <span>•</span>
            <span>Jurídico</span> <span>•</span>
            <span>Recursos Humanos</span> <span>•</span>
            <span>Financeiro</span> <span>•</span>
            <span>Vendas</span> <span>•</span>
            <span>Estratégia</span> <span>•</span>
            <span>Tecnologia</span>
          </div>
        </div>
      </section>

      {/* ── PRODUTO ── */}
      <section id="produto" className="py-24 lg:py-[120px] px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-[36px] md:text-[52px] font-bold tracking-tight leading-tight">
              Tudo o que você precisa. <br className="hidden md:block"/>
              Sem fricção.
            </h2>
          </FadeUp>

          <FadeUp className="flex justify-center mb-16">
            <div className="inline-flex rounded-full p-1.5 bg-gray-100 border border-gray-200">
              {[
                { id: "collect", label: "Coletar" },
                { id: "analyze", label: "Analisar" },
                { id: "deliver", label: "Entregar" },
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveTab(t.id as any)} 
                  className={`px-6 md:px-8 py-3 rounded-full text-[15px] font-semibold transition-all ${activeTab === t.id ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              {activeTab === "collect" && (
                <div key="collect" className="tab-content-active">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(29, 185, 137, 0.1)", color: "#1DB989" }}>
                    <Palette className="w-6 h-6" />
                  </div>
                  <h3 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-6">Formulários que convertem.</h3>
                  <p className="text-[18px] text-gray-500 leading-relaxed mb-8 font-light">
                    Esqueça o Google Forms. Crie interfaces premium de captura de dados com validação inteligente. Um link único, design responsivo e a cara da sua marca.
                  </p>
                  <ul className="space-y-4">
                    {["Campos dinâmicos avançados", "Upload de arquivos seguro", "Design focado em conversão"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[16px] font-medium"><CheckCircle2 className="w-5 h-5" style={{ color: "#1DB989" }} /> {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {activeTab === "analyze" && (
                <div key="analyze" className="tab-content-active">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(29, 185, 137, 0.1)", color: "#1DB989" }}>
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <h3 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-6">Kanban em tempo real.</h3>
                  <p className="text-[18px] text-gray-500 leading-relaxed mb-8 font-light">
                    Cada resposta cai direto na sua mesa de trabalho. Acompanhe o status dos seus clientes de forma visual, sem se perder em planilhas intermináveis.
                  </p>
                  <ul className="space-y-4">
                    {["Gestão de status drag-and-drop", "Busca e filtros instantâneos", "Histórico completo por lead"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[16px] font-medium"><CheckCircle2 className="w-5 h-5" style={{ color: "#1DB989" }} /> {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {activeTab === "deliver" && (
                <div key="deliver" className="tab-content-active">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(29, 185, 137, 0.1)", color: "#1DB989" }}>
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-6">Relatórios via IA em 1 clique.</h3>
                  <p className="text-[18px] text-gray-500 leading-relaxed mb-8 font-light">
                    O nosso Motor IA lê as respostas e redige o relatório completo seguindo a sua metodologia. Aprove, ajuste e envie por WhatsApp imediatamente.
                  </p>
                  <ul className="space-y-4">
                    {["Templates de inteligência exclusivos", "Geração de PDF nativa", "Disparo direto pro WhatsApp do cliente"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[16px] font-medium"><CheckCircle2 className="w-5 h-5" style={{ color: "#1DB989" }} /> {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Image Mockup */}
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="w-full rounded-[32px] overflow-hidden relative aspect-[16/10] bg-[#F9F9FB] border border-black/[0.03] shadow-[0_32px_64px_rgba(0,0,0,0.06)] flex items-center justify-center">
                {activeTab === "collect" && <MockupForm />}
                {activeTab === "analyze" && <MockupKanban />}
                {activeTab === "deliver" && <MockupReport />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="fluxo" className="py-24 lg:py-[120px] px-6 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-24">
            <span className="text-[14px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-4 block">Workflow Simples</span>
            <h2 className="text-[36px] md:text-[52px] font-bold tracking-tight">Do zero à entrega em 4 passos.</h2>
          </FadeUp>

          <div ref={stepperRef} className="relative">
            {/* Stepper Lines for Desktop */}
            <div className="hidden lg:block stepper-line-bg"></div>
            <div className="hidden lg:block stepper-line-fill" style={{ width: `${stepperProgress}%` }}></div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
              {[
                { n: "01", title: "Crie", desc: "Monte o formulário com a sua identidade e perguntas chave." },
                { n: "02", title: "Compartilhe", desc: "Envie o link público para o cliente preencher em qualquer dispositivo." },
                { n: "03", title: "Analise", desc: "Acompanhe a chegada das respostas na mesa Kanban ao vivo." },
                { n: "04", title: "Entregue", desc: "A IA gera o relatório e você compartilha via WhatsApp ou PDF." }
              ].map((step, i) => (
                <FadeUp key={i} delay={i + 1} className="flex flex-row lg:flex-col items-start gap-6 lg:gap-8 bg-white p-6 rounded-2xl lg:bg-transparent lg:p-0 lg:rounded-none shadow-sm lg:shadow-none">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center font-bold text-[16px] lg:text-[18px] shrink-0 transition-colors duration-500 bg-white border-[2px] border-gray-200 text-gray-400"
                       style={{ 
                         borderColor: stepperProgress >= (i * 33) ? "#1DB989" : "#E5E7EB",
                         backgroundColor: stepperProgress >= (i * 33) ? "#1DB989" : "white",
                         color: stepperProgress >= (i * 33) ? "white" : "#9CA3AF"
                       }}>
                    {step.n}
                  </div>
                  <div>
                    <h4 className="text-[20px] font-bold mb-2">{step.title}</h4>
                    <p className="text-[16px] text-gray-500 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ANTES E DEPOIS ── */}
      <section className="py-24 lg:py-[120px] px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-[36px] md:text-[52px] font-bold tracking-tight">O novo padrão de consultoria.</h2>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Sem AliaDDO */}
            <FadeUp delay={1} className="bg-gray-50 rounded-[32px] p-8 md:p-12 border border-gray-100">
              <h3 className="text-[20px] font-bold text-gray-500 mb-8 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-gray-400" /> O jeito antigo
              </h3>
              <ul className="space-y-6">
                {[
                  "Planilhas complexas e bagunçadas",
                  "Formulários genéricos e sem graça",
                  "Horas redigindo relatórios manualmente",
                  "Comunicação fragmentada por email",
                  "Dados perdidos em várias abas"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-[16px] text-gray-600 font-medium">
                    <X className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>

            {/* Com AliaDDO */}
            <FadeUp delay={2} className="rounded-[32px] p-8 md:p-12 border border-transparent relative overflow-hidden bg-[#F0FDF9]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1DB989] rounded-full filter blur-[100px] opacity-10"></div>
              <h3 className="text-[20px] font-bold mb-8 flex items-center gap-3" style={{ color: "#0D6E56" }}>
                <CheckCircle2 className="w-6 h-6" style={{ color: "#1DB989" }} /> Com AliaDDO
              </h3>
              <ul className="space-y-6 relative z-10">
                {[
                  "Mesa Kanban visual e em tempo real",
                  "Formulários premium que dão orgulho",
                  "Relatórios gerados por IA em segundos",
                  "Disparo inteligente direto no WhatsApp",
                  "Tudo centralizado em um só lugar"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-[16px] font-semibold text-gray-900">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#1DB989" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section id="diferenciais" className="py-24 lg:py-[120px] px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <h2 className="text-[36px] md:text-[52px] font-bold tracking-tight">Pensado nos mínimos detalhes.</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FadeUp key={i} delay={(i % 3) + 1}>
                <div className="feature-card rounded-3xl p-8 h-full cursor-default">
                  <div className="flex items-center justify-between mb-8">
                    <f.icon className="w-8 h-8 feature-icon" strokeWidth={1.5} />
                    <span className="text-[24px] font-extrabold tracking-tight" style={{ color: "#1DB989" }}>{f.stat}</span>
                  </div>
                  <h3 className="text-[20px] font-bold mb-3">{f.title}</h3>
                  <p className="text-[16px] text-gray-500 leading-relaxed font-light">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 lg:py-[120px] px-6 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-20">
            <span className="text-[14px] font-bold tracking-[0.14em] uppercase text-gray-400 mb-4 block">Investimento</span>
            <h2 className="text-[36px] md:text-[52px] font-bold tracking-tight mb-6">O plano perfeito para a sua fase.</h2>
            <p className="text-[18px] text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
              Sem contratos de fidelidade ou letras miúdas. Mude de plano ou cancele quando quiser.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch pt-4 pb-8">
            {/* PLANO 1 */}
            <FadeUp delay={1} className="flex">
              <div className="bg-[#F9F9FB] rounded-[32px] p-8 border border-gray-100 flex flex-col w-full transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1">
                <div className="mb-6">
                  <h3 className="text-[20px] font-extrabold text-gray-900 mb-2">Starter</h3>
                  <p className="text-[14px] text-gray-500 font-medium">Ideal para validar suas primeiras consultorias inteligentes.</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-[18px] font-extrabold text-gray-900">R$</span>
                  <span className="text-[56px] font-black tracking-tighter text-gray-900 leading-none">37</span>
                  <span className="text-[14px] text-gray-400 font-semibold">/mês</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "5 Relatórios gerados por IA /mês",
                    "1 Formulário Ativo",
                    "Mesa de Trabalho (Kanban)",
                    "Envio rápido via WhatsApp",
                    "Domínio AliadDO incluído"
                  ].map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[14px] font-medium text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-[#1DB989] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="w-full py-4 px-6 text-center rounded-2xl font-bold text-[15px] border border-gray-200 text-gray-900 bg-white hover:border-gray-400 active:scale-95 transition-all">
                  Começar Agora
                </Link>
              </div>
            </FadeUp>

            {/* PLANO 2 (O BEST SELLER) */}
            <FadeUp delay={2} className="flex relative z-10">
              <div className="bg-white rounded-[32px] p-8 border-[2px] border-[#1DB989] flex flex-col w-full shadow-[0_32px_64px_rgba(29,185,137,0.08)] md:-translate-y-4 hover:-translate-y-5 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-[#1DB989] to-[#0D6E56]"></div>
                <div className="absolute top-4 right-6 bg-[#1DB989] text-[#0A0A0A] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Mais Popular
                </div>
                <div className="mb-6 mt-2">
                  <h3 className="text-[22px] font-black text-gray-900 mb-2 flex items-center gap-2">
                    Pro <ShieldCheck className="w-5 h-5 text-[#1DB989]" />
                  </h3>
                  <p className="text-[14px] text-gray-500 font-medium">Para consultores profissionais em plena atividade.</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-[18px] font-extrabold text-gray-900">R$</span>
                  <span className="text-[56px] font-black tracking-tighter text-gray-900 leading-none">77</span>
                  <span className="text-[14px] text-gray-400 font-semibold">/mês</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "25 Relatórios gerados por IA /mês",
                    "Formulários Ilimitados",
                    "White-label (Remover nossa logo)",
                    "Customização Completa de Cores",
                    "Mesa de Trabalho (Kanban)",
                    "Templates de WhatsApp exclusivos",
                    "Suporte Prioritário"
                  ].map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[14px] font-bold text-gray-900">
                      <CheckCircle2 className="w-5 h-5 text-[#1DB989] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="w-full py-4 px-6 text-center rounded-2xl font-bold text-[15px] text-white bg-[#0A0A0A] hover:bg-gray-900 active:scale-95 shadow-lg transition-all">
                  Assinar Plano PRO
                </Link>
              </div>
            </FadeUp>

            {/* PLANO 3 */}
            <FadeUp delay={3} className="flex">
              <div className="bg-[#F9F9FB] rounded-[32px] p-8 border border-gray-100 flex flex-col w-full transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1">
                <div className="mb-6">
                  <h3 className="text-[20px] font-extrabold text-gray-900 mb-2">Diamond</h3>
                  <p className="text-[14px] text-gray-500 font-medium">Para consultorias sêniores e agências de alta escala.</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-[18px] font-extrabold text-gray-900">R$</span>
                  <span className="text-[56px] font-black tracking-tighter text-gray-900 leading-none">147</span>
                  <span className="text-[14px] text-gray-400 font-semibold">/mês</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "75 Relatórios gerados por IA /mês",
                    "Formulários Ilimitados",
                    "Acesso p/ Equipe (Até 3 consultores)",
                    "White-label Completo",
                    "Painel Kanban Compartilhado",
                    "Gerente de Conta no WhatsApp"
                  ].map((f, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[14px] font-medium text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-[#1DB989] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="w-full py-4 px-6 text-center rounded-2xl font-bold text-[15px] border border-gray-200 text-gray-900 bg-white hover:border-gray-400 active:scale-95 transition-all">
                  Falar com Consultor
                </Link>
              </div>
            </FadeUp>
          </div>
          <p className="text-center mt-8 text-[14px] text-gray-400 font-bold tracking-wide uppercase">
            🚀 Precisa de mais? Oferecemos pacotes de créditos de IA avulsos sob demanda.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL (Dark Section) ── */}
      <section className="relative py-32 lg:py-[180px] px-6 overflow-hidden dark-grid-bg flex items-center justify-center">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h2 className="text-[48px] md:text-[72px] font-extrabold tracking-tight text-white leading-[1.1] mb-12">
            <span ref={revealRef1} className="reveal-line">
              <span>Pare de perder tempo.</span>
            </span>
            <br />
            <span ref={revealRef2} className="reveal-line">
              <span className="text-gray-400">Comece a faturar mais.</span>
            </span>
          </h2>
          <FadeUp delay={3}>
            <Link href="/login" className="btn-pulse inline-flex items-center gap-3 px-10 py-5 rounded-full text-[18px] font-bold transition-transform hover:scale-105 active:scale-95" style={{ background: "#1DB989", color: "#0A0A0A" }}>
              Criar Conta Gratuita <ChevronRight className="w-5 h-5" />
            </Link>
            <p className="mt-8 text-[14px] text-gray-500 font-medium">Sem cartão de crédito. Setup em 2 minutos.</p>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center">
            <img src="/logo-full-real.png" alt="AliaDDO" className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          </Link>
          <p className="text-[14px] text-gray-500">© 2026 AliaDDO. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-[14px] font-medium text-gray-500">
            <a href="#" className="hover:text-black transition-colors">Privacidade</a>
            <a href="#" className="hover:text-black transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

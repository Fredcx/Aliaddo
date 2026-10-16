import Link from "next/link";
import { FileText, Files, Users, GitBranch, ListTodo, ArrowUpRight } from "lucide-react";
import { WorkspaceHeader, workspaceClass } from "./workspace-ui";

const AREAS = [
  { title: "Formulários", icon: FileText, path: "/forms", description: "Crie as perguntas e compartilhe o link para alguém preencher.", example: "Ex.: briefing de consultoria ou informações para o primeiro atendimento." },
  { title: "Respostas e entregas", icon: Files, path: "/dashboard", description: "Veja o que cada pessoa respondeu, gere um rascunho com IA e revise antes de preparar a entrega.", example: "Cada preenchimento é uma resposta. A mesma pessoa pode responder várias vezes." },
  { title: "Clientes", icon: Users, path: "/clients", description: "Guarde os dados, as notas e o histórico de cada pessoa em uma ficha.", example: "Você pode cadastrar alguém sem formulário. Associar uma resposta existente à ficha é opcional." },
  { title: "Oportunidades", icon: GitBranch, path: "/pipeline", description: "Acompanhe o interesse em um serviço, da primeira conversa à contratação.", example: "Ex.: uma proposta de acompanhamento mensal. Um cliente pode ter várias oportunidades." },
  { title: "Tarefas", icon: ListTodo, path: "/follow-ups", description: "Anote uma ação que você precisa realizar para um cliente, com um prazo.", example: "Ex.: ligar na sexta ou revisar uma proposta. Conclua a tarefa depois de fazer a ação." },
];

export function WorkspaceGuide({ href = (path: string) => path }: { href?: (path: string) => string }) {
  return <main className={workspaceClass}><WorkspaceHeader eyebrow="Guia rápido" title="Cada coisa no seu lugar." description="Comece pelo formulário ou pelo cadastro do cliente. Use as outras áreas quando fizerem sentido para o seu trabalho." />
    <div className="mb-8 rounded-3xl border border-[#BCE5E8] bg-[#E8F8FA] p-6"><h2 className="font-semibold text-[#087F8C]">O caminho do atendimento</h2><p className="mt-3 text-lg font-medium leading-relaxed">Formulário → Resposta → Rascunho com IA → Sua revisão → Entrega</p><p className="mt-3 text-sm leading-relaxed text-[#526071]">Clientes, oportunidades e tarefas ajudam a acompanhar esse trabalho. Você não precisa passar por todas as áreas para atender alguém.</p></div>
    <div className="grid gap-4 lg:grid-cols-2">{AREAS.map(area => <Link href={href(area.path)} key={area.path} className="workspace-card p-6 transition hover:border-[#087F8C]"><div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-[#E8F8FA] p-2.5 text-[#087F8C]"><area.icon size={20} /></span><h2 className="flex-1 text-lg font-semibold">{area.title}</h2><ArrowUpRight size={18} /></div><p className="text-sm leading-relaxed text-[#303846]">{area.description}</p><p className="mt-3 text-sm leading-relaxed text-[#64748B]">{area.example}</p></Link>)}</div>
    <section className="workspace-card mt-6 divide-y divide-[#EDF0F3] px-6"><h2 className="py-5 text-lg font-semibold">Dúvidas comuns</h2>
      <details className="py-5"><summary className="cursor-pointer font-medium">O que significa associar uma resposta a um cliente?</summary><p className="mt-3 text-sm leading-relaxed text-[#526071]">É guardar um preenchimento já recebido no histórico da pessoa correta. Isso não envia um novo formulário, não altera as respostas e não cria uma oportunidade. Faça isso apenas quando quiser reunir o histórico. Você pode remover a associação depois.</p></details>
      <details className="py-5"><summary className="cursor-pointer font-medium">Uma tarefa é um agendamento ou uma mensagem automática?</summary><p className="mt-3 text-sm leading-relaxed text-[#526071]">Não. É uma ação para você realizar, com uma data de prazo. Por exemplo, “entrar em contato com Marina”. Ela não reserva horário e não envia mensagem. A área antes chamada Retornos agora se chama Tarefas.</p></details>
      <details className="py-5"><summary className="cursor-pointer font-medium">Preciso colocar todas as respostas no funil?</summary><p className="mt-3 text-sm leading-relaxed text-[#526071]">Não. Crie uma oportunidade quando houver interesse em contratar um serviço. Um formulário de acompanhamento de cliente, por exemplo, pode continuar apenas no histórico e na área de respostas.</p></details>
    </section>
  </main>;
}

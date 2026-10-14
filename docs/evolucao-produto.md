# Aliaddo: de formulários a acompanhamento de clientes

Análise do repositório `Fredcx/Aliaddo`, a partir do commit `08ec06b`, em 13/10/2026. Direção escolhida: uma base comum para consultores e profissionais de consultório. Estas são hipóteses de produto a validar com usuários, não uma pesquisa de mercado.

## O que já existe

O Aliaddo transforma respostas em uma entrega personalizada a partir da lógica do profissional. Tem autenticação Supabase, múltiplos formulários públicos, editor de regras, extração de regras com Gemini, geração de documentos em Markdown, revisão manual, personalização visual e uma mesa de trabalho por etapas.

O fluxo observado é **formulário → resposta → rascunho → revisão → preparação de entrega**. A geração é acionada na interface; os webhooks salvam dados, sem iniciar a IA automaticamente. As regras estruturadas entram no prompt, mas quem decide qual regra aplicar ainda é o modelo, não um motor determinístico.

O WhatsApp abre uma URL com telefone e texto preenchidos. Não há integração de envio com provedor, confirmação de entrega ou fila de mensagens. Os templates ficam no `localStorage` do navegador. O status `Enviado` é usado na coluna “Enviar”, mesmo antes de qualquer envio confirmado.

## Direção proposta

**“Seu aliado para conquistar clientes, organizar a rotina e acompanhar cada atendimento.”**

O formulário continua sendo uma porta de entrada. A razão para voltar ao aplicativo passa a ser acompanhar pessoas: saber o que aconteceu, o que foi combinado e quem precisa de retorno. Isso cria utilidade também nos dias em que ninguém preenche um formulário.

Atualização de direção após esclarecimento do fundador: o destino do produto é um assistente que participa da operação do negócio, conectando captação, funil comercial, agendamento, atendimento e continuidade. Cadastro e retornos são a primeira base já implementada. A especificação dessa visão está em [visao-aliaddo.md](visao-aliaddo.md).

Uma nutricionista e um consultor empresarial compartilham cadastro, histórico, tarefas, documentos e comunicação. Diferem nos campos, termos e métodos de trabalho. A base deve ser comum, com modelos por profissão. Recursos clínicos específicos exigem uma definição própria antes de entrar no produto.

## A reestruturação

`clients` representa uma submissão de formulário: cada envio cria outra linha, à qual pertencem respostas e um documento. Duas respostas da mesma pessoa viram dois “clientes”. Reaproveitar imediatamente essa tabela como cadastro quebraria geração, revisão, webhooks e links existentes.

A primeira evolução mantém o contrato antigo:

```text
Profissional
  └─ Cadastro (contacts)
      ├─ Notas e etapa do relacionamento
      ├─ Retornos (client_tasks)
      └─ Atendimentos vinculados (clients, tabela legada)
          ├─ Respostas (responses)
          └─ Documento revisável (documents)
```

Atendimentos ficam sem vínculo até o profissional identificar a pessoa. O vínculo é explícito e reversível. E-mail não é identidade confiável: familiares e equipes podem compartilhar o endereço, e formulários públicos não verificam sua titularidade.

## Primeira entrega implementada

| Recurso | Comportamento |
| --- | --- |
| Carteira | Cadastro sem formulário, busca, paginação e filtro por etapa |
| Ficha | Nome obrigatório, e-mail e telefone opcionais, notas internas editáveis |
| Relacionamento | Novo contato, em acompanhamento, pausado e arquivado |
| Histórico | Vínculo e desvínculo de respostas, mantendo o documento original |
| Retornos | Próximo passo com data, conclusão e reabertura |
| Pendências | Filtros de hoje, atrasados, pendentes, concluídos e por cliente |
| Navegação | Clientes e Retornos no menu; menu recolhível em telas pequenas |
| Integridade | RLS, autenticação das ações e vínculos limitados à mesma conta |

O status do relacionamento é independente do documento. Um cliente pode continuar “Em acompanhamento” depois de uma entrega finalizada. Retornos são lembretes dentro do app, sem notificações automáticas nesta etapa.

Também foram removidos o endpoint público de seed com senha fixa e a promessa de que a IA nunca inventa informações na tela inicial. A aprovação verifica o salvamento antes de avançar e agora se chama “Aprovar e preparar envio”. Foram corrigidos links para `/form` sem ID e lacunas de tipagem encontradas na compilação. O build deixou de ignorar erros TypeScript.

## Próximas entregas, em ordem

A sequência abaixo foi ajustada para conectar a operação comercial e o atendimento. As funcionalidades desta seção são planejadas, ainda não implementadas.

### 1. Funil comercial conectado à carteira — primeira versão implementada em 14/10

Criar oportunidades por cliente, origem do contato, serviço de interesse, etapa comercial, responsável e próxima ação. Permitir entrada por formulário e cadastro manual; preparar a estrutura para WhatsApp e importação. Uma mesma pessoa pode ter várias oportunidades ao longo do tempo.

A versão inicial oferece oportunidades manuais e conversão explícita de respostas, origem, valor, próxima ação e etapas comerciais. Ainda não inclui equipe, responsáveis ou importação. A tela Hoje também foi implementada com prioridades determinísticas. Consulte [entrega-gestao.md](entrega-gestao.md). Validar essa jornada com profissionais dos dois públicos.

### 2. Agenda conectada ao atendimento

Atendimentos com profissional responsável, horário, duração, disponibilidade, remarcação, cancelamento e situação. Separar compromisso de tarefa: uma consulta às 14h é diferente de “retornar até sexta”. Prevenir horários conflitantes no momento da reserva, inclusive se duas pessoas tentarem agendar juntas.

Critério de saída: o interessado pode se tornar um atendimento agendado, vinculado ao cadastro, sem perder o contexto comercial. A confirmação do horário depende de uma reserva real.

### 3. WhatsApp integrado e automações iniciais

Persistir templates por conta e integrar envio e recebimento com um provedor. Registrar destinatário, conteúdo aprovado, situação e falhas. Resolver o compartilhamento externo dos documentos. Começar por confirmação de formulário, lembrete de agendamento e entrega de documento aprovado.

O envio precisa de fila, idempotência, tentativas limitadas e eventos de confirmação. Sequências de acompanhamento devem parar quando a pessoa responder, agendar, contratar ou pedir interrupção. Escolha do provedor e regras vigentes do canal exigem avaliação própria na implementação.

### 4. Aliaddo como assistente da rotina

Uma tela “Hoje” reúne agenda, interessados aguardando retorno, documentos para revisão e tarefas atrasadas. A IA prepara resumos, sugere prioridades e rascunha mensagens a partir do histórico, indicando as fontes. O profissional escolhe o material usado; notas internas não entram silenciosamente.

Rotinas explícitas podem executar ações previamente configuradas. Decisões novas, descontos e conteúdo profissional exigem revisão conforme a permissão definida para cada ação. Regras comerciais determinísticas devem ser avaliadas em código. Ações realizadas ficam registradas no histórico.

### 5. Financeiro enxuto, conforme a demanda

Pacotes/serviços contratados, valor combinado e situação de pagamento. Validar essa rotina antes de investir em cobrança integrada, emissão fiscal ou ERP. O foco inicial é continuidade do atendimento.

## Como avaliar

Medir profissionais que acompanham clientes semanalmente, tempo até a primeira entrega revisada, proporção de clientes ativos com próximo passo definido e retornos concluídos no prazo. Observar a edição dos rascunhos ajuda a avaliar a utilidade da IA. Volume de formulários isolado não mede se a gestão está funcionando.

## Pendências técnicas identificadas

| Achado | Consequência e tratamento |
| --- | --- |
| `clients` mistura pessoa e resposta | Separação aditiva implementada; renomear para `submissions` no futuro exige migrar os consumidores |
| `/api/seed` público usava credencial administrativa e senha fixa | Endpoint removido |
| Documento “público” passa pelo middleware autenticado e consulta tabelas com RLS do profissional | Com os scripts versionados, o destinatário externo não consegue acessar; desenhar compartilhamento com token revogável sem liberar tabelas inteiras |
| Políticas de leitura pública em `forms` e `profiles` | Acesso direto ao Supabase pode expor campos além dos selecionados pela API; separar projeção pública de regras internas |
| Storage verifica autenticação, não dono do objeto | Revisar alteração e exclusão entre contas |
| Webhooks sem assinatura, limitação de uso e idempotência | Evitar abuso e duplicação; gravar submissão e respostas numa transação |
| Setup SQL incompleto frente ao código | Consolidar migrações, tipos gerados e teste de instalação limpa; `clients.phone` é um exemplo |
| Formulários usam exclusão em cascata sobre atendimentos | Podem apagar histórico; migrar exclusão para arquivamento antes de prometer retenção de histórico |
| Estado de falha e processamento da IA pouco explícito | Evitar geração concorrente, proteger revisões e permitir retentativa rastreável |
| Regras executadas no prompt | Avaliar condições determinísticas em código, sem prometer precisão absoluta |
| Erros de lint no código legado | Nova área passa no lint; corrigir o restante progressivamente |

O Next.js foi atualizado de 14.2.15 para 14.2.35, correção indicada para a linha 14.2 no [aviso oficial de segurança](https://nextjs.org/blog/security-update-2025-12-11). Isso não substitui uma revisão das demais dependências e uma migração planejada para uma linha suportada mais recente.

## Ativação

As três migrações de gestão foram aplicadas ao Supabase Aliaddo em 14/10/2026, com RLS e privilégios verificados no projeto remoto. A entrega foi desenvolvida na branch `codex/client-management`. Consulte o README e [entrega-gestao.md](entrega-gestao.md) para escopo e validação. Testes PostgreSQL locais não substituem um ensaio com autenticação, PostgREST, políticas reais e dados de homologação.

Este núcleo de gestão estabelece a base para evoluir o produto. Não é ainda um prontuário, ERP ou integração completa de WhatsApp.

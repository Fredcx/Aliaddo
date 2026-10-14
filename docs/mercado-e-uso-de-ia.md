# Aliaddo: concorrentes, diferenciação e economia de IA

Pesquisa em 13/10/2026, nas páginas oficiais dos fornecedores. Os recursos abaixo são anunciados por eles; não representam um teste prático de suas plataformas. Disponibilidade pode variar por plano, integração e país. A análise não é um levantamento exaustivo.

## Já existe algo parecido?

Sim. Há produtos que juntam uma parte grande da proposta, inclusive dentro de saúde e bem-estar. A combinação de cadastro, agenda, formulários, automações e IA já tem concorrência direta. O Aliaddo precisa competir pela qualidade de uma rotina específica e pela facilidade de uso.

| Produto | Sobreposição observada nas fontes | O que comparar com o Aliaddo |
| --- | --- | --- |
| Practice Better | Gestão para saúde e bem-estar, agenda, portal do cliente, mensagens, pagamentos, automações e IA para documentação, formulários e preparação de sessões | É uma referência próxima para acompanhamento antes e depois do atendimento. Validar, em demonstração, adequação ao Brasil, canais de comunicação e esforço de configuração |
| HoneyBook | Gestão do fluxo de clientes para prestadores de serviços, formulários de entrada, automações de mensagens/tarefas e IA para criar fluxos e organizar contexto | Referência para transformar interesse em contratação e organizar a operação de serviços |
| Kommo | CRM de conversas, funil, WhatsApp, tarefas e agente de IA; também anuncia agendamento e atuação no segmento de saúde | Concorrente próximo da proposta de assistente comercial. A documentação diferencia o agente que responde mensagens das demais automações de disparo |
| Afya iClinic | Gestão de clínicas e consultórios, agenda, prontuário, financeiro e confirmação/cancelamento via WhatsApp | Mostra que a integração da operação de consultório já é atendida por produtos brasileiros |

Fontes: [Practice Better — funcionalidades](https://practicebetter.io/features), [Practice Better — IA](https://practicebetter.io/ai), [HoneyBook — automações](https://www.honeybook.com/automations), [HoneyBook — IA](https://www.honeybook.com/product/ai), [Kommo — agente](https://www.kommo.com/br/ia/agente-de-ia/), [Kommo — agendamento](https://www.kommo.com/br/agendamento/), [Kommo — documentação do agente](https://support.kommo.com/docs/pt-br/kommo-agente-ia), [iClinic — funcionalidades](https://iclinic.com.br/funcionalidades/), [iClinic — WhatsApp](https://suporte.iclinic.com.br/pt-br/lembrete-e-confirmacao-de-consulta-via-whatsapp).

## Onde vejo uma hipótese de diferenciação

Minha inferência: reunir recursos será necessário, mas não basta para diferenciar. Uma hipótese mais concreta é **transformar o método do profissional em uma rotina de acompanhamento pronta para usar**, conectando entrada, preparação, entrega e retorno.

O Aliaddo já tem um ponto de partida próprio: o profissional descreve como trabalha, configura perguntas e prepara entregas a partir das respostas. Podemos ampliar esse método para definir também próximos passos e mensagens, mantendo visível o que foi automatizado.

Hipóteses para validar, sem tratá-las como vantagens já comprovadas:

- Configuração guiada que coloque uma jornada completa em funcionamento sem o profissional montar dezenas de automações.
- Modelos por profissão sobre uma base comum, com exemplos de formulários, entregas e retornos.
- WhatsApp conectado ao trabalho real: confirmação, contexto, entrega e continuidade.
- Rotinas previsíveis com consumo de IA visível, especialmente para profissionais individuais.
- Histórico que explique por que uma ação ocorreu e permita ao profissional corrigir o processo.

“Feito para brasileiros”, “tem IA” e “é completo” são afirmações insuficientes isoladamente. Também não está comprovado que nossa solução será mais barata ou simples; isso precisa ser medido.

## Como validar antes de ampliar o produto

Executar a mesma jornada no Aliaddo e em duas referências: cadastrar interessado, coletar informações, agendar, preparar entrega e programar retorno. Medir tempo de configuração, passos manuais, informação repetida e necessidade de ferramentas externas. Entrevistar profissionais dos dois públicos usando exemplos reais de sua rotina.

Investigar uma pergunta concreta: **o que hoje exige copiar informações entre WhatsApp, formulário, agenda e documento?** Priorizar a parte dessa jornada que os produtos usados pelo profissional não resolvem satisfatoriamente.

## Onde o código atual usa Gemini

1. `src/app/api/logic/extract/route.ts`: transforma texto do profissional em regras e permite refiná-las. O modelo está fixado em `gemini-2.0-flash`.
2. `src/app/api/generate/route.ts`: envia regras, estrutura e respostas para gerar o documento. O modelo está fixado em `gemini-2.5-flash`.

O segundo ponto é recorrente por atendimento. O primeiro pode ser concentrado na configuração inicial. O editor já permite criar regras manualmente, evitando a chamada de extração quando o profissional preferir.

Não encontrei persistência do consumo de tokens, versão de prompt ou medição por funcionalidade. A rota de geração não define um limite explícito de saída e delega ao modelo a avaliação das regras. Sem telemetria e sem executar chamadas reais, não há base para prometer uma porcentagem de economia.

Os identificadores estão fixos no código. Antes de escolher ou trocar o modelo, conferir disponibilidade e ciclo de vida na [documentação oficial de descontinuações](https://ai.google.dev/gemini-api/docs/deprecations). Tornar os modelos configuráveis evita editar a rota a cada mudança do fornecedor.

## O que pode funcionar sem tokens

| Trabalho | Implementação proposta | Uso de modelo |
| --- | --- | --- |
| Criar contato, oportunidade ou tarefa | Evento e regra no banco/aplicação | Nenhum |
| Mover etapa após confirmação de uma ação | Máquina de estados e eventos | Nenhum |
| Escolher horários disponíveis | Consulta à agenda e regras de disponibilidade | Nenhum |
| Confirmar, lembrar e cobrar resposta | Templates com nome, data, serviço e link | Nenhum |
| Identificar atrasos ou ausência de retorno | Consulta por prazo e situação | Nenhum |
| Avaliar condições numéricas e alternativas do formulário | Motor determinístico, após conferir o mapeamento dos campos | Nenhum |
| Montar documento padronizado | Blocos revisados selecionados por regras | Nenhum |
| Calcular indicadores da operação | Consultas e cálculos | Nenhum |
| Interpretar resposta livre ambígua ou resumir texto | IA com contexto selecionado | Quando necessário |
| Adaptar redação, tom e personalização de uma entrega | IA sobre resultado estruturado | Opcional |

Sem tokens significa sem gasto de inferência nessa ação. Banco, hospedagem, filas e canais de envio continuam podendo ter custos. WhatsApp automatizado também depende da solução de envio escolhida; não há promessa de operação gratuita.

## Plano técnico para economizar com segurança

### 1. Medir e evitar trabalho repetido

Registrar modelo, versão do prompt, tokens de entrada/saída, duração e resultado da operação, sem registrar respostas pessoais nos logs. O SDK instalado expõe `usageMetadata`; a API/SDK atual deve ser conferida antes de uma migração. A [documentação de tokens](https://ai.google.dev/gemini-api/docs/tokens) explica contagem e métricas de uso.

Evitar chamadas duplicadas por clique duplo ou retentativa. Identificar o conjunto de respostas, regras e template por versão/hash e reaproveitar um resultado válido quando nada mudou. Manter o rascunho gerado separado do documento editado pelo profissional para não sobrescrever revisão humana.

### 2. Tirar decisões objetivas do prompt

Persistir o ID estável de cada campo junto da resposta. Hoje o webhook armazena principalmente o rótulo da pergunta, enquanto a extração sugere campos em `snake_case`. Não é seguro executar regras determinísticas assumindo que esses nomes correspondem.

Depois de validar o mapeamento: avaliar condições em código; definir o que acontece se várias regras combinarem, se nenhuma combinar ou se faltar informação. Campos ausentes e regras conflitantes devem pedir revisão. Cobrir números com vírgula, unidades, comparações e operadores em testes.

O formulário continua o mesmo para o cliente; a mudança é em como o sistema interpreta seus campos internamente.

### 3. Três formas de produzir a entrega

- **Modelo pronto:** blocos aprovados + respostas + regras. Sem chamada ao Gemini.
- **Assistida:** código seleciona os resultados; Gemini ajusta a redação dentro desses limites.
- **Personalizada:** Gemini interpreta texto livre e prepara um rascunho para revisão.

Essa escolha pode ser feita por formulário, preservando o fluxo atual enquanto os modelos prontos são adicionados. Um resultado determinístico também precisa estar correto: a ausência de IA não valida as regras profissionais.

### 4. Reduzir o contexto de cada chamada

Enviar apenas o necessário para a tarefa, mantendo os dados que afetam a resposta. Usar limites de saída por tipo de operação e uma estrutura curta para resumos. Não truncar silenciosamente respostas ou documentos. Revisar o comportamento de raciocínio apenas em modelos que exponham essa configuração e com testes de qualidade.

Caching do fornecedor pode ajudar quando há contextos repetidos grandes, mas depende do modelo, tamanho e acertos de cache. Não substitui eliminar chamadas desnecessárias. Referência: [caching do Gemini](https://ai.google.dev/gemini-api/docs/caching).

### 5. Escolher modelo pelo resultado medido

Comparar qualidade e custo em exemplos representativos antes de trocar o Gemini. Um modelo menor pode bastar para extrair dados ou reescrever uma mensagem; uma tentativa ruim seguida de regenerações pode custar mais. Modelos locais também exigem máquina, operação e manutenção.

## Prioridade recomendada

Resolver o acesso primeiro. Depois medir o consumo atual, implementar mensagens por template e mapear campos para um motor de regras. O maior ganho potencial está em tornar IA opcional nas rotinas previsíveis. Funil e agenda podem ser construídos em grande parte sem inferência.

Nesta rodada, as alterações funcionais se concentram na recuperação de acesso. As otimizações acima são propostas; ainda não foram implementadas nem tiveram economia medida.

# Visão do Aliaddo: um assistente para a operação do negócio

Direção registrada em 13/10/2026, após esclarecimento do fundador. Este documento define o produto desejado. Em 14/10, a implementação passou a cobrir Hoje, cadastro, vínculo de respostas, retornos e funil com conversão explícita de formulários. Agenda, equipe e automações de mensagens continuam propostas.

## Papel do produto

O Aliaddo ajuda o profissional a conquistar clientes, organizar atendimentos e manter o relacionamento. Deve assumir trabalho repetitivo e apresentar o que precisa da atenção do dono do negócio. O formulário e a geração de documentos continuam integrados a essa experiência.

O ponto inicial são consultores e profissionais de consultório, com uma base comum para prestadores de serviços. Outros públicos podem usar essa base. Os primeiros modelos de uso, linguagem e prioridades devem continuar concretos, para que cada tela resolva uma rotina reconhecível.

## Jornada completa

```text
Entrada do interessado
  Formulário | cadastro manual | WhatsApp integrado | indicação/importação
       ↓
Contato e oportunidade no funil
  Interesse, origem, serviço, responsável e próxima ação
       ↓
Conversa e agendamento
  Disponibilidade, reserva, confirmação e lembrete
       ↓
Atendimento
  Contexto, formulários, rascunho com IA e revisão profissional
       ↓
Entrega e acompanhamento
  Documento, comunicação, retorno, renovação e indicação
```

O fluxo admite entrada em qualquer ponto: um cliente antigo pode ser cadastrado diretamente, uma indicação pode iniciar uma oportunidade, e uma pessoa pode agendar antes de preencher um formulário.

## Capacidades conectadas

| Área | Trabalho que o Aliaddo deve ajudar a realizar |
| --- | --- |
| Hoje | Mostrar agenda, contatos sem resposta, próximos passos e entregas pendentes |
| Funil | Acompanhar interessados e oportunidades até contratação ou perda |
| Clientes | Reunir contexto, histórico, serviços e relacionamentos recorrentes |
| Agenda | Organizar disponibilidade, reservas, confirmações e remarcações |
| Formulários e documentos | Coletar informações, preparar rascunhos e revisar entregas |
| Conversas | Reunir mensagens recebidas, rascunhos, envios e responsáveis |
| Automações | Executar rotinas configuradas e mostrar o que aconteceu |
| Gestão do negócio | Mostrar carga de atendimentos, conversão e serviços vendidos; financeiro simples em etapa posterior |

O assistente aparece junto do trabalho: na oportunidade, na ficha, no compromisso e na tela Hoje. Uma caixa de conversa pode facilitar comandos, mas cada ação deve alterar registros concretos e verificáveis.

## Funil: acompanhar uma venda, mantendo a identidade do cliente

Exemplo de etapas iniciais: **Novo interessado → Em conversa → Agendamento/proposta → Fechado**, com saída **Perdido**. As etapas podem ganhar modelos por profissão após validar o fluxo padrão.

Cada oportunidade tem contato, serviço de interesse, origem, etapa, responsável, próxima ação e motivo de perda quando aplicável. Valor estimado é opcional. O formulário pode fornecer interesse e contexto; o cliente também pode ser cadastrado manualmente.

Uma pessoa pode contratar novamente ou negociar dois serviços. Portanto, etapa comercial pertence à oportunidade, não ao cadastro. Data agendada pertence ao compromisso; estado do documento pertence à entrega. Misturar tudo em um único status tornaria impossível representar essas situações.

O funil organiza captação e conversão. Para atrair novos interessados, são necessárias entradas externas: links de formulário em campanhas, páginas, indicações e conversas. Registrar a origem permite descobrir quais dessas entradas geram contratações.

## Exemplo de operação desejada

Uma pessoa responde um formulário de interesse. O Aliaddo registra a entrada, destaca o serviço procurado e sugere a próxima ação. O profissional confirma a associação ao cadastro correto. Uma rotina configurada pode preparar uma mensagem de acolhimento e oferecer horários disponíveis.

Depois da escolha, o sistema reserva o horário, registra o compromisso e programa um lembrete. Antes do encontro, apresenta o histórico e as informações que faltam. Após a revisão profissional, envia a entrega e cria o retorno combinado. Uma contratação futura gera outra oportunidade no mesmo cadastro.

Essa é a experiência-alvo. A versão atual ainda não executa essa sequência automaticamente.

## Automações iniciais

| Gatilho | Ação proposta | Condição de execução |
| --- | --- | --- |
| Formulário recebido | Criar entrada no funil e preparar acolhimento | Origem registrada e identidade conferida antes de unir histórico |
| Agendamento confirmado | Preparar confirmação e lembrete | Reserva válida, destinatário confirmado e rotina habilitada |
| Documento aprovado | Preparar envio pelo WhatsApp | Versão aprovada e link externo funcionando |
| Oportunidade sem resposta | Sugerir ou programar acompanhamento | Limite de tentativas e cancelamento por resposta, contratação ou interrupção |
| Atendimento concluído | Criar retorno | Prazo e próximo passo configurados ou confirmados pelo profissional |

Cada automação deve mostrar gatilho, destinatário, ação, prazo e resultado. Reprocessar o mesmo evento não pode duplicar envios ou reservas. Falhas precisam ficar visíveis e permitir retentativa controlada.

## Autonomia do assistente

Começar com resumos, sugestões e rascunhos. Depois habilitar execução para rotinas específicas escolhidas pelo profissional. Não pedir confirmação a cada repetição de uma rotina já autorizada; pedir quando a ação sair das condições configuradas.

Disponibilidade vem da agenda. Valores vêm dos serviços cadastrados. Situação de envio vem do provedor. A IA usa essas informações para ajudar, sem inventar confirmações, preços ou horários. Conteúdo profissional continua com uma etapa de revisão.

Exemplos de comandos futuros: “Quem está esperando minha resposta?”, “Prepare meu próximo atendimento” e “Mostre os interessados que ficaram sem próximo passo”. Alterações e envios devem registrar autoria, execução e resultado.

## Equipe e empresa

A implementação atual organiza dados por conta individual. Para funcionários humanos trabalharem juntos, será preciso introduzir organização, membros, papéis e atribuição de responsáveis. Esse trabalho precede o compartilhamento real de carteiras e agendas; acrescentar apenas um campo de responsável não resolve permissões de equipe.

O assistente virtual pode operar inicialmente para um profissional individual. A estrutura comercial deve permitir evolução para equipe sem expor dados entre empresas.

## Próximo incremento recomendado

Com o funil inicial e a tela Hoje implementados, o próximo incremento é conectar agenda e os primeiros envios reais por WhatsApp. A tela Hoje passa a reunir essas rotinas à medida que elas existirem.

Validar uma jornada completa, da entrada do interessado ao retorno, antes de ampliar o número de módulos. O diferencial pretendido é reduzir trabalho esquecido e repetitivo ao longo dessa jornada.

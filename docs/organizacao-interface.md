# Organização da interface — 15/10/2026

A navegação distingue atendimento (Formulários, Respostas e entregas) de gestão (Clientes, Oportunidades, Tarefas). Configurações ficam recolhidas. A paleta usa branco, preto e azul-esverdeado, com contraste maior e indicadores de foco.

## Caminhos principais

- Visão geral separa tarefas, respostas recebidas e oportunidades. O atalho de tarefa abre a lista filtrada pelo cliente e destaca a tarefa correspondente.
- Retornos passam a se chamar Tarefas. A criação tem uma página própria, com cliente, ação e prazo. Não representa agendamento nem envio automático.
- A ficha abre no Resumo e divide tarefas, respostas e edição do cadastro em abas. Consultas específicas só são executadas na aba correspondente.
- Associar uma resposta é opcional, fica recolhido e tem explicação explícita: reúne um preenchimento já recebido no histórico do cliente. Não envia formulário nem cria oportunidade.
- Como usar o Aliaddo apresenta exemplos e explica as diferenças entre as áreas.
- A demonstração acompanha os novos nomes e permite criar e concluir tarefas fictícias, sem persistência remota.

## Preservação e verificação

Não há migração de banco nesta alteração. Geração com IA, perguntas, respostas, revisão, documentos e integração com WhatsApp conservam sua implementação; foram ajustados os textos de entrada e navegação.

Checagem TypeScript, lint direcionado aos componentes de gestão e 29 testes existentes passaram. A compilação de produção foi verificada. A validação de navegador usa a demonstração, sem afirmar teste autenticado completo nem efetuar envios a clientes.

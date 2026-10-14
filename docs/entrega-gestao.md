# Primeira etapa de gestão — 14/10/2026

O formulário continua integrado ao atendimento. O Aliaddo agora também organiza clientes, oportunidades e próximos passos, com linguagem comum a consultores, consultórios e outros prestadores de serviços.

## Implementado

- **Hoje:** indicadores da conta, prioridades por prazo, entradas de formulário sem vínculo e visão do funil.
- **Clientes:** cadastro independente de formulário, notas internas, relacionamento, respostas vinculadas e oportunidades.
- **Funil:** novos, em conversa, proposta, conquistados e encerrados; origem, serviço, valor estimado, próxima ação e motivo de encerramento.
- **Entrada pelo formulário:** associação explícita a um cliente ou novo cadastro, criação transacional da oportunidade e proteção contra duplicação ao repetir a ação.
- **Retornos:** data, conclusão, reabertura e filtros de pendências.
- **Interface:** navegação organizada, identidade verde preservada, cartões claros, menu móvel e estados vazios/erros.
- **Demonstração em `/demo`:** dados fictícios, criação de cliente e oportunidade, edição e avanço de etapas, conclusão/reabertura de retornos. Reinicia ao recarregar e não usa o banco.

As funções de gestão e priorização são determinísticas e não chamam Gemini. A geração de documentos existente continua usando IA. Não há redução medida de tokens nessa geração nesta entrega.

## Banco e proteção de dados

Aplicadas ao projeto Supabase Aliaddo:

1. `20261014120928_client_management.sql`
2. `20261014120942_sales_pipeline.sql`
3. `20261014175010_crm_explicit_permissions.sql`

As tabelas novas têm RLS por proprietário, chaves compostas para impedir associação entre contas e privilégios explícitos. Verificação remota confirmou ausência de leitura/TRUNCATE anônimos e ausência de TRUNCATE para authenticated. A conversão usa a sessão autenticada e bloqueia a resposta durante a transação. A edição de oportunidades exige a versão atual para não sobrescrever alterações concorrentes.

Respostas antigas não foram unidas automaticamente. E-mails iguais não representam identidade confirmada. As alterações não adicionam dados demonstrativos ao banco real.

## Verificação e limites

Os testes cobrem validações, autenticação/redirecionamento, isolamento entre contas, conversão repetida, conflitos de versão e preservação da oportunidade quando a resposta de origem é excluída. O PGlite executa as migrações SQL reais sobre um schema mínimo legado.

O lint direcionado às novas telas, a checagem TypeScript e a compilação de produção fazem parte da verificação. O lint completo ainda contém problemas legados documentados em `evolucao-produto.md`.

Resultado local: 29 testes passaram e a compilação de produção concluiu com checagem de tipos. No navegador, foram conferidos criação e avanço de oportunidades, edição com motivo de encerramento e conclusão de retorno refletida na tela Hoje. O menu móvel foi testado a 390 px, sem transbordamento horizontal, e não houve erros no console da demonstração durante essa sessão.

A demonstração permite conferir a interface sem recuperar senha. Ela não comprova o fluxo com uma sessão de produção; esse ensaio permanece separado e deve ser feito com uma conta de teste, sem dados pessoais reais.

## Próxima etapa

Agenda com reserva e prevenção de conflitos; integração real de WhatsApp com confirmação de envio; equipes e permissões por organização. Hoje o WhatsApp existente abre a mensagem para envio manual. Retornos não enviam notificações e valores do funil são estimativas comerciais, não recebimentos.

O diagnóstico remoto também encontrou pendências legadas de função com `search_path` mutável e exposição GraphQL de tabelas antigas. Não foram ampliadas nesta entrega. Referências: [search_path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) e [exposição anônima no GraphQL](https://supabase.com/docs/guides/database/database-linter?lint=0026_pg_graphql_anon_table_exposed).

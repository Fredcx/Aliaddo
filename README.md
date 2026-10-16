# Aliaddo

Gestão de clientes, oportunidades e atendimentos para prestadores de serviços, consultores e profissionais de consultório. Formulários e IA continuam preparando documentos revisados pelo profissional.

Experimente `/demo` sem login: dados fictícios, alterações em memória e nenhum envio ou consumo de IA. A área autenticada abre em **Visão geral** e usa os dados da conta. Veja o escopo em [docs/entrega-gestao.md](docs/entrega-gestao.md) e a reorganização em [docs/organizacao-interface.md](docs/organizacao-interface.md).

## Fluxo

1. Cadastre a pessoa em **Clientes**, mesmo antes de receber um formulário.
2. Configure e compartilhe os **Formulários**.
3. As respostas chegam a **Respostas e entregas**. A IA gera um rascunho usando as regras do formulário.
4. Revise e prepare a entrega. O WhatsApp atual abre uma mensagem preenchida; o envio é manual.
5. Na ficha do cliente, vincule respostas, registre contexto e adicione próximos passos.
6. Em **Tarefas**, acompanhe pendências, atrasos e conclusões. Use **Nova tarefa** para escolher cliente, ação e prazo.
7. Leve uma resposta ao **Funil**, confirmando a identidade do cliente, ou crie uma oportunidade manualmente. Registre origem, interesse, valor estimado, etapa e próxima ação.
8. Em **Visão geral**, acompanhe prioridades, respostas sem vínculo, documentos aguardando revisão e oportunidades. **Como usar o Aliaddo** explica cada área.

Veja o diagnóstico e a proposta de evolução em [docs/evolucao-produto.md](docs/evolucao-produto.md).

Pesquisa de concorrentes e plano para reduzir o consumo de IA: [docs/mercado-e-uso-de-ia.md](docs/mercado-e-uso-de-ia.md).

Recuperação de senha, URLs de autenticação e configuração na Vercel/Supabase: [docs/recuperacao-acesso.md](docs/recuperacao-acesso.md).

## Desenvolvimento

Recomendado: Node.js 22.20 ou superior na linha 22. Os testes usam suporte nativo a TypeScript.

```sh
npm ci
```

Copie `.env.example` para `.env.local`. Preencha as variáveis com um Supabase de desenvolvimento e uma chave Gemini. Nunca coloque a chave `service_role` em variáveis `NEXT_PUBLIC_*`.

```sh
npm run dev
npm run typecheck
npm test
npm run lint
npm run build
```

O lint completo ainda aponta problemas preexistentes nas telas e rotas antigas. As regras não foram desativadas para escondê-los. O build agora verifica TypeScript, mas conserva a configuração anterior que não executa ESLint durante o build.

## Banco e ativação

O projeto original usa scripts SQL manuais, sem um histórico completo de migrações. Os scripts-base são `supabase_setup.sql`, `add_multiple_forms.sql`, `add_logo.sql` e `update_status_constraint.sql`. Há diferenças entre o schema versionado e o usado no código: os webhooks gravam `clients.phone`, por exemplo, mas a coluna não aparece no setup. Confira o schema antes de reproduzir um ambiente do zero.

Para habilitar a gestão em um banco existente:

1. Faça backup e use primeiro um ambiente de homologação.
2. Aplique em ordem as três migrações de `supabase/migrations`: `20261014120928_client_management.sql`, `20261014120942_sales_pipeline.sql` e `20261014175010_crm_explicit_permissions.sql`. Elas já foram aplicadas ao projeto Supabase Aliaddo em 14/10/2026.
3. Publique a aplicação que usa as novas tabelas.
4. Entre em duas contas e confira cadastro, vínculo de respostas e retornos.

As migrações são transacionais: criam `contacts`, `client_tasks`, `opportunities`, `clients.contact_id` e uma função de conversão de resposta em oportunidade, sem unir ou modificar respostas antigas. A última restringe explicitamente os privilégios das novas tabelas. Cadastre o cliente e escolha as respostas a vincular. E-mails compartilhados são permitidos.

As novas tabelas usam RLS por proprietário e chaves compostas impedem vínculos entre contas. A aplicação usa a sessão do profissional, sem `service_role`, na nova gestão.

Para reverter somente a aplicação, mantenha as tabelas novas: o código anterior as ignora. Não elimine cadastros e tarefas já preenchidos; exporte os dados antes de um rollback destrutivo.

## Estrutura

| Área | Local |
| --- | --- |
| Carteira e ficha | `src/app/(dashboard)/clients` |
| Retornos | `src/app/(dashboard)/follow-ups` |
| Funil e conversão de respostas | `src/app/(dashboard)/pipeline` |
| Visão diária | `src/app/(dashboard)/home` |
| Demonstração pública | `src/app/demo` |
| Tipos, validação e datas | `src/lib/crm.ts` |
| Componentes de gestão | `src/components/crm` |
| Respostas e documentos | `src/app/(dashboard)/dashboard` |
| Regras e geração Gemini | `src/app/api/logic`, `src/app/api/generate` |
| Testes | `tests` |

## Testes e limites

`npm test` usa PostgreSQL local em memória (PGlite) e aplica as migrações reais sobre uma base mínima com as políticas legadas. Verifica isolamento entre contas, vínculos, preservação de respostas, conclusão/reabertura de tarefas, conversão idempotente, conflitos de versão e permissões explícitas. Não conecta ao banco remoto.

As listas são paginadas em 30 registros. A ficha mostra os cinco próximos retornos pendentes e um link para a lista completa. Datas usam dias de calendário no fuso `America/Sao_Paulo`, sem horários de consulta ou notificações automáticas.

Arquivar um cadastro não conclui tarefas nem apaga atendimentos. Notas internas não entram nos prompts. Alterações cadastrais não sobrescrevem os dados originais das respostas.

Antes de um lançamento público, trate as pendências legadas documentadas no diagnóstico, especialmente compartilhamento de documentos, webhooks, políticas de acesso e consolidação do schema. A aplicação da migração e a validação com credenciais reais são etapas distintas dos testes locais.

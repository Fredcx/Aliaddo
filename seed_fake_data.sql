-- Populating fake data for the current user

-- We expect the USER email to be "marcelo" or whatever profile is signed in.
-- But we can just use the auth.uid() if running from the app, or we can insert broadly.
-- Assuming we want to populate for all profiles just in case.

do $$
declare
  prof record;
  c1_id uuid;
  c2_id uuid;
  c3_id uuid;
  c4_id uuid;
begin
  for prof in select id from public.profiles loop
    
    -- Client 1: Aguardando (New)
    insert into public.clients (profile_id, name, email, status)
    values (prof.id, 'Alice Costa', 'alice@startup.com', 'Aguardando')
    returning id into c1_id;

    insert into public.responses (client_id, question, answer) values 
    (c1_id, 'Nome da Empresa', 'TechFlow'),
    (c1_id, 'Qual seu maior desafio hoje?', 'Nossa retenção de clientes está caindo e não sabemos bem o motivo. Acredito que seja onboarding.'),
    (c1_id, 'Qual seu objetivo principal?', 'Aumentar a retenção em 20% no próximo trimestre e criar um processo de adoção claro.');

    -- Client 2: Aguardando (New)
    insert into public.clients (profile_id, name, email, status)
    values (prof.id, 'Bruno Vieira', 'bruno@ecommerce.com.br', 'Aguardando')
    returning id into c2_id;

    insert into public.responses (client_id, question, answer) values 
    (c2_id, 'Nome da Empresa', 'Loja do Bruno'),
    (c2_id, 'Qual seu maior desafio hoje?', 'Custos de ads estão altos e o ROI diminuiu muito.'),
    (c2_id, 'Qual seu objetivo principal?', 'Otimizar as campanhas e melhorar a conversão do site.');


    -- Client 3: Pronto (Review Pending)
    insert into public.clients (profile_id, name, email, status)
    values (prof.id, 'Carla Mendes', 'carla@advocacia.com', 'Pronto')
    returning id into c3_id;

    insert into public.responses (client_id, question, answer) values 
    (c3_id, 'Nome da Empresa', 'Mendes Advogados'),
    (c3_id, 'Qual seu maior desafio hoje?', 'Preciso de captação passiva de clientes. Só vivemos de indicação.'),
    (c3_id, 'Qual seu objetivo principal?', 'Ter um funil rodando organicamente no Instagram e Blog.');

    insert into public.documents (client_id, content) values
    (c3_id, '# Diagnóstico Estratégico - Mendes Advogados

Olá Carla, com base no seu diagnóstico, elaborei este plano estratégico exclusivo.

## 1. Resumo do Cenário
Identificamos que a dependência exclusiva de indicações limita o crescimento previsível do escritório. A ausência de canais passivos de aquisição cria instabilidade no fluxo de novos contratos.

## 2. Estratégia Principal
Desenvolver uma **Máquina de Aquisição Híbrida** combinando SEO para intenção de busca (Google) e Autoridade Institucional (Instagram).

## 3. Próximos Passos
- [ ] Criar linha editorial com 3 posts semanais focados em dúvidas comuns do seu público alvo.
- [ ] Otimizar perfil do Google Meu Negócio.
- [ ] Produzir 2 artigos mensais focados em SEO de cauda longa (ex: "como funciona divórcio extrajudicial").

Aviso legal: Este material tem fins informativos e não substitui uma avaliação profissional direta.
');


    -- Client 4: Enviado
    insert into public.clients (profile_id, name, email, status)
    values (prof.id, 'Daniel Santos', 'daniel@fitness.com', 'Enviado')
    returning id into c4_id;

    insert into public.responses (client_id, question, answer) values 
    (c4_id, 'Nome da Empresa', 'CT Santos'),
    (c4_id, 'Qual seu maior desafio hoje?', 'O espaço físico não comporta mais alunos no horário de pico.'),
    (c4_id, 'Qual seu objetivo principal?', 'Implementar um modelo híbrido com consultoria online para escalar sem precisar de mais espaço físico.');

    insert into public.documents (client_id, content) values
    (c4_id, '# Expansão Digital - CT Santos

Olá Daniel, este é o seu planejamento personalizado para expansão de receita.

## Análise de Gargalo
Você atingiu o teto físico do negócio. O próximo passo lógico de alavancagem sem aumento de CapEx é a produtização do seu conhecimento.

## Solução Proposta
Lançamento de um "Desafio 21 Dias" 100% online para aproveitar sua base atual de leads frios e gerar fluxo de caixa para reinvestimento.

Obrigado por confiar em nosso trabalho.');

  end loop;
end;
$$;

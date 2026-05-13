const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function seed() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase credentials in environment");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const sql = fs.readFileSync('seed_fake_data.sql', 'utf8');

    // Supabase.js doesn't have a direct 'execute sql' method unless it's an RPC.
    // However we can just create a temporary function or just run a direct query if possible,
    // but the REST API and supabase-js do not support running raw SQL directly for security reasons unless exposed via RPC.

    // Instead of raw SQL, let's insert the data directly via the JS client
    console.log("Fetching profiles...");
    const { data: profiles, error: profErr } = await supabase.from('profiles').select('id');
    if (profErr) { console.error(profErr); return; }

    for (const prof of profiles) {
        console.log("Seeding for profile:", prof.id);

        // Client 1
        const { data: c1 } = await supabase.from('clients').insert({
            profile_id: prof.id, name: 'Alice Costa', email: 'alice.costa@gmail.com', status: 'Aguardando'
        }).select().single();

        await supabase.from('responses').insert([
            { client_id: c1.id, question: 'Qual sua principal fonte de renda?', answer: 'Trabalho CLT (R$ 7.500/mês).' },
            { client_id: c1.id, question: 'Qual seu maior desafio hoje?', answer: 'Tenho dívidas no cartão de crédito e não consigo poupar nada no fim do mês.' },
            { client_id: c1.id, question: 'Qual seu objetivo principal?', answer: 'Quitar as dívidas e começar minha reserva de emergência.' }
        ]);

        // Client 2
        const { data: c2 } = await supabase.from('clients').insert({
            profile_id: prof.id, name: 'Bruno Vieira', email: 'bruno.v@hotmail.com', status: 'Aguardando'
        }).select().single();

        await supabase.from('responses').insert([
            { client_id: c2.id, question: 'Qual sua principal fonte de renda?', answer: 'Profissional liberal (R$ 15.000/mês).' },
            { client_id: c2.id, question: 'Qual seu maior desafio hoje?', answer: 'Minha renda varia muito meses bons e ruins, fico perdido na organização diária.' },
            { client_id: c2.id, question: 'Qual seu objetivo principal?', answer: 'Ter previsibilidade e começar a investir para independência financeira.' }
        ]);

        // Client 3
        const { data: c3 } = await supabase.from('clients').insert({
            profile_id: prof.id, name: 'Lucas Pereira', email: 'lucas.pr@gmail.com', status: 'Pronto'
        }).select().single();

        await supabase.from('responses').insert([
            { client_id: c3.id, question: 'Qual sua principal fonte de renda?', answer: 'Servidor Público (R$ 12.000/mês).' },
            { client_id: c3.id, question: 'Qual seu maior desafio hoje?', answer: 'Já guardo dinheiro na poupança, mas não sei como investir melhor.' },
            { client_id: c3.id, question: 'Qual seu objetivo principal?', answer: 'Aprender a investir em renda fixa e variável para multiplicar meu patrimônio.' }
        ]);

        await supabase.from('documents').insert({
            client_id: c3.id,
            content: '# Planejamento Financeiro Personalizado\n\nOlá Lucas, com base no seu diagnóstico, elaborei este plano de ação focado na sua independência financeira.\n\n## 1. Resumo do Cenário\nVocê tem uma excelente previsibilidade de renda como servidor e já possui o hábito de poupar. O gargalo atual é a alocação de recursos em produtos de baixa rentabilidade (poupança).\n\n## 2. Estratégia Principal\nMudar o foco de "poupar" para "rentabilizar". Construiremos uma carteira diversificada priorizando segurança estrutural (Tesouro Direto, CDBs) e crescimento de longo prazo (ETFs, FIIs).\n\n## 3. Próximos Passos\n- [ ] Abrir conta em uma corretora isenta de taxas.\n- [ ] Transferir 100% do saldo da poupança para o Tesouro Selic (Reserva de Oportunidade).\n- [ ] Definir o perfil de risco no app da corretora.\n\nAviso legal: Este material tem fins informativos e educacionais e não constitui recomendação direta de valores mobiliários.'
        });

        // Client 4
        const { data: c4 } = await supabase.from('clients').insert({
            profile_id: prof.id, name: 'Fernanda Lima', email: 'fer.lima@gmail.com', status: 'Enviado'
        }).select().single();

        await supabase.from('responses').insert([
            { client_id: c4.id, question: 'Qual sua principal fonte de renda?', answer: 'Empresária (Pró-labore R$ 20.000/mês).' },
            { client_id: c4.id, question: 'Qual seu maior desafio hoje?', answer: 'Misturo muito o dinheiro da pessoa física com a pessoa jurídica.' },
            { client_id: c4.id, question: 'Qual seu objetivo principal?', answer: 'Separar minhas contas, definir um pró-labore fixo e montar um portfólio diversificado.' }
        ]);

        await supabase.from('documents').insert({
            client_id: c4.id,
            content: '# Reestruturação Financeira Pessoal\n\nOlá Fernanda, analisando sua situação de confusão patrimonial entre PF e PJ, estruturamos os seguintes passos fundamentais.\n\n## Análise de Gargalo\nA mistura de contas pessoa jurídica e física te impede de ter clareza sobre o verdadeiro lucro da empresa e sabota sua capacidade de acumular patrimônio pessoal de forma segura e blindada.\n\n## Solução Proposta\nTravamento de teto de gastos mensais e definição de Política de Distribuição de Lucros Semestral. Vamos focar na blindagem do seu patrimônio físico.\n\nQualquer dúvida, estou à disposição.'
        });
    }

    console.log("Done seeding!");
}

seed();

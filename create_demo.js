const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ulivjelzbjglxqvsncwg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsaXZqZWx6YmpnbHhxdnNuY3dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAzMjA0MiwiZXhwIjoyMDkxNjA4MDQyfQ.gmn2lkaHRCBpPQ6jd56RL9g1P4TDdHfoSbxxW69QWtU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
  console.log('Creating demo user...');
  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email: 'demo@aliaddo.com',
    password: 'senha_demo',
    email_confirm: true,
    user_metadata: {
      full_name: 'Consultor Demo',
      niche: 'Consultoria Financeira'
    }
  });

  if (authError && authError.message !== 'User already registered') {
    console.error('Auth error:', authError);
    return;
  }

  const { data: usersData } = await supabase.auth.admin.listUsers();
  const userId = usersData.users.find(u => u.email === 'demo@aliaddo.com')?.id;
  console.log('User ID:', userId);

  await supabase.from('clients').delete().eq('profile_id', userId);

  const clients = [
    { profile_id: userId, name: 'Alice Costa', email: 'alice.costa@gmail.com', status: 'Aguardando' },
    { profile_id: userId, name: 'Bruno Vieira', email: 'bruno.v@hotmail.com', status: 'Aguardando' },
    { profile_id: userId, name: 'Lucas Pereira', email: 'lucas.pr@gmail.com', status: 'Pronto' },
    { profile_id: userId, name: 'Fernanda Lima', email: 'fer.lima@gmail.com', status: 'Enviado' },
    { profile_id: userId, name: 'Carlos Mendes', email: 'carlos.m@empresa.com', status: 'Processando' }
  ];

  const { data: insertedClients, error: clientsError } = await supabase.from('clients').insert(clients).select();
  if (clientsError) { console.error('Clients error:', clientsError); return; }

  // Insert some responses for Alice
  const alice = insertedClients.find(c => c.name === 'Alice Costa');
  await supabase.from('responses').insert([
      { client_id: alice.id, question: 'Qual sua principal fonte de renda?', answer: 'Trabalho CLT (R$ 7.500/mês).' },
      { client_id: alice.id, question: 'Qual seu maior desafio hoje?', answer: 'Tenho dívidas no cartão de crédito e não consigo poupar nada no fim do mês.' },
      { client_id: alice.id, question: 'Qual seu objetivo principal?', answer: 'Quitar as dívidas e começar minha reserva de emergência.' }
  ]);

  // Insert document for Lucas
  const lucas = insertedClients.find(c => c.name === 'Lucas Pereira');
  await supabase.from('documents').insert({
      client_id: lucas.id,
      content: '# Planejamento Financeiro Personalizado\n\nOlá Lucas, com base no seu diagnóstico, elaborei este plano de ação focado na sua independência financeira.\n\n## 1. Resumo do Cenário\nVocê tem uma excelente previsibilidade de renda como servidor e já possui o hábito de poupar.\n\n## 2. Estratégia Principal\nMudar o foco de "poupar" para "rentabilizar". Construiremos uma carteira diversificada.'
  });

  console.log('Demo data seeded successfully!');
}

run().catch(console.error);

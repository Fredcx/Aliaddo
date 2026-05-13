require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Creating user...");
  const { data: user, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@logimax.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Usuário Mock',
      niche: 'SaaS Consultant'
    }
  });

  if (authError && authError.message !== 'User already registered') {
    console.error("Auth error:", authError);
    return;
  }

  const { data: usersData } = await supabase.auth.admin.listUsers();
  const userId = usersData.users.find(u => u.email === 'admin@logimax.com')?.id;
  console.log("User ID:", userId);

  await new Promise(r => setTimeout(r, 2000));

  console.log("Creating clients...");
  const clients = [
    { profile_id: userId, name: "Empresa Inovadora SA", email: "contato@empresa.com", status: "Aguardando" },
    { profile_id: userId, name: "Soluções Cloud Beta", email: "admin@cloudbeta.com", status: "Aguardando" },
    { profile_id: userId, name: "Agência Digital Alfa", email: "ceo@agenciaalfa.com", status: "Processando" },
    { profile_id: userId, name: "Consultoria Global XYZ", email: "ola@globalXYZ.com", status: "Pronto" },
    { profile_id: userId, name: "Logística Nacional ME", email: "logistica@nacionalme.com", status: "Enviado" },
  ];

  await supabase.from('clients').delete().eq('profile_id', userId);
  
  const { error: clientsError } = await supabase.from('clients').insert(clients);
  if (clientsError) {
    console.error("Clients error:", clientsError);
    return;
  }
  
  console.log("Seed successful!");
}

main().catch(console.error);

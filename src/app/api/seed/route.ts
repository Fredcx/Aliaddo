import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const email = 'admin@logimax.com';
        const password = 'password123';
        
        console.log("Creating mock user...");
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: 'Administrador Logimax',
                niche: 'SaaS Consultant'
            }
        });

        if (userError && userError.message !== 'User already registered') {
            console.error("Error creating user:", userError);
            return NextResponse.json({ error: userError.message }, { status: 400 });
        }
        
        let userId = userData?.user?.id;
        if (!userId) {
            const { data: usersData } = await supabase.auth.admin.listUsers();
            userId = usersData.users.find(u => u.email === email)?.id;
        }

        if (!userId) {
            return NextResponse.json({ error: "Could not find user ID." }, { status: 400 });
        }

        // Wait a bit for trigger
        await new Promise(r => setTimeout(r, 2000));

        console.log("Creating mock clients...");
        const clients = [
            { profile_id: userId, name: "Tech Solutions BR", email: "contato@techsol.com.br", status: "Aguardando" },
            { profile_id: userId, name: "Consultoria Global XYZ", email: "ceo@globalxyz.com", status: "Aguardando" },
            { profile_id: userId, name: "Agência Digital Alfa", email: "admin@alfa-agency.com", status: "Processando" },
            { profile_id: userId, name: "Inovação SaaS SA", email: "ola@inovacaosaas.com", status: "Pronto" },
            { profile_id: userId, name: "Logística Alpha ME", email: "logistica@alphame.com", status: "Enviado" },
        ];

        // Ensure we don't duplicate clients for this user
        await supabase.from('clients').delete().eq('profile_id', userId);

        const { error: clientsError } = await supabase.from('clients').insert(clients);
        
        if (clientsError) {
            console.error("Error inserting clients:", clientsError);
            return NextResponse.json({ error: clientsError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, email, password });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

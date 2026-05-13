import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();

        let { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('profile_id', user.id)
            .single();

        if (settingsError && settingsError.code === 'PGRST116') {
            // Not found, create default settings
            const { data: newSettings, error: createError } = await supabase
                .from('settings')
                .insert({ profile_id: user.id })
                .select()
                .single();
            if (createError) throw createError;
            settings = newSettings;
        } else if (settingsError) {
            throw settingsError;
        }

        return NextResponse.json({ settings, username: profile?.username });
    } catch (error: any) {
        console.error('Settings GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Remove id and profile_id from body to prevent tampering
        delete body.id;
        delete body.profile_id;
        body.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('settings')
            .update(body)
            .eq('profile_id', user.id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Record may not exist, insert it
                const { data: newData, error: insertError } = await supabase
                    .from('settings')
                    .insert({ profile_id: user.id, ...body })
                    .select()
                    .single();
                if (insertError) throw insertError;
                return NextResponse.json({ data: newData });
            }
            throw error;
        }

        return NextResponse.json({ data });
    } catch (error: any) {
        console.error('Settings POST Error:', error);
        try {
            const fs = require('fs');
            const path = require('path');
            fs.writeFileSync(
                path.join(process.cwd(), 'error_log.txt'),
                `Error: ${error.message}\nStack: ${error.stack}\nJSON: ${JSON.stringify(error)}`
            );
        } catch (e) {}
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

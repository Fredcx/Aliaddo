import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: { username: string } }) {
    try {
        const username = params.username;
        if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

        const supabase = createClient();

        // 1. Get profile by username
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, company_name')
            .eq('username', username)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
        }

        // 2. Get settings for this profile
        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('form_fields, form_cover_image_url, primary_color')
            .eq('profile_id', profile.id)
            .single();

        if (settingsError) {
            return NextResponse.json({ error: 'Settings not configured' }, { status: 404 });
        }

        return NextResponse.json({
            profile,
            settings
        });

    } catch (error: any) {
        console.error('Form Settings GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

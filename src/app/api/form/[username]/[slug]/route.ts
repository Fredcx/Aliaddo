import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request, { params }: { params: { username: string, slug: string } }) {
    try {
        const username = params.username;
        const slug = params.slug;
        if (!username || !slug) return NextResponse.json({ error: 'Username and slug required' }, { status: 400 });

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

        // 2. Get form for this profile by slug
        const { data: form, error: formError } = await supabase
            .from('forms')
            .select('form_fields, form_cover_image_url, primary_color')
            .eq('profile_id', profile.id)
            .eq('slug', slug)
            .single();

        if (formError) {
            return NextResponse.json({ error: 'Formulário não encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            profile,
            settings: form // Pass the form data as 'settings' to keep the frontend compatible
        });

    } catch (error: any) {
        console.error('Form Settings GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

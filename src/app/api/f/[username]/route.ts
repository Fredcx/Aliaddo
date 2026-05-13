import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS because settings is private by default
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request, { params }: { params: { username: string } }) {
    try {
        const { username } = params;

        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name")
            .eq("username", username)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Professional not found" }, { status: 404 });
        }

        const { data: settings } = await supabaseAdmin
            .from("settings")
            .select("form_cover_image_url, form_fields, primary_color")
            .eq("profile_id", profile.id)
            .single();

        return NextResponse.json({
            profile,
            settings: settings || null
        });
    } catch (error) {
        console.error("Public Form Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

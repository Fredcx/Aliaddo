import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use the service role key to bypass RLS for inserting records from a public webhook
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request, { params }: { params: { username: string } }) {
    try {
        const username = params.username;
        const body = await request.json();

        if (!username || !body) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 1. Find the profile (Consultant) by username
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("username", username)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: "Professional not found" },
                { status: 404 }
            );
        }

        // Fetch settings to map IDs to actual questions (labels)
        const { data: settings } = await supabaseAdmin
            .from("settings")
            .select("form_fields")
            .eq("profile_id", profile.id)
            .single();

        const formFieldsArray: any[] = settings?.form_fields || [];
        const labelMap: Record<string, string> = {};
        for (const f of formFieldsArray) {
            labelMap[f.id] = f.label;
        }

        let name = "Cliente";
        let email = "cliente@lorem.com";
        let phone = "";

        // Heuristic payload parsing to handle generic JSON payloads
        // Flatten the object if there are nested attributes like in some forms
        const flattenObject = (obj: any, prefix = ""): Record<string, string> => {
            return Object.keys(obj).reduce((acc: any, k: string) => {
                const pre = prefix.length ? prefix + "." : "";
                if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
                    Object.assign(acc, flattenObject(obj[k], pre + k));
                } else if (typeof obj[k] !== "object") {
                    acc[pre + k] = String(obj[k]);
                }
                return acc;
            }, {});
        };

        const flatAnswers = flattenObject(body);

        for (const [key, val] of Object.entries(flatAnswers)) {
            const lowerKey = key.toLowerCase();
            const label = (labelMap[key] || key).toLowerCase();
            const strVal = val as string;

            if (label.includes("nome") || label.includes("name") || lowerKey.includes("name") || lowerKey.includes("nome")) {
                if (name === "Cliente") name = strVal; // only take the first one or we can concatenate
            }
            if (label.includes("email") || label.includes("e-mail") || lowerKey.includes("email")) {
                if (email === "cliente@lorem.com") email = strVal;
            }
            if (label.includes("telefone") || label.includes("phone") || label.includes("whats") || label.includes("celular") || lowerKey.includes("phone") || lowerKey.includes("tel") || lowerKey.includes("whats")) {
                phone = strVal;
            }
        }

        // 2. Create the Client
        const { data: client, error: clientError } = await supabaseAdmin
            .from("clients")
            .insert({
                profile_id: profile.id,
                name,
                email,
                phone,
                status: "Aguardando",
            })
            .select()
            .single();

        if (clientError || !client) {
            return NextResponse.json(
                { error: "Failed to create client" },
                { status: 500 }
            );
        }

        // 3. Insert the Responses
        const responsesToInsert = Object.entries(flatAnswers).map(([key, value]) => ({
            client_id: client.id,
            question: labelMap[key] || key,
            answer: value as string
        }));

        if (responsesToInsert.length > 0) {
            const { error: responsesError } = await supabaseAdmin
                .from("responses")
                .insert(responsesToInsert);

            if (responsesError) {
                return NextResponse.json(
                    { error: "Failed to save responses" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true, clientId: client.id });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

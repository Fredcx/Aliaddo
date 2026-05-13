"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
    const supabase = createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        redirect("/login?message=Could not authenticate user");
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signup(formData: FormData) {
    const supabase = createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const niche = formData.get("niche") as string;

    if (password !== confirmPassword) {
        redirect("/login?message=As senhas não coincidem");
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone: phone,
                niche: niche,
            }
        }
    });

    if (error) {
        redirect(`/login?message=${error.message}`);
    }

    if (data.user && !data.session) {
        redirect("/login?message=Cadastro realizado! Verifique sua caixa de e-mail para confirmar a conta.");
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

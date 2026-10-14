import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { authDestination } from '@/lib/auth-validation'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = authDestination(searchParams.get('next'))

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    const destination = next === '/reset-password' ? '/forgot-password' : '/login'
    const message = next === '/reset-password'
        ? 'O link expirou ou foi aberto em outro navegador. Solicite um novo link e abra neste navegador.'
        : 'Não foi possível concluir o acesso. Tente novamente.'
    return NextResponse.redirect(`${origin}${destination}?message=${encodeURIComponent(message)}`)
}

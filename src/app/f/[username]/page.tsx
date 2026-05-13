import { redirect } from 'next/navigation';

export default function OldPublicFormPage({ params }: { params: { username: string } }) {
    // Redireciona os links antigos (sem slug) para o formulário padrão
    redirect(`/f/${params.username}/padrao`);
}

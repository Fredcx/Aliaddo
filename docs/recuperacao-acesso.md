# Recuperação de acesso

O aplicativo usa Supabase Auth, com e-mail/senha e um botão de Google. Não existe uma senha universal do Aliaddo. Credenciais encontradas em scripts de demonstração não comprovam a existência de uma conta no ambiente publicado.

## Fluxo implementado

1. `/login` tem o link **Esqueci minha senha**.
2. `/forgot-password` solicita um link por e-mail e responde sem confirmar se a conta existe.
3. O e-mail retorna para `/auth/callback?next=/reset-password`.
4. O callback troca o código por uma sessão; `/reset-password` exige autenticação e permite definir nova senha.
5. Após sucesso, o usuário abre o Aliaddo.

O fluxo usa PKCE: solicite o link e abra-o no mesmo navegador. Link inválido ou expirado oferece uma nova solicitação. A senha antiga não é recuperada nem exposta. A alteração usa a sessão do usuário, sem chave administrativa.

## Configuração no ambiente publicado

Na Vercel, definir:

```text
SITE_URL=https://aliaddo.vercel.app
```

Manter as variáveis Supabase já usadas pelo projeto. A recuperação não exige `SUPABASE_SERVICE_ROLE_KEY`.

No Supabase, em configuração de URLs de autenticação, conferir Site URL e autorizar os retornos usados:

```text
https://aliaddo.vercel.app/auth/callback
https://aliaddo.vercel.app/auth/callback?next=/reset-password
```

O primeiro atende ao Google; o segundo, à recuperação. Para testes locais, configurar o domínio e porta locais correspondentes separadamente. Conferir o serviço de e-mail/SMTP do projeto. Se o template de recuperação tiver sido personalizado, manter o link de verificação fornecido pelo Supabase (`{{ .ConfirmationURL }}`), sem substituí-lo por uma URL que dispense a verificação.

Publicar o código antes de usar o link novo. Esta versão contém a recuperação de acesso e não depende de migração de banco. As funcionalidades novas de CRM são desenvolvidas em outra branch.

## Verificar uma conta esquecida

Com acesso autorizado ao painel Supabase, localizar o e-mail informado em Authentication / Users. Não inferir existência pelo retorno do formulário público de recuperação: a resposta genérica é intencional. Se não houver conta, verificar os outros e-mails do proprietário e o projeto Supabase associado à Vercel antes de criar outra conta.

O dono da conta deve abrir seu e-mail e escolher a nova senha diretamente na tela. Não enviar senha ou link de recuperação em conversas ou logs.

## Validação

Testes cobrem e-mail, destino do callback, rotas públicas/protegidas e validação da nova senha. A sessão é conferida no servidor antes de atualizar credenciais. Testar em homologação também o envio real do e-mail, abertura no mesmo navegador, link expirado, senha inválida, repetição de link e entrada com a nova senha.

A configuração de Site URL e a lista de retornos do Supabase devem apontar para o domínio publicado antes do envio. O template de recuperação deve manter `{{ .ConfirmationURL }}`. A entrega real do e-mail e a escolha de nova senha devem ser confirmadas pelo proprietário.

Referência: [Supabase — autenticação por senha e recuperação](https://supabase.com/docs/guides/auth/passwords).

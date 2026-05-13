-- Execute este script no SQL Editor do seu console Supabase para corrigir o erro ao finalizar.
-- Esse script altera a restrição de status permitindo o valor 'Finalizado' no banco de dados.

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_status_check CHECK (status IN ('Aguardando', 'Processando', 'Pronto', 'Enviado', 'Finalizado'));

-- Migração para adicionar campo senha_hash e tornar telefone opcional
-- Execute este script para corrigir a estrutura da tabela usuarios

-- Adicionar campo senha_hash à tabela usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha_hash VARCHAR(255);

-- Tornar campo telefone opcional (remover NOT NULL constraint)
ALTER TABLE usuarios ALTER COLUMN telefone DROP NOT NULL;

-- Tornar campo pais_id opcional também (já que telefone é opcional)
ALTER TABLE usuarios ALTER COLUMN pais_id DROP NOT NULL;

-- Adicionar campos para reset de senha (para funcionalidade futura)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;

-- Comentários sobre as alterações
COMMENT ON COLUMN usuarios.senha_hash IS 'Hash da senha do usuário para autenticação';
COMMENT ON COLUMN usuarios.telefone IS 'Telefone do usuário (opcional)';
COMMENT ON COLUMN usuarios.pais_id IS 'ID do país do usuário (opcional se telefone não fornecido)';
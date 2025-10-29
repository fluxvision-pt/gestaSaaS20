-- Migração para adicionar campos Bio e Cidade à tabela usuarios
-- Data: 2024

-- Adicionar campo bio (texto longo)
ALTER TABLE usuarios ADD COLUMN bio TEXT;

-- Adicionar campo cidade (string de até 100 caracteres)
ALTER TABLE usuarios ADD COLUMN cidade VARCHAR(100);

-- Comentários sobre os novos campos
COMMENT ON COLUMN usuarios.bio IS 'Biografia ou descrição pessoal do usuário';
COMMENT ON COLUMN usuarios.cidade IS 'Cidade onde o usuário reside';
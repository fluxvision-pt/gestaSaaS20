-- Migração para adicionar novos campos na tabela configuracoes_usuario
-- Execute este script no banco de dados

-- Adicionar campos gerais
ALTER TABLE configuracoes_usuario 
ADD COLUMN nome_empresa VARCHAR(255),
ADD COLUMN cnpj VARCHAR(20),
ADD COLUMN telefone VARCHAR(20),
ADD COLUMN cidade VARCHAR(100),
ADD COLUMN fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo',
ADD COLUMN moeda VARCHAR(10) DEFAULT 'BRL';

-- Adicionar campos financeiros
ALTER TABLE configuracoes_usuario 
ADD COLUMN preco_combustivel DECIMAL(12,2);

-- Adicionar campos de notificações
ALTER TABLE configuracoes_usuario 
ADD COLUMN notificacoes_email BOOLEAN DEFAULT FALSE,
ADD COLUMN alertas_meta BOOLEAN DEFAULT FALSE,
ADD COLUMN alertas_gastos BOOLEAN DEFAULT FALSE,
ADD COLUMN relatorios_semanais BOOLEAN DEFAULT FALSE;
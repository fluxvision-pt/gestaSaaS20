-- Script para limpar o banco de dados antes de recriar as tabelas

-- Remover triggers
DROP TRIGGER IF EXISTS trigger_usuario_criado ON usuarios;
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
DROP TRIGGER IF EXISTS update_plataformas_updated_at ON plataformas;
DROP TRIGGER IF EXISTS update_transacoes_updated_at ON transacoes;
DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes_usuario;

-- Remover funções
DROP FUNCTION IF EXISTS trigger_criar_dados_padrao();
DROP FUNCTION IF EXISTS criar_categorias_padrao(UUID);
DROP FUNCTION IF EXISTS criar_plataformas_padrao(UUID);
DROP FUNCTION IF EXISTS criar_meios_pagamento_padrao(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remover tabelas (na ordem inversa das dependências)
DROP TABLE IF EXISTS arquivos CASCADE;
DROP TABLE IF EXISTS transacoes CASCADE;
DROP TABLE IF EXISTS configuracoes_usuario CASCADE;
DROP TABLE IF EXISTS meios_pagamento CASCADE;
DROP TABLE IF EXISTS plataformas CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS sessoes CASCADE;
DROP TABLE IF EXISTS codigos_verificacao CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS paises CASCADE;

-- Remover views antigas se existirem
DROP VIEW IF EXISTS vw_resumo_mensal CASCADE;
DROP VIEW IF EXISTS vw_fluxo_caixa CASCADE;

SELECT 'Banco de dados limpo com sucesso!' as status;
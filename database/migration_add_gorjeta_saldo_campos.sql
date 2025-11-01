-- Migração para adicionar campos de gorjeta e saldo em mãos
-- Data: 2025-01-11
-- Descrição: Adiciona campos gorjeta, saldo_em_maos e saldo_em_maos_recebido à tabela transacoes

-- Adicionar coluna gorjeta (valor da gorjeta que soma ao total)
ALTER TABLE transacoes 
ADD COLUMN gorjeta DECIMAL(8,2) NULL;

-- Adicionar coluna saldo_em_maos (valor em mãos que não soma ao total)
ALTER TABLE transacoes 
ADD COLUMN saldo_em_maos DECIMAL(8,2) NULL;

-- Adicionar coluna saldo_em_maos_recebido (boolean para marcar se foi recebido)
ALTER TABLE transacoes 
ADD COLUMN saldo_em_maos_recebido BOOLEAN DEFAULT FALSE;

-- Comentários para documentação
COMMENT ON COLUMN transacoes.gorjeta IS 'Valor da gorjeta que deve ser somado ao valor total da transação';
COMMENT ON COLUMN transacoes.saldo_em_maos IS 'Valor em mãos que não deve ser somado ao valor total ganho';
COMMENT ON COLUMN transacoes.saldo_em_maos_recebido IS 'Indica se o saldo em mãos foi recebido como pagamento';

-- Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transacoes' 
AND column_name IN ('gorjeta', 'saldo_em_maos', 'saldo_em_maos_recebido')
ORDER BY column_name;
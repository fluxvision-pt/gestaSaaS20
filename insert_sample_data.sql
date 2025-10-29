-- Inserir dados de exemplo para testar o sistema
-- Primeiro, vamos inserir algumas transações de exemplo

-- Inserir transações de receita
INSERT INTO transacoes (id, usuario_id, tipo, valor, descricao, data_transacao, hora_transacao, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'receita', 5000.00, 'Salário', '2024-10-01', '09:00:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'receita', 1500.00, 'Freelance', '2024-10-05', '14:30:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'receita', 800.00, 'Venda produto', '2024-10-10', '16:45:00', NOW(), NOW());

-- Inserir transações de despesa
INSERT INTO transacoes (id, usuario_id, tipo, valor, descricao, data_transacao, hora_transacao, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440004', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'despesa', 1200.00, 'Aluguel', '2024-10-01', '10:00:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'despesa', 350.00, 'Supermercado', '2024-10-03', '18:20:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'despesa', 80.00, 'Combustível', '2024-10-04', '08:15:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440007', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'despesa', 150.00, 'Internet', '2024-10-05', '12:00:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440008', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'despesa', 45.00, 'Lanche', '2024-10-07', '13:30:00', NOW(), NOW());

-- Inserir mais transações para o mês atual (outubro 2024)
INSERT INTO transacoes (id, usuario_id, tipo, valor, descricao, data_transacao, hora_transacao, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440009', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'receita', 2000.00, 'Projeto extra', '2024-10-15', '11:00:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440010', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'despesa', 200.00, 'Farmácia', '2024-10-16', '15:45:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440011', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'despesa', 120.00, 'Restaurante', '2024-10-18', '19:30:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440012', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'receita', 500.00, 'Consultoria', '2024-10-20', '10:15:00', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440013', '2c5812fc-df0b-4510-9fa8-24acb047eff0', 'despesa', 75.00, 'Transporte', '2024-10-22', '07:45:00', NOW(), NOW());

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_transacoes FROM transacoes;
SELECT tipo, COUNT(*) as quantidade, SUM(valor) as total_valor FROM transacoes GROUP BY tipo;
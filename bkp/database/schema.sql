-- Schema para microSaaS de Gestão Financeira
-- Criado para suportar múltiplos usuários com isolamento de dados

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de países (Europa e América do Sul)
CREATE TABLE IF NOT EXISTS paises (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(3) NOT NULL UNIQUE, -- ISO 3166-1 alpha-3
    codigo_telefone VARCHAR(5) NOT NULL, -- Código internacional
    regiao VARCHAR(20) NOT NULL, -- 'Europa' ou 'America_Sul'
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telefone VARCHAR(15) NOT NULL,
    pais_id INTEGER NOT NULL REFERENCES paises(id),
    nome VARCHAR(100),
    email VARCHAR(255),
    verificado BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    moeda_padrao VARCHAR(3) DEFAULT 'EUR', -- ISO 4217
    simbolo_moeda VARCHAR(5) DEFAULT '€',
    timezone VARCHAR(50) DEFAULT 'Europe/Lisbon',
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(telefone, pais_id)
);

-- Tabela de códigos de verificação SMS
CREATE TABLE IF NOT EXISTS codigos_verificacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo VARCHAR(6) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'login', 'registro', 'recuperacao'
    usado BOOLEAN DEFAULT false,
    expira_em TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS sessoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    ativo BOOLEAN DEFAULT true,
    expira_em TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias de receitas/despesas (personalizáveis por usuário)
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'receita' ou 'despesa'
    cor VARCHAR(7) DEFAULT '#007bff', -- Cor em hexadecimal
    icone VARCHAR(50), -- Nome do ícone
    padrao BOOLEAN DEFAULT false, -- Se é categoria padrão do sistema
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, nome, tipo)
);

-- Tabela de plataformas de delivery/driver
CREATE TABLE IF NOT EXISTS plataformas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'delivery', 'driver', 'outro'
    cor VARCHAR(7) DEFAULT '#28a745',
    comissao_percentual DECIMAL(5,2) DEFAULT 0, -- % de comissão da plataforma
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, nome)
);

-- Tabela de meios de pagamento
CREATE TABLE IF NOT EXISTS meios_pagamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- 'dinheiro', 'cartao', 'pix', 'transferencia', 'outro'
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, nome)
);

-- Tabela principal de transações (expandida)
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL, -- 'receita' ou 'despesa'
    valor DECIMAL(12,2) NOT NULL,
    descricao TEXT,
    categoria_id UUID REFERENCES categorias(id),
    plataforma_id UUID REFERENCES plataformas(id), -- Para delivery/driver
    meio_pagamento_id UUID REFERENCES meios_pagamento(id),
    
    -- Dados específicos para delivery/driver
    km_percorridos DECIMAL(8,2),
    litros_combustivel DECIMAL(8,2),
    preco_combustivel DECIMAL(8,2),
    
    -- Dados adicionais
    data_transacao DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_transacao TIME DEFAULT CURRENT_TIME,
    localizacao VARCHAR(255),
    observacoes TEXT,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS configuracoes_usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE,
    
    -- Configurações financeiras
    meta_mensal_receita DECIMAL(12,2),
    meta_mensal_despesa DECIMAL(12,2),
    alerta_limite_gasto BOOLEAN DEFAULT false,
    limite_gasto_diario DECIMAL(12,2),
    
    -- Configurações de notificações
    notif_sms BOOLEAN DEFAULT true,
    notif_email BOOLEAN DEFAULT false,
    
    -- Configurações de relatórios
    formato_data VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    primeiro_dia_semana INTEGER DEFAULT 1, -- 1=Segunda, 0=Domingo
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de arquivos/anexos (criada após transacoes)
-- Será criada depois das outras tabelas

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_telefone_pais ON usuarios(telefone, pais_id);
CREATE INDEX IF NOT EXISTS idx_codigos_usuario_codigo ON codigos_verificacao(usuario_id, codigo);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_ativo ON sessoes(usuario_id, ativo);
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario_data ON transacoes(usuario_id, data_transacao);
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario_tipo ON transacoes(usuario_id, tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_usuario_tipo ON categorias(usuario_id, tipo, ativo);
CREATE INDEX IF NOT EXISTS idx_plataformas_usuario ON plataformas(usuario_id, ativo);

-- Inserir países da Europa e América do Sul
INSERT INTO paises (nome, codigo, codigo_telefone, regiao) VALUES
-- Europa
('Portugal', 'PRT', '+351', 'Europa'),
('Espanha', 'ESP', '+34', 'Europa'),
('França', 'FRA', '+33', 'Europa'),
('Itália', 'ITA', '+39', 'Europa'),
('Alemanha', 'DEU', '+49', 'Europa'),
('Reino Unido', 'GBR', '+44', 'Europa'),
('Holanda', 'NLD', '+31', 'Europa'),
('Bélgica', 'BEL', '+32', 'Europa'),
('Suíça', 'CHE', '+41', 'Europa'),
('Áustria', 'AUT', '+43', 'Europa'),
('Polônia', 'POL', '+48', 'Europa'),
('República Tcheca', 'CZE', '+420', 'Europa'),
('Hungria', 'HUN', '+36', 'Europa'),
('Romênia', 'ROU', '+40', 'Europa'),
('Bulgária', 'BGR', '+359', 'Europa'),
('Grécia', 'GRC', '+30', 'Europa'),
('Croácia', 'HRV', '+385', 'Europa'),
('Eslovênia', 'SVN', '+386', 'Europa'),
('Eslováquia', 'SVK', '+421', 'Europa'),
('Dinamarca', 'DNK', '+45', 'Europa'),
('Suécia', 'SWE', '+46', 'Europa'),
('Noruega', 'NOR', '+47', 'Europa'),
('Finlândia', 'FIN', '+358', 'Europa'),
('Islândia', 'ISL', '+354', 'Europa'),
('Irlanda', 'IRL', '+353', 'Europa'),
('Luxemburgo', 'LUX', '+352', 'Europa'),
('Malta', 'MLT', '+356', 'Europa'),
('Chipre', 'CYP', '+357', 'Europa'),
('Estônia', 'EST', '+372', 'Europa'),
('Letônia', 'LVA', '+371', 'Europa'),
('Lituânia', 'LTU', '+370', 'Europa'),

-- América do Sul
('Brasil', 'BRA', '+55', 'America_Sul'),
('Argentina', 'ARG', '+54', 'America_Sul'),
('Chile', 'CHL', '+56', 'America_Sul'),
('Colômbia', 'COL', '+57', 'America_Sul'),
('Peru', 'PER', '+51', 'America_Sul'),
('Venezuela', 'VEN', '+58', 'America_Sul'),
('Equador', 'ECU', '+593', 'America_Sul'),
('Bolívia', 'BOL', '+591', 'America_Sul'),
('Paraguai', 'PRY', '+595', 'America_Sul'),
('Uruguai', 'URY', '+598', 'America_Sul'),
('Guiana', 'GUY', '+592', 'America_Sul'),
('Suriname', 'SUR', '+597', 'America_Sul'),
('Guiana Francesa', 'GUF', '+594', 'America_Sul')
ON CONFLICT (codigo) DO NOTHING;

-- Função para criar categorias padrão para novos usuários
CREATE OR REPLACE FUNCTION criar_categorias_padrao(p_usuario_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Categorias de Receita
    INSERT INTO categorias (usuario_id, nome, tipo, cor, icone, padrao) VALUES
    (p_usuario_id, 'Delivery', 'receita', '#28a745', 'delivery', true),
    (p_usuario_id, 'Driver', 'receita', '#17a2b8', 'car', true),
    (p_usuario_id, 'Freelance', 'receita', '#6f42c1', 'laptop', true),
    (p_usuario_id, 'Salário', 'receita', '#007bff', 'briefcase', true),
    (p_usuario_id, 'Vendas', 'receita', '#fd7e14', 'shopping-cart', true),
    (p_usuario_id, 'Outros', 'receita', '#6c757d', 'plus-circle', true);
    
    -- Categorias de Despesa
    INSERT INTO categorias (usuario_id, nome, tipo, cor, icone, padrao) VALUES
    (p_usuario_id, 'Alimentação', 'despesa', '#dc3545', 'utensils', true),
    (p_usuario_id, 'Combustível', 'despesa', '#ffc107', 'gas-pump', true),
    (p_usuario_id, 'Manutenção Veículo', 'despesa', '#e83e8c', 'tools', true),
    (p_usuario_id, 'Telefone', 'despesa', '#20c997', 'phone', true),
    (p_usuario_id, 'Seguro', 'despesa', '#6610f2', 'shield-alt', true),
    (p_usuario_id, 'Moradia', 'despesa', '#fd7e14', 'home', true),
    (p_usuario_id, 'Saúde', 'despesa', '#198754', 'heartbeat', true),
    (p_usuario_id, 'Educação', 'despesa', '#0dcaf0', 'graduation-cap', true),
    (p_usuario_id, 'Lazer', 'despesa', '#d63384', 'gamepad', true),
    (p_usuario_id, 'Outros', 'despesa', '#6c757d', 'minus-circle', true);
END;
$$ LANGUAGE plpgsql;

-- Função para criar plataformas padrão para novos usuários
CREATE OR REPLACE FUNCTION criar_plataformas_padrao(p_usuario_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO plataformas (usuario_id, nome, tipo, cor, comissao_percentual) VALUES
    (p_usuario_id, 'Uber Eats', 'delivery', '#000000', 30.0),
    (p_usuario_id, 'Glovo', 'delivery', '#ffc244', 25.0),
    (p_usuario_id, 'Just Eat', 'delivery', '#ff8000', 28.0),
    (p_usuario_id, 'Bolt Food', 'delivery', '#34d186', 25.0),
    (p_usuario_id, 'Uber', 'driver', '#000000', 25.0),
    (p_usuario_id, 'Bolt', 'driver', '#34d186', 20.0),
    (p_usuario_id, 'Cabify', 'driver', '#7b2cbf', 25.0),
    (p_usuario_id, 'Free Now', 'driver', '#ffb800', 22.0);
END;
$$ LANGUAGE plpgsql;

-- Função para criar meios de pagamento padrão
CREATE OR REPLACE FUNCTION criar_meios_pagamento_padrao(p_usuario_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO meios_pagamento (usuario_id, nome, tipo) VALUES
    (p_usuario_id, 'Dinheiro', 'dinheiro'),
    (p_usuario_id, 'Cartão de Débito', 'cartao'),
    (p_usuario_id, 'Cartão de Crédito', 'cartao'),
    (p_usuario_id, 'PIX', 'pix'),
    (p_usuario_id, 'Transferência Bancária', 'transferencia'),
    (p_usuario_id, 'PayPal', 'outro'),
    (p_usuario_id, 'MB Way', 'outro');
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar dados padrão quando um usuário é criado
CREATE OR REPLACE FUNCTION trigger_criar_dados_padrao()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar configurações padrão
    INSERT INTO configuracoes_usuario (usuario_id) VALUES (NEW.id);
    
    -- Criar categorias padrão
    PERFORM criar_categorias_padrao(NEW.id);
    
    -- Criar plataformas padrão
    PERFORM criar_plataformas_padrao(NEW.id);
    
    -- Criar meios de pagamento padrão
    PERFORM criar_meios_pagamento_padrao(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_usuario_criado ON usuarios;
CREATE TRIGGER trigger_usuario_criado
    AFTER INSERT ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_criar_dados_padrao();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plataformas_updated_at BEFORE UPDATE ON plataformas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes_usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabela de arquivos/anexos (criada após todas as outras tabelas)
CREATE TABLE IF NOT EXISTS arquivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    transacao_id UUID REFERENCES transacoes(id) ON DELETE CASCADE,
    nome_original VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100),
    tamanho INTEGER,
    caminho TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
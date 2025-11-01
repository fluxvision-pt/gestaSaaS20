from sqlalchemy import Column, String, Boolean, DateTime, Integer, Date, Time, Text, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class Pais(Base):
    __tablename__ = "paises"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    codigo = Column(String(3), nullable=False, unique=True)
    codigo_telefone = Column(String(5), nullable=False)
    regiao = Column(String(20), nullable=False)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    telefone = Column(String(15))
    pais_id = Column(Integer, ForeignKey("paises.id"))
    nome = Column(String(100))
    email = Column(String(255))
    bio = Column(Text)
    cidade = Column(String(100))
    idioma = Column(String(10), default='pt-BR')
    senha_hash = Column(String(255))
    verificado = Column(Boolean, default=False)
    ativo = Column(Boolean, default=True)
    moeda_padrao = Column(String(3), default='EUR')
    simbolo_moeda = Column(String(5), default='€')
    timezone = Column(String(50), default='Europe/Lisbon')
    ultimo_login = Column(DateTime)
    reset_password_token = Column(String(255))
    reset_password_expires = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    @property
    def data_criacao(self):
        return self.created_at
    
    # Relacionamentos
    pais = relationship("Pais")
    transacoes = relationship("Transacao", back_populates="usuario")
    categorias = relationship("Categoria", back_populates="usuario")
    plataformas = relationship("Plataforma", back_populates="usuario")
    meios_pagamento = relationship("MeioPagamento", back_populates="usuario")

class Categoria(Base):
    __tablename__ = "categorias"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    nome = Column(String(100), nullable=False)
    tipo = Column(String(20), nullable=False)  # 'receita' ou 'despesa'
    cor = Column(String(7), default='#007bff')
    icone = Column(String(50))
    padrao = Column(Boolean, default=False)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="categorias")
    transacoes = relationship("Transacao", back_populates="categoria")

class Plataforma(Base):
    __tablename__ = "plataformas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    nome = Column(String(100), nullable=False)
    tipo = Column(String(20), nullable=False)  # 'delivery', 'driver', 'outro'
    cor = Column(String(7), default='#28a745')
    comissao_percentual = Column(Numeric(5,2), default=0)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="plataformas")
    transacoes = relationship("Transacao", back_populates="plataforma")

class MeioPagamento(Base):
    __tablename__ = "meios_pagamento"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    nome = Column(String(100), nullable=False)
    tipo = Column(String(20), nullable=False)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="meios_pagamento")
    transacoes = relationship("Transacao", back_populates="meio_pagamento")

class Transacao(Base):
    __tablename__ = "transacoes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))
    tipo = Column(String(20), nullable=False)  # 'receita' ou 'despesa'
    valor = Column(Numeric(12,2), nullable=False)
    descricao = Column(Text)
    categoria_id = Column(UUID(as_uuid=True), ForeignKey("categorias.id"))
    plataforma_id = Column(UUID(as_uuid=True), ForeignKey("plataformas.id"))
    meio_pagamento_id = Column(UUID(as_uuid=True), ForeignKey("meios_pagamento.id"))
    
    # Dados específicos para delivery/driver
    km_percorridos = Column(Numeric(8,2))
    litros_combustivel = Column(Numeric(8,2))
    preco_combustivel = Column(Numeric(8,2))
    
    # Dados adicionais
    data_transacao = Column(Date, nullable=False, server_default=func.current_date())
    hora_transacao = Column(Time, server_default=func.current_time())
    localizacao = Column(String(255))
    observacoes = Column(Text)
    
    # Metadados
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="transacoes")
    categoria = relationship("Categoria", back_populates="transacoes")
    plataforma = relationship("Plataforma", back_populates="transacoes")
    meio_pagamento = relationship("MeioPagamento", back_populates="transacoes")

class ConfiguracaoUsuario(Base):
    __tablename__ = "configuracoes_usuario"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), unique=True)
    
    # Configurações gerais
    nome_empresa = Column(String(255))
    cnpj = Column(String(20))
    telefone = Column(String(20))
    cidade = Column(String(100))
    fuso_horario = Column(String(50), default='America/Sao_Paulo')
    moeda = Column(String(10), default='BRL')
    
    # Configurações financeiras
    meta_mensal_receita = Column(Numeric(12,2))
    meta_mensal_despesa = Column(Numeric(12,2))
    alerta_limite_gasto = Column(Boolean, default=False)
    limite_gasto_diario = Column(Numeric(12,2))
    preco_combustivel = Column(Numeric(12,2))
    
    # Configurações de notificações
    notif_sms = Column(Boolean, default=True)
    notif_email = Column(Boolean, default=False)
    notificacoes_email = Column(Boolean, default=False)
    alertas_meta = Column(Boolean, default=False)
    alertas_gastos = Column(Boolean, default=False)
    relatorios_semanais = Column(Boolean, default=False)
    
    # Configurações de relatórios
    formato_data = Column(String(20), default='DD/MM/YYYY')
    primeiro_dia_semana = Column(Integer, default=1)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
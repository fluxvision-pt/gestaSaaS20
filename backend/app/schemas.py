from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date, time
from decimal import Decimal
import uuid

# Schemas de autenticação
class UserLogin(BaseModel):
    email: str
    senha: str

class UserRegister(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    telefone: str
    pais_id: Optional[int] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    nome: Optional[str]
    email: Optional[str]
    telefone: Optional[str]
    pais_id: Optional[int]
    bio: Optional[str]
    cidade: Optional[str]
    idioma: Optional[str]
    verificado: bool
    ativo: bool
    moeda_padrao: str
    simbolo_moeda: str
    ultimo_login: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    bio: Optional[str] = None
    cidade: Optional[str] = None
    idioma: Optional[str] = None
    pais_id: Optional[int] = None
    moeda_padrao: Optional[str] = None
    simbolo_moeda: Optional[str] = None
    timezone: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Schemas de País
class PaisResponse(BaseModel):
    id: int
    nome: str
    codigo: str
    codigo_telefone: str
    regiao: str

    class Config:
        from_attributes = True

# Schemas de Categoria
class CategoriaCreate(BaseModel):
    nome: str
    tipo: str  # 'receita' ou 'despesa'
    cor: Optional[str] = '#007bff'
    icone: Optional[str] = None

class CategoriaResponse(BaseModel):
    id: uuid.UUID
    nome: str
    tipo: str
    cor: str
    icone: Optional[str]
    padrao: bool
    ativo: bool

    class Config:
        from_attributes = True

# Schemas de Plataforma
class PlataformaCreate(BaseModel):
    nome: str
    tipo: str  # 'delivery', 'driver', 'outro'
    cor: Optional[str] = '#28a745'
    comissao_percentual: Optional[Decimal] = 0

class PlataformaResponse(BaseModel):
    id: uuid.UUID
    nome: str
    tipo: str
    cor: str
    comissao_percentual: Decimal
    ativo: bool

    class Config:
        from_attributes = True

# Schemas de Meio de Pagamento
class MeioPagamentoCreate(BaseModel):
    nome: str
    tipo: Optional[str] = None

class MeioPagamentoResponse(BaseModel):
    id: uuid.UUID
    nome: str
    tipo: str
    ativo: bool

    class Config:
        from_attributes = True

# Schemas de Transação
class TransacaoCreate(BaseModel):
    tipo: str  # 'receita' ou 'despesa'
    valor: Decimal
    descricao: Optional[str] = None
    categoria_id: Optional[uuid.UUID] = None
    plataforma_id: Optional[uuid.UUID] = None
    meio_pagamento_id: Optional[uuid.UUID] = None
    km_percorridos: Optional[Decimal] = None
    litros_combustivel: Optional[Decimal] = None
    preco_combustivel: Optional[Decimal] = None
    data_transacao: Optional[date] = None
    hora_transacao: Optional[time] = None
    localizacao: Optional[str] = None
    observacoes: Optional[str] = None

class TransacaoResponse(BaseModel):
    id: uuid.UUID
    tipo: str
    valor: Decimal
    descricao: Optional[str]
    categoria: Optional[CategoriaResponse]
    plataforma: Optional[PlataformaResponse]
    meio_pagamento: Optional[MeioPagamentoResponse]
    km_percorridos: Optional[Decimal]
    litros_combustivel: Optional[Decimal]
    preco_combustivel: Optional[Decimal]
    data_transacao: date
    hora_transacao: Optional[time]
    localizacao: Optional[str]
    observacoes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Schemas de Dashboard
class DashboardStats(BaseModel):
    total_receitas: Decimal
    total_despesas: Decimal
    saldo: Decimal
    total_km: Decimal
    valor_por_km: Decimal
    receitas_mes_atual: Decimal
    despesas_mes_atual: Decimal
    transacoes_recentes: List[TransacaoResponse]

class GraficoData(BaseModel):
    labels: List[str]
    receitas: List[float]
    despesas: List[float]

# Schemas de Configuração
class ConfiguracaoUpdate(BaseModel):
    # Configurações gerais
    nome_empresa: Optional[str] = None
    cnpj: Optional[str] = None
    telefone: Optional[str] = None
    cidade: Optional[str] = None
    fuso_horario: Optional[str] = None
    moeda: Optional[str] = None
    
    # Configurações financeiras
    meta_mensal_receita: Optional[Decimal] = None
    meta_mensal_despesa: Optional[Decimal] = None
    alerta_limite_gasto: Optional[bool] = None
    limite_gasto_diario: Optional[Decimal] = None
    preco_combustivel: Optional[Decimal] = None
    
    # Configurações de notificações
    notif_sms: Optional[bool] = None
    notif_email: Optional[bool] = None
    notificacoes_email: Optional[bool] = None
    alertas_meta: Optional[bool] = None
    alertas_gastos: Optional[bool] = None
    relatorios_semanais: Optional[bool] = None
    
    # Configurações de relatórios
    formato_data: Optional[str] = None
    primeiro_dia_semana: Optional[int] = None

# Schema de recuperação de senha
class PasswordResetRequest(BaseModel):
    email: str

class PasswordReset(BaseModel):
    token: str
    nova_senha: str
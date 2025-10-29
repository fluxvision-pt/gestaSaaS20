from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database import get_db
from app.models import Usuario, Transacao, Categoria, Plataforma
from app.schemas import DashboardStats, GraficoData
from app.auth import get_current_user
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Criar query base para receitas
    receitas_query = db.query(func.sum(Transacao.valor)).filter(
        Transacao.usuario_id == current_user.id,
        Transacao.tipo == 'receita'
    )
    
    # Aplicar filtros de data se fornecidos
    if data_inicio:
        receitas_query = receitas_query.filter(Transacao.data_transacao >= data_inicio)
    if data_fim:
        receitas_query = receitas_query.filter(Transacao.data_transacao <= data_fim)
    
    receitas_total = receitas_query.scalar() or Decimal('0')
    
    # Criar query base para despesas
    despesas_query = db.query(func.sum(Transacao.valor)).filter(
        Transacao.usuario_id == current_user.id,
        Transacao.tipo == 'despesa'
    )
    
    # Aplicar filtros de data se fornecidos
    if data_inicio:
        despesas_query = despesas_query.filter(Transacao.data_transacao >= data_inicio)
    if data_fim:
        despesas_query = despesas_query.filter(Transacao.data_transacao <= data_fim)
    
    despesas_total = despesas_query.scalar() or Decimal('0')
    
    saldo = receitas_total - despesas_total
    
    # Criar query base para KM
    km_query = db.query(func.sum(Transacao.km_percorridos)).filter(
        Transacao.usuario_id == current_user.id,
        Transacao.km_percorridos.isnot(None)
    )
    
    # Aplicar filtros de data se fornecidos
    if data_inicio:
        km_query = km_query.filter(Transacao.data_transacao >= data_inicio)
    if data_fim:
        km_query = km_query.filter(Transacao.data_transacao <= data_fim)
    
    km_total = km_query.scalar() or Decimal('0')
    
    # Calcular valor por KM
    valor_por_km = receitas_total / km_total if km_total > 0 else Decimal('0')
    
    # Receitas e despesas do mês atual
    mes_atual = datetime.now().month
    ano_atual = datetime.now().year
    
    receitas_mes = db.query(func.sum(Transacao.valor)).filter(
        Transacao.usuario_id == current_user.id,
        Transacao.tipo == 'receita',
        extract('month', Transacao.data_transacao) == mes_atual,
        extract('year', Transacao.data_transacao) == ano_atual
    ).scalar() or Decimal('0')
    
    despesas_mes = db.query(func.sum(Transacao.valor)).filter(
        Transacao.usuario_id == current_user.id,
        Transacao.tipo == 'despesa',
        extract('month', Transacao.data_transacao) == mes_atual,
        extract('year', Transacao.data_transacao) == ano_atual
    ).scalar() or Decimal('0')
    
    # Transações recentes (últimas 5)
    transacoes_recentes = db.query(Transacao).filter(
        Transacao.usuario_id == current_user.id
    ).order_by(Transacao.created_at.desc()).limit(5).all()
    
    return DashboardStats(
        total_receitas=receitas_total,
        total_despesas=despesas_total,
        saldo=saldo,
        total_km=km_total,
        valor_por_km=valor_por_km,
        receitas_mes_atual=receitas_mes,
        despesas_mes_atual=despesas_mes,
        transacoes_recentes=transacoes_recentes
    )

@router.get("/grafico-mensal")
async def get_grafico_mensal(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Dados dos últimos 6 meses
    dados_grafico = []
    
    for i in range(6):
        data_ref = datetime.now().replace(day=1)
        if i > 0:
            # Subtrair meses
            if data_ref.month > i:
                data_ref = data_ref.replace(month=data_ref.month - i)
            else:
                ano_anterior = data_ref.year - 1
                mes_anterior = 12 - (i - data_ref.month)
                data_ref = data_ref.replace(year=ano_anterior, month=mes_anterior)
        
        mes_nome = data_ref.strftime("%b/%Y")
        
        # Receitas do mês
        receita_mes = db.query(func.sum(Transacao.valor)).filter(
            Transacao.usuario_id == current_user.id,
            Transacao.tipo == 'receita',
            extract('month', Transacao.data_transacao) == data_ref.month,
            extract('year', Transacao.data_transacao) == data_ref.year
        ).scalar() or 0
        
        # Despesas do mês
        despesa_mes = db.query(func.sum(Transacao.valor)).filter(
            Transacao.usuario_id == current_user.id,
            Transacao.tipo == 'despesa',
            extract('month', Transacao.data_transacao) == data_ref.month,
            extract('year', Transacao.data_transacao) == data_ref.year
        ).scalar() or 0
        
        # KM do mês
        km_mes = db.query(func.sum(Transacao.km_percorridos)).filter(
            Transacao.usuario_id == current_user.id,
            Transacao.km_percorridos.isnot(None),
            extract('month', Transacao.data_transacao) == data_ref.month,
            extract('year', Transacao.data_transacao) == data_ref.year
        ).scalar() or 0
        
        # Calcular saldo do mês
        saldo_mes = float(receita_mes) - float(despesa_mes)
        
        dados_grafico.insert(0, {
            "mes": mes_nome,
            "receitas": float(receita_mes),
            "despesas": float(despesa_mes),
            "saldo": saldo_mes,
            "km_total": float(km_mes)
        })
    
    return dados_grafico

@router.get("/resumo-categorias")
async def get_resumo_categorias(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Receitas por categoria
    receitas_query = db.query(
        Categoria.nome,
        Categoria.cor,
        func.sum(Transacao.valor).label('total')
    ).join(Transacao).filter(
        Transacao.usuario_id == current_user.id,
        Transacao.tipo == 'receita'
    )
    
    # Aplicar filtros de data se fornecidos
    if data_inicio:
        receitas_query = receitas_query.filter(Transacao.data_transacao >= data_inicio)
    if data_fim:
        receitas_query = receitas_query.filter(Transacao.data_transacao <= data_fim)
    
    receitas_categoria = receitas_query.group_by(Categoria.nome, Categoria.cor).all()
    
    # Despesas por categoria
    despesas_categoria = db.query(
        Categoria.nome,
        Categoria.cor,
        func.sum(Transacao.valor).label('total')
    ).join(Transacao).filter(
        Transacao.usuario_id == current_user.id,
        Transacao.tipo == 'despesa'
    ).group_by(Categoria.nome, Categoria.cor).all()
    
    # Retornar apenas receitas no formato esperado pelo frontend
    return [
        {"name": r.nome, "valor": float(r.total), "cor": r.cor}
        for r in receitas_categoria
    ]

@router.get("/resumo-plataformas")
async def get_resumo_plataformas(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Usar LEFT JOIN para incluir todas as plataformas do usuário, mesmo sem transações
    plataformas_query = db.query(
        Plataforma.nome,
        Plataforma.cor,
        func.coalesce(func.sum(Transacao.valor), 0).label('total_receita'),
        func.coalesce(func.sum(Transacao.km_percorridos), 0).label('total_km'),
        func.count(Transacao.id).label('total_corridas')
    ).outerjoin(
        Transacao, 
        (Plataforma.id == Transacao.plataforma_id) & 
        (Transacao.usuario_id == current_user.id) & 
        (Transacao.tipo == 'receita')
    ).filter(
        Plataforma.usuario_id == current_user.id
    )
    
    # Aplicar filtros de data se fornecidos
    if data_inicio:
        plataformas_query = plataformas_query.filter(Transacao.data_transacao >= data_inicio)
    if data_fim:
        plataformas_query = plataformas_query.filter(Transacao.data_transacao <= data_fim)
    
    plataformas_stats = plataformas_query.group_by(Plataforma.nome, Plataforma.cor).all()
    
    # Calcular total geral para participação percentual
    total_receita_geral = sum(float(p.total_receita or 0) for p in plataformas_stats)
    
    return [
        {
            "nome": p.nome,
            "cor": p.cor,
            "receita": float(p.total_receita or 0),
            "km": float(p.total_km or 0),
            "corridas": p.total_corridas,
            "valor_por_km": float(p.total_receita or 0) / float(p.total_km or 1) if p.total_km and float(p.total_km) > 0 else 0,
            "participacao": (float(p.total_receita or 0) / total_receita_geral) * 100 if total_receita_geral > 0 else 0
        }
        for p in plataformas_stats
    ]
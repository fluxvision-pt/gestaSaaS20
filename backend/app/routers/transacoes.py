from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_, or_
from app.database import get_db
from app.models import Usuario, Transacao, Categoria, Plataforma, MeioPagamento
from app.schemas import TransacaoCreate, TransacaoResponse
from app.auth import get_current_user
from typing import List, Optional
from datetime import date
import uuid

router = APIRouter(prefix="/transacoes", tags=["Transações"])

@router.post("/", response_model=TransacaoResponse)
async def criar_transacao(
    transacao_data: TransacaoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_transacao = Transacao(
        usuario_id=current_user.id,
        **transacao_data.dict()
    )
    
    db.add(db_transacao)
    db.commit()
    db.refresh(db_transacao)
    
    return db_transacao

@router.get("/", response_model=List[TransacaoResponse])
async def listar_transacoes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    tipo: Optional[str] = Query(None, regex="^(receita|despesa)$"),
    categoria_id: Optional[str] = None,
    plataforma_id: Optional[str] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Transacao).options(
        joinedload(Transacao.categoria),
        joinedload(Transacao.plataforma),
        joinedload(Transacao.meio_pagamento)
    ).filter(Transacao.usuario_id == current_user.id)
    
    if tipo:
        query = query.filter(Transacao.tipo == tipo)
    
    if categoria_id:
        query = query.filter(Transacao.categoria_id == categoria_id)
    
    if plataforma_id:
        query = query.filter(Transacao.plataforma_id == plataforma_id)
    
    if data_inicio:
        query = query.filter(Transacao.data_transacao >= data_inicio)
    
    if data_fim:
        query = query.filter(Transacao.data_transacao <= data_fim)
    
    transacoes = query.order_by(desc(Transacao.data_transacao), desc(Transacao.created_at)).offset(skip).limit(limit).all()
    
    return transacoes

@router.get("/{transacao_id}", response_model=TransacaoResponse)
async def obter_transacao(
    transacao_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transacao = db.query(Transacao).options(
        joinedload(Transacao.categoria),
        joinedload(Transacao.plataforma),
        joinedload(Transacao.meio_pagamento)
    ).filter(
        Transacao.id == transacao_id,
        Transacao.usuario_id == current_user.id
    ).first()
    
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    return transacao

@router.put("/{transacao_id}", response_model=TransacaoResponse)
async def atualizar_transacao(
    transacao_id: str,
    transacao_data: TransacaoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transacao = db.query(Transacao).options(
        joinedload(Transacao.categoria),
        joinedload(Transacao.plataforma),
        joinedload(Transacao.meio_pagamento)
    ).filter(
        Transacao.id == transacao_id,
        Transacao.usuario_id == current_user.id
    ).first()
    
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    for field, value in transacao_data.dict(exclude_unset=True).items():
        setattr(transacao, field, value)
    
    db.commit()
    db.refresh(transacao)
    
    return transacao

@router.delete("/{transacao_id}")
async def deletar_transacao(
    transacao_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transacao = db.query(Transacao).filter(
        Transacao.id == transacao_id,
        Transacao.usuario_id == current_user.id
    ).first()
    
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    db.delete(transacao)
    db.commit()
    
    return {"message": "Transação deletada com sucesso"}

@router.get("/buscar/texto")
async def buscar_transacoes(
    q: str = Query(..., min_length=2),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transacoes = db.query(Transacao).filter(
        Transacao.usuario_id == current_user.id,
        or_(
            Transacao.descricao.ilike(f"%{q}%"),
            Transacao.observacoes.ilike(f"%{q}%"),
            Transacao.localizacao.ilike(f"%{q}%")
        )
    ).order_by(desc(Transacao.data_transacao)).limit(20).all()
    
    return transacoes
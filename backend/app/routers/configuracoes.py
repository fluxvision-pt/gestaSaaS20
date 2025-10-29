from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario, Categoria, Plataforma, MeioPagamento, Pais, ConfiguracaoUsuario
from app.schemas import (
    CategoriaCreate, CategoriaResponse,
    PlataformaCreate, PlataformaResponse,
    MeioPagamentoCreate, MeioPagamentoResponse,
    PaisResponse, ConfiguracaoUpdate
)
from app.auth import get_current_user
from typing import List
import uuid

router = APIRouter(prefix="/configuracoes", tags=["Configurações"])

# Endpoints de Países
@router.get("/paises", response_model=List[PaisResponse])
async def listar_paises(db: Session = Depends(get_db)):
    try:
        print("Endpoint /paises chamado")
        paises = db.query(Pais).filter(Pais.ativo == True).order_by(Pais.nome).all()
        print(f"Encontrados {len(paises)} países")
        return paises
    except Exception as e:
        print(f"Erro ao listar países: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# Endpoints de Categorias
@router.get("/categorias", response_model=List[CategoriaResponse])
async def listar_categorias(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    categorias = db.query(Categoria).filter(
        Categoria.usuario_id == current_user.id,
        Categoria.ativo == True
    ).order_by(Categoria.tipo, Categoria.nome).all()
    return categorias

@router.post("/categorias", response_model=CategoriaResponse)
async def criar_categoria(
    categoria_data: CategoriaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar se já existe categoria com mesmo nome e tipo
    existing = db.query(Categoria).filter(
        Categoria.usuario_id == current_user.id,
        Categoria.nome == categoria_data.nome,
        Categoria.tipo == categoria_data.tipo,
        Categoria.ativo == True
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Categoria já existe")
    
    db_categoria = Categoria(
        usuario_id=current_user.id,
        **categoria_data.dict()
    )
    
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    
    return db_categoria

@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
async def atualizar_categoria(
    categoria_id: str,
    categoria_data: CategoriaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    categoria = db.query(Categoria).filter(
        Categoria.id == categoria_id,
        Categoria.usuario_id == current_user.id
    ).first()
    
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    for field, value in categoria_data.dict().items():
        setattr(categoria, field, value)
    
    db.commit()
    db.refresh(categoria)
    
    return categoria

@router.delete("/categorias/{categoria_id}")
async def deletar_categoria(
    categoria_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    categoria = db.query(Categoria).filter(
        Categoria.id == categoria_id,
        Categoria.usuario_id == current_user.id
    ).first()
    
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    if categoria.padrao:
        raise HTTPException(status_code=400, detail="Não é possível deletar categoria padrão")
    
    categoria.ativo = False
    db.commit()
    
    return {"message": "Categoria deletada com sucesso"}

# Endpoints de Plataformas
@router.get("/plataformas", response_model=List[PlataformaResponse])
async def listar_plataformas(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plataformas = db.query(Plataforma).filter(
        Plataforma.usuario_id == current_user.id,
        Plataforma.ativo == True
    ).order_by(Plataforma.tipo, Plataforma.nome).all()
    return plataformas

@router.post("/plataformas", response_model=PlataformaResponse)
async def criar_plataforma(
    plataforma_data: PlataformaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_plataforma = Plataforma(
        usuario_id=current_user.id,
        **plataforma_data.dict()
    )
    
    db.add(db_plataforma)
    db.commit()
    db.refresh(db_plataforma)
    
    return db_plataforma

@router.put("/plataformas/{plataforma_id}", response_model=PlataformaResponse)
async def atualizar_plataforma(
    plataforma_id: str,
    plataforma_data: PlataformaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plataforma = db.query(Plataforma).filter(
        Plataforma.id == plataforma_id,
        Plataforma.usuario_id == current_user.id
    ).first()
    
    if not plataforma:
        raise HTTPException(status_code=404, detail="Plataforma não encontrada")
    
    for field, value in plataforma_data.dict().items():
        setattr(plataforma, field, value)
    
    db.commit()
    db.refresh(plataforma)
    
    return plataforma

@router.delete("/plataformas/{plataforma_id}")
async def deletar_plataforma(
    plataforma_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plataforma = db.query(Plataforma).filter(
        Plataforma.id == plataforma_id,
        Plataforma.usuario_id == current_user.id
    ).first()
    
    if not plataforma:
        raise HTTPException(status_code=404, detail="Plataforma não encontrada")
    
    plataforma.ativo = False
    db.commit()
    
    return {"message": "Plataforma deletada com sucesso"}

# Endpoints de Meios de Pagamento
@router.get("/meios-pagamento", response_model=List[MeioPagamentoResponse])
async def listar_meios_pagamento(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meios = db.query(MeioPagamento).filter(
        MeioPagamento.usuario_id == current_user.id,
        MeioPagamento.ativo == True
    ).order_by(MeioPagamento.tipo, MeioPagamento.nome).all()
    return meios

@router.post("/meios-pagamento", response_model=MeioPagamentoResponse)
async def criar_meio_pagamento(
    meio_data: MeioPagamentoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar se já existe um meio de pagamento com o mesmo nome
    existing_meio = db.query(MeioPagamento).filter(
        MeioPagamento.usuario_id == current_user.id,
        MeioPagamento.nome == meio_data.nome
    ).first()
    
    if existing_meio:
        raise HTTPException(
            status_code=400, 
            detail=f"Já existe um meio de pagamento com o nome '{meio_data.nome}'. Escolha um nome diferente."
        )
    
    meio_dict = meio_data.dict()
    # Se tipo não foi fornecido, usa o nome como tipo
    if not meio_dict.get('tipo'):
        meio_dict['tipo'] = meio_dict['nome'].lower()
    
    db_meio = MeioPagamento(
        usuario_id=current_user.id,
        **meio_dict
    )
    
    db.add(db_meio)
    db.commit()
    db.refresh(db_meio)
    
    return db_meio

@router.put("/meios-pagamento/{meio_id}", response_model=MeioPagamentoResponse)
async def atualizar_meio_pagamento(
    meio_id: str,
    meio_data: MeioPagamentoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meio = db.query(MeioPagamento).filter(
        MeioPagamento.id == meio_id,
        MeioPagamento.usuario_id == current_user.id
    ).first()
    
    if not meio:
        raise HTTPException(status_code=404, detail="Meio de pagamento não encontrado")
    
    # Verificar se já existe outro meio de pagamento com o mesmo nome
    existing_meio = db.query(MeioPagamento).filter(
        MeioPagamento.usuario_id == current_user.id,
        MeioPagamento.nome == meio_data.nome,
        MeioPagamento.id != meio_id
    ).first()
    
    if existing_meio:
        raise HTTPException(
            status_code=400, 
            detail=f"Já existe um meio de pagamento com o nome '{meio_data.nome}'. Escolha um nome diferente."
        )
    
    meio_dict = meio_data.dict()
    # Se tipo não foi fornecido, usa o nome como tipo
    if not meio_dict.get('tipo'):
        meio_dict['tipo'] = meio_dict['nome'].lower()
    
    for field, value in meio_dict.items():
        setattr(meio, field, value)
    
    db.commit()
    db.refresh(meio)
    
    return meio

@router.delete("/meios-pagamento/{meio_id}")
async def deletar_meio_pagamento(
    meio_id: str,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meio = db.query(MeioPagamento).filter(
        MeioPagamento.id == meio_id,
        MeioPagamento.usuario_id == current_user.id
    ).first()
    
    if not meio:
        raise HTTPException(status_code=404, detail="Meio de pagamento não encontrado")
    
    meio.ativo = False
    db.commit()
    
    return {"message": "Meio de pagamento deletado com sucesso"}

# Configurações do usuário
@router.get("/usuario")
async def obter_configuracoes(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(ConfiguracaoUsuario).filter(
        ConfiguracaoUsuario.usuario_id == current_user.id
    ).first()
    
    if not config:
        # Retornar configurações padrão se não existir
        return {
            "nome_empresa": "",
            "cnpj": "",
            "telefone": "",
            "cidade": "",
            "fuso_horario": "America/Sao_Paulo",
            "moeda": "BRL",
            "meta_mensal_receita": None,
            "meta_mensal_despesa": None,
            "alerta_limite_gasto": False,
            "limite_gasto_diario": None,
            "preco_combustivel": None,
            "notif_sms": True,
            "notif_email": False,
            "notificacoes_email": False,
            "alertas_meta": False,
            "alertas_gastos": False,
            "relatorios_semanais": False,
            "formato_data": "DD/MM/YYYY",
            "primeiro_dia_semana": 1
        }
    
    return config

@router.put("/usuario")
async def atualizar_configuracoes(
    config_data: ConfiguracaoUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    config = db.query(ConfiguracaoUsuario).filter(
        ConfiguracaoUsuario.usuario_id == current_user.id
    ).first()
    
    if not config:
        config = ConfiguracaoUsuario(usuario_id=current_user.id)
        db.add(config)
    
    for field, value in config_data.dict(exclude_unset=True).items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    
    return config
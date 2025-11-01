"""
Rotas de Autenticação - Versão Nova e Limpa
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.schemas import UserLogin, UserRegister, Token, UserResponse
from app.auth import (
    authenticate_user, 
    create_access_token, 
    create_user,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Endpoint de login."""
    # Autentica usuário
    user = authenticate_user(db, user_credentials.email, user_credentials.senha)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Cria token de acesso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "nome": user.nome,
            "ativo": user.ativo
        }
    }

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Endpoint de cadastro."""
    try:
        # Cria novo usuário
        user = create_user(
            db=db,
            email=user_data.email,
            password=user_data.senha,
            nome=user_data.nome
        )
        
        return {
            "id": user.id,
            "email": user.email,
            "nome": user.nome,
            "ativo": user.ativo,
            "data_criacao": user.data_criacao
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Obtém informações do usuário atual."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "nome": current_user.nome,
        "ativo": current_user.ativo,
        "data_criacao": current_user.data_criacao
    }

@router.post("/logout")
async def logout():
    """Endpoint de logout (apenas retorna sucesso, token é invalidado no frontend)."""
    return {"message": "Logout realizado com sucesso"}
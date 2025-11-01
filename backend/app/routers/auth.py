from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from app.database import get_db
from app.models import Usuario
from app.schemas import UserLogin, UserRegister, UserResponse, UserUpdate, Token, PasswordResetRequest, PasswordReset
from app.auth import authenticate_user, create_access_token, get_password_hash, get_current_user
import uuid
import secrets

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    try:
        print(f"🔐 Tentativa de login para: {user_credentials.email}")
        user = authenticate_user(db, user_credentials.email, user_credentials.senha)
        if not user:
            print(f"❌ Falha na autenticação para: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"✅ Usuário autenticado: {user.email}")
        
        # Atualizar último login
        user.ultimo_login = datetime.utcnow()
        db.commit()
        
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        print(f"✅ Token gerado com sucesso para: {user.email}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erro interno no login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Verificar se email já existe
    existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Criar novo usuário
    hashed_password = get_password_hash(user_data.senha)
    db_user = Usuario(
        id=uuid.uuid4(),
        nome=user_data.nome,
        email=user_data.email,
        senha_hash=hashed_password,
        telefone=user_data.telefone,
        pais_id=user_data.pais_id,
        verificado=True,  # Para simplificar, vamos marcar como verificado
        ativo=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Usuario = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == request.email).first()
    if not user:
        # Por segurança, não revelamos se o email existe ou não
        return {"message": "Se o email existir, você receberá instruções para redefinir sua senha"}
    
    # Gerar token de reset
    reset_token = secrets.token_urlsafe(32)
    user.reset_password_token = reset_token
    user.reset_password_expires = datetime.utcnow() + timedelta(hours=1)
    
    db.commit()
    
    # Aqui você implementaria o envio do email
    # Por enquanto, vamos apenas retornar o token para teste
    return {"message": "Token de reset gerado", "token": reset_token}

@router.post("/reset-password")
async def reset_password(request: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(
        Usuario.reset_password_token == request.token,
        Usuario.reset_password_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    # Atualizar senha
    user.senha_hash = get_password_hash(request.nova_senha)
    user.reset_password_token = None
    user.reset_password_expires = None
    
    db.commit()
    
    return {"message": "Senha redefinida com sucesso"}

@router.put("/alterar-senha")
async def alterar_senha(
    senha_data: dict,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.auth import verify_password
    
    # Verificar senha atual
    if not verify_password(senha_data["senha_atual"], current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )
    
    # Atualizar senha
    current_user.senha_hash = get_password_hash(senha_data["nova_senha"])
    db.commit()
    
    return {"message": "Senha alterada com sucesso"}

@router.delete("/excluir-conta")
async def excluir_conta(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Excluir usuário
    db.delete(current_user)
    db.commit()
    
    return {"message": "Conta excluída com sucesso"}

@router.put("/perfil", response_model=UserResponse)
async def atualizar_perfil(
    perfil_data: UserUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Atualizar campos do perfil
    for field, value in perfil_data.dict(exclude_unset=True).items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user
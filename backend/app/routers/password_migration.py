from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from ..database import get_db
from ..models import Usuario
from ..auth import get_password_hash, verify_old_password, is_old_password_format

router = APIRouter()

class PasswordMigrationRequest(BaseModel):
    email: str
    old_password: str

class PasswordMigrationResponse(BaseModel):
    email: str
    success: bool
    message: str

class UserPasswordInfo(BaseModel):
    email: str
    has_old_format: bool
    senha_hash_preview: str

@router.post("/secret-password-migration", response_model=PasswordMigrationResponse)
async def migrate_single_password(
    request: PasswordMigrationRequest,
    db: Session = Depends(get_db)
):
    """
    Rota secreta para migração manual de senhas.
    Converte uma senha do formato antigo para bcrypt.
    """
    user = db.query(Usuario).filter(Usuario.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )
    
    if not user.senha_hash:
        raise HTTPException(
            status_code=400,
            detail="Usuário não possui senha definida"
        )
    
    if not is_old_password_format(user.senha_hash):
        return PasswordMigrationResponse(
            email=request.email,
            success=False,
            message="Senha já está no formato bcrypt"
        )
    
    # Verifica se a senha antiga está correta
    if not verify_old_password(request.old_password, user.senha_hash):
        raise HTTPException(
            status_code=400,
            detail="Senha incorreta"
        )
    
    # Migra para bcrypt
    new_hash = get_password_hash(request.old_password)
    old_hash_preview = user.senha_hash[:20] + "..."
    
    user.senha_hash = new_hash
    db.commit()
    
    return PasswordMigrationResponse(
        email=request.email,
        success=True,
        message=f"Senha migrada com sucesso de {old_hash_preview} para bcrypt"
    )

@router.get("/secret-password-status", response_model=List[UserPasswordInfo])
async def get_password_status(db: Session = Depends(get_db)):
    """
    Rota secreta para verificar status das senhas.
    Lista usuários com senhas no formato antigo.
    """
    users = db.query(Usuario).filter(Usuario.senha_hash.isnot(None)).all()
    
    result = []
    for user in users:
        result.append(UserPasswordInfo(
            email=user.email,
            has_old_format=is_old_password_format(user.senha_hash),
            senha_hash_preview=user.senha_hash[:30] + "..." if len(user.senha_hash) > 30 else user.senha_hash
        ))
    
    return result

@router.post("/secret-migrate-all")
async def migrate_all_passwords(db: Session = Depends(get_db)):
    """
    ATENÇÃO: Esta rota NÃO pode migrar senhas automaticamente
    porque não temos acesso às senhas em texto plano.
    
    Esta rota apenas lista usuários que precisam de migração manual.
    """
    users_with_old_format = db.query(Usuario).filter(
        Usuario.senha_hash.isnot(None)
    ).all()
    
    old_format_users = []
    for user in users_with_old_format:
        if is_old_password_format(user.senha_hash):
            old_format_users.append({
                "email": user.email,
                "senha_hash_preview": user.senha_hash[:30] + "..."
            })
    
    return {
        "message": f"Encontrados {len(old_format_users)} usuários com formato antigo",
        "users": old_format_users,
        "note": "Estes usuários precisam fazer login para migração automática ou usar a rota de migração manual"
    }
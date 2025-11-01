from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Usuario
import os
from dotenv import load_dotenv
from pathlib import Path

# ==========================
# Carregar variáveis do ambiente
# ==========================
# Caminho absoluto para o .env.production
env_path = Path(__file__).resolve().parent.parent / ".env.production"

# Garante o carregamento mesmo se o main já tiver feito isso
load_dotenv(dotenv_path=env_path, override=True)

# ==========================
# Configurações de segurança
# ==========================
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Se a SECRET_KEY não estiver definida, gerar fallback seguro
if not SECRET_KEY or SECRET_KEY.strip() == "":
    import secrets
    SECRET_KEY = secrets.token_hex(32)
    print("⚠️  SECRET_KEY ausente no ambiente — chave temporária gerada automaticamente.")
else:
    print("🔐 SECRET_KEY carregada com sucesso.")

# ==========================
# Configuração do contexto de senhas
# ==========================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ==========================
# Funções utilitárias
# ==========================
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha informada corresponde ao hash armazenado."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gera o hash da senha para armazenamento seguro."""
    return pwd_context.hash(password)

# ==========================
# JWT - Criação e verificação
# ==========================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria um token JWT com expiração e payload customizado."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    try:
        encoded_jwt = jwt.encode(to_encode, str(SECRET_KEY), algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        print(f"❌ Erro ao gerar token JWT: {e}")
        raise HTTPException(status_code=500, detail="Falha interna na geração do token.")

def verify_token(token: str) -> str:
    """Verifica e decodifica o token JWT, retornando o ID do usuário."""
    try:
        payload = jwt.decode(token, str(SECRET_KEY), algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido (sem usuário).",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ==========================
# Dependências FastAPI
# ==========================
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Obtém o usuário atual a partir do token Bearer."""
    user_id = verify_token(credentials.credentials)
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def authenticate_user(db: Session, email: str, password: str):
    """Valida as credenciais de login."""
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        return False
    if not user.senha_hash:
        print(f"❌ Usuário {email} não possui senha_hash definida")
        return False
    if not verify_password(password, user.senha_hash):
        return False
    return user

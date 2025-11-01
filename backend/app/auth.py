import hashlib
import hmac
import base64
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

def verify_old_password(plain_password, old_hash):
    """Verifica senha no formato antigo ($$$rounds=535000$...)."""
    try:
        # Extrai os componentes do hash antigo
        if not old_hash.startswith("$$$rounds="):
            return False
        
        parts = old_hash.split("$")
        if len(parts) < 4:
            return False
        
        rounds_str = parts[2].replace("rounds=", "")
        rounds = int(rounds_str)
        salt_and_hash = parts[3]
        
        # Separa salt e hash
        # O formato parece ser: salt + hash_base64
        # Vamos tentar diferentes abordagens baseadas no padrão observado
        
        # Primeira tentativa: PBKDF2 com SHA-256
        salt_bytes = salt_and_hash[:16].encode('utf-8')  # Primeiros 16 chars como salt
        expected_hash = salt_and_hash[16:]  # Resto como hash
        
        # Gera hash usando PBKDF2
        derived_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt_bytes, rounds)
        computed_hash = base64.b64encode(derived_key).decode('utf-8')
        
        # Remove padding do base64 se necessário
        computed_hash = computed_hash.rstrip('=')
        expected_hash = expected_hash.rstrip('=')
        
        return computed_hash == expected_hash
        
    except Exception as e:
        print(f"Erro ao verificar senha antiga: {e}")
        return False

def is_old_password_format(password_hash):
    """Verifica se o hash está no formato antigo."""
    return password_hash and password_hash.startswith("$$$rounds=")

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
    """Valida as credenciais de login com migração automática de senhas."""
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        return False
    if not user.senha_hash:
        print(f"❌ Usuário {email} não possui senha_hash definida")
        return False
    
    # Verifica se é formato antigo e tenta migrar
    if is_old_password_format(user.senha_hash):
        print(f"🔄 Detectado formato antigo de senha para {email}, tentando migração...")
        if verify_old_password(password, user.senha_hash):
            # Senha correta no formato antigo, migra para bcrypt
            new_hash = get_password_hash(password)
            user.senha_hash = new_hash
            db.commit()
            print(f"✅ Senha migrada com sucesso para {email}")
            return user
        else:
            print(f"❌ Senha incorreta no formato antigo para {email}")
            return False
    
    # Verifica senha no formato bcrypt
    if not verify_password(password, user.senha_hash):
        return False
    return user

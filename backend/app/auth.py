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
        
        # Remove o prefixo $$$rounds= e extrai rounds e hash
        hash_part = old_hash[10:]  # Remove "$$$rounds="
        
        # Encontra onde termina o número de rounds
        dollar_pos = hash_part.find('$')
        if dollar_pos == -1:
            return False
            
        rounds_str = hash_part[:dollar_pos]
        salt_and_hash = hash_part[dollar_pos + 1:]
        
        rounds = int(rounds_str)
        
        # Tenta diferentes abordagens para extrair salt e hash
        approaches = [
            # Abordagem 1: Primeiros 16 caracteres como salt
            (16, 'utf-8'),
            # Abordagem 2: Primeiros 8 caracteres como salt
            (8, 'utf-8'),
            # Abordagem 3: Primeiros 12 caracteres como salt
            (12, 'utf-8'),
            # Abordagem 4: Decodifica base64 primeiro
            (None, 'base64'),
        ]
        
        for salt_len, encoding in approaches:
            try:
                if encoding == 'base64':
                    # Tenta decodificar o hash completo como base64
                    try:
                        decoded = base64.b64decode(salt_and_hash + '==')  # Adiciona padding
                        if len(decoded) >= 16:
                            salt_bytes = decoded[:8]  # Primeiros 8 bytes como salt
                            expected_hash_bytes = decoded[8:]
                        else:
                            continue
                    except:
                        continue
                else:
                    # Usa caracteres como salt
                    salt_str = salt_and_hash[:salt_len]
                    expected_hash = salt_and_hash[salt_len:]
                    salt_bytes = salt_str.encode(encoding)
                
                # Testa diferentes algoritmos de hash
                algorithms = ['sha256', 'sha1', 'sha512', 'md5']
                
                for algo in algorithms:
                    try:
                        # Gera hash usando PBKDF2
                        derived_key = hashlib.pbkdf2_hmac(algo, plain_password.encode('utf-8'), salt_bytes, rounds)
                        
                        if encoding == 'base64':
                            # Compara bytes diretamente
                            if derived_key == expected_hash_bytes:
                                print(f"✅ Senha antiga verificada com sucesso: salt_len=base64, algo={algo}")
                                return True
                        else:
                            # Converte para base64 e compara
                            computed_hash = base64.b64encode(derived_key).decode('utf-8').rstrip('=')
                            expected_clean = expected_hash.rstrip('=')
                            
                            if computed_hash == expected_clean:
                                print(f"✅ Senha antiga verificada com sucesso: salt_len={salt_len}, algo={algo}")
                                return True
                                
                            # Tenta também comparação direta sem base64
                            if derived_key.hex() == expected_hash.lower():
                                print(f"✅ Senha antiga verificada com sucesso (hex): salt_len={salt_len}, algo={algo}")
                                return True
                                
                    except Exception as algo_error:
                        continue
                        
            except Exception as approach_error:
                continue
        
        print(f"❌ Nenhuma abordagem funcionou para verificar senha antiga")
        return False
        
    except Exception as e:
        print(f"❌ Erro geral ao verificar senha antiga: {e}")
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
    try:
        user = db.query(Usuario).filter(Usuario.email == email).first()
        if not user:
            print(f"❌ Usuário não encontrado: {email}")
            return False
            
        if not user.senha_hash:
            print(f"❌ Usuário {email} não possui senha_hash definida")
            return False
        
        print(f"🔍 Verificando login para {email} - Hash format: {user.senha_hash[:20]}...")
        
        # Verifica se é formato antigo e tenta migrar
        if is_old_password_format(user.senha_hash):
            print(f"🔄 Detectado formato antigo de senha para {email}, tentando migração...")
            print(f"🔍 Hash antigo completo: {user.senha_hash}")
            
            if verify_old_password(password, user.senha_hash):
                # Senha correta no formato antigo, migra para bcrypt
                print(f"✅ Senha antiga verificada com sucesso para {email}, migrando...")
                new_hash = get_password_hash(password)
                user.senha_hash = new_hash
                db.commit()
                print(f"✅ Senha migrada com sucesso para {email}")
                return user
            else:
                print(f"❌ Senha incorreta no formato antigo para {email}")
                return False
        
        # Verifica senha no formato bcrypt
        print(f"🔍 Verificando senha bcrypt para {email}...")
        try:
            if not verify_password(password, user.senha_hash):
                print(f"❌ Senha bcrypt incorreta para {email}")
                return False
            print(f"✅ Senha bcrypt verificada com sucesso para {email}")
            return user
        except Exception as bcrypt_error:
            print(f"❌ Erro ao verificar senha bcrypt para {email}: {bcrypt_error}")
            # Se falhar no bcrypt, pode ser que seja um formato não reconhecido
            # Tenta como formato antigo mesmo sem o prefixo
            print(f"🔄 Tentando verificar como formato antigo sem prefixo...")
            if verify_old_password(password, "$$$rounds=535000$" + user.senha_hash):
                print(f"✅ Senha verificada como formato antigo sem prefixo, migrando...")
                new_hash = get_password_hash(password)
                user.senha_hash = new_hash
                db.commit()
                print(f"✅ Senha migrada com sucesso para {email}")
                return user
            return False
            
    except Exception as e:
        print(f"❌ Erro geral na autenticação para {email}: {e}")
        return False

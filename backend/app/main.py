from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.routers import auth, dashboard, transacoes, configuracoes

class CORSOptionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response
        
        response = await call_next(request)
        return response

app = FastAPI(
    title="gestaSaaS API",
    description="API para gestão financeira inteligente",
    version="1.0.0"
)

# Adicionar middleware personalizado para OPTIONS
app.add_middleware(CORSOptionsMiddleware)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://172.20.10.10:3000",
        "http://172.18.128.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(transacoes.router)
app.include_router(configuracoes.router)

@app.get("/")
async def root():
    return {"message": "gestaSaaS API - Gestão Inteligente"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "gestaSaaS API"}
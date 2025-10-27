# Guia de Deploy - gestaSaaS

Este documento contém instruções para fazer o deploy da aplicação gestaSaaS usando Docker e Easypanel.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Conta no Easypanel (para deploy em produção)
- Git configurado

## 🏗️ Arquitetura

A aplicação é composta por 3 serviços:

- **Frontend**: Aplicação React servida via Nginx
- **Backend**: API FastAPI
- **Database**: PostgreSQL 15

## 🚀 Deploy Local com Docker

### 1. Preparação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd gestaSaaS-20

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Configuração das Variáveis de Ambiente

Edite o arquivo `backend/.env` com suas configurações:

```env
DATABASE_URL=postgresql://gestasaas:sua_senha_segura@aplicacao_gesta_db:5432/gestasaas_db
SECRET_KEY=sua_chave_secreta_muito_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=3001
CORS_ORIGINS=http://localhost,http://localhost:80
LOG_LEVEL=info
```

### 3. Build e Execução

```bash
# Build das imagens
docker-compose build

# Execução dos serviços
docker-compose up -d

# Verificar status dos serviços
docker-compose ps

# Visualizar logs
docker-compose logs -f
```

### 4. Verificação

- Frontend: http://localhost
- Backend API: http://localhost:3001
- Health Check Backend: http://localhost:3001/health

## 🌐 Deploy em Produção com Easypanel

### 1. Preparação do Repositório

Certifique-se de que o código está no repositório Git:

```bash
git add .
git commit -m "Configuração para produção"
git push origin main
```

### 2. Configuração no Easypanel

1. Acesse seu painel do Easypanel
2. Crie um novo projeto
3. Conecte seu repositório Git
4. Use o arquivo `easypanel.yml` como configuração

### 3. Variáveis de Ambiente no Easypanel

Configure as seguintes variáveis no painel:

**Database:**
- `POSTGRES_DB`: gestasaas_db
- `POSTGRES_USER`: gestasaas
- `POSTGRES_PASSWORD`: sua_senha_segura

**Backend:**
- `DATABASE_URL`: postgresql://gestasaas:sua_senha_segura@database:5432/gestasaas_db
- `SECRET_KEY`: sua_chave_secreta_muito_segura
- `ENVIRONMENT`: production
- `CORS_ORIGINS`: https://seu-dominio.com

**Frontend:**
- `REACT_APP_API_URL`: /api
- `REACT_APP_ENVIRONMENT`: production

### 4. Deploy

1. Configure o domínio personalizado no Easypanel
2. Ative SSL/TLS automático
3. Faça o deploy através do painel

## 🔧 Comandos Úteis

### Docker Compose

```bash
# Parar todos os serviços
docker-compose down

# Rebuild de um serviço específico
docker-compose build backend
docker-compose up -d backend

# Executar comando no container
docker-compose exec backend python -c "print('Hello')"

# Ver logs de um serviço específico
docker-compose logs -f backend

# Limpar volumes (CUIDADO: apaga dados do banco)
docker-compose down -v
```

### Backup do Banco de Dados

```bash
# Backup
docker-compose exec aplicacao_gesta_db pg_dump -U gestasaas gestasaas_db > backup.sql

# Restore
docker-compose exec -T aplicacao_gesta_db psql -U gestasaas gestasaas_db < backup.sql
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco de dados**
   - Verifique se o serviço do banco está rodando
   - Confirme as credenciais no arquivo .env
   - Aguarde o banco inicializar completamente

2. **Frontend não carrega**
   - Verifique se o backend está respondendo
   - Confirme a configuração do CORS
   - Verifique os logs do Nginx

3. **Erro 502 Bad Gateway**
   - Backend pode não estar respondendo
   - Verifique os logs do backend
   - Confirme se a porta 3001 está exposta

### Logs e Monitoramento

```bash
# Ver todos os logs
docker-compose logs

# Logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs backend

# Status dos containers
docker-compose ps

# Uso de recursos
docker stats
```

## 🔒 Segurança

### Checklist de Segurança

- [ ] SECRET_KEY única e segura
- [ ] Senhas do banco de dados fortes
- [ ] CORS configurado corretamente
- [ ] SSL/TLS ativado em produção
- [ ] Variáveis de ambiente não commitadas
- [ ] DEBUG=false em produção
- [ ] Logs configurados adequadamente

### Backup e Recuperação

1. **Backup automático**: Configure backups regulares do banco
2. **Versionamento**: Mantenha tags Git para releases
3. **Monitoramento**: Configure alertas para falhas de serviço

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs dos serviços
2. Consulte a documentação do Docker/Easypanel
3. Verifique as configurações de rede e firewall

---

**Nota**: Sempre teste o deploy em ambiente de desenvolvimento antes de aplicar em produção.
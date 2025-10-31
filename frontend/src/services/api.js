import axios from 'axios';
import toast from 'react-hot-toast';

// URL da API de produção
const API_BASE_URL = 'https://rotas.fluxvision.cloud/api';



// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Só faz logout automático se for erro 401 e não for na rota /auth/me
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/me')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Não mostra toast para erros de autenticação na verificação inicial
    if (!(error.response?.status === 401 && error.config?.url?.includes('/auth/me'))) {
      const message = error.response?.data?.detail || 'Erro interno do servidor';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, nova_senha) => {
    const response = await api.post('/auth/reset-password', { token, nova_senha });
    return response.data;
  }
};

// Serviços do dashboard
export const dashboardService = {
  getStats: async (params = {}) => {
    const response = await api.get('/dashboard/stats', { params });
    return response.data;
  },
  
  getGraficoMensal: async (params = {}) => {
    const response = await api.get('/dashboard/grafico-mensal', { params });
    return response.data;
  },
  
  getResumoCategorias: async (params = {}) => {
    const response = await api.get('/dashboard/resumo-categorias', { params });
    return response.data;
  },
  
  getResumoPlataformas: async (params = {}) => {
    const response = await api.get('/dashboard/resumo-plataformas', { params });
    return response.data;
  }
};

// Serviços de transações
export const transacaoService = {
  listar: async (params = {}) => {
    const response = await api.get('/transacoes', { params });
    return response.data;
  },
  
  criar: async (transacao) => {
    const response = await api.post('/transacoes', transacao);
    return response.data;
  },
  
  obter: async (id) => {
    const response = await api.get(`/transacoes/${id}`);
    return response.data;
  },
  
  atualizar: async (id, transacao) => {
    const response = await api.put(`/transacoes/${id}`, transacao);
    return response.data;
  },
  
  deletar: async (id) => {
    const response = await api.delete(`/transacoes/${id}`);
    return response.data;
  },
  
  buscar: async (query) => {
    const response = await api.get('/transacoes/buscar/texto', { params: { q: query } });
    return response.data;
  }
};

// Serviços de configurações
export const configService = {
  // Países
  listarPaises: async () => {
    const response = await api.get('/configuracoes/paises');
    return response.data;
  },
  
  // Categorias
  listarCategorias: async () => {
    const response = await api.get('/configuracoes/categorias');
    return response.data;
  },
  
  listarCategoriasAtivas: async () => {
    const response = await api.get('/configuracoes/categorias/ativas');
    return response.data;
  },
  
  criarCategoria: async (categoria) => {
    const response = await api.post('/configuracoes/categorias', categoria);
    return response.data;
  },
  
  atualizarCategoria: async (id, categoria) => {
    const response = await api.put(`/configuracoes/categorias/${id}`, categoria);
    return response.data;
  },
  
  deletarCategoria: async (id) => {
    const response = await api.delete(`/configuracoes/categorias/${id}`);
    return response.data;
  },
  
  // Plataformas
  listarPlataformas: async () => {
    const response = await api.get('/configuracoes/plataformas');
    return response.data;
  },
  
  listarPlataformasAtivas: async () => {
    const response = await api.get('/configuracoes/plataformas/ativas');
    return response.data;
  },
  
  criarPlataforma: async (plataforma) => {
    const response = await api.post('/configuracoes/plataformas', plataforma);
    return response.data;
  },
  
  atualizarPlataforma: async (id, plataforma) => {
    const response = await api.put(`/configuracoes/plataformas/${id}`, plataforma);
    return response.data;
  },
  
  deletarPlataforma: async (id) => {
    const response = await api.delete(`/configuracoes/plataformas/${id}`);
    return response.data;
  },
  
  // Meios de pagamento
  listarMeiosPagamento: async () => {
    const response = await api.get('/configuracoes/meios-pagamento');
    return response.data;
  },
  
  listarMeiosPagamentoAtivos: async () => {
    const response = await api.get('/configuracoes/meios-pagamento/ativos');
    return response.data;
  },
  
  criarMeioPagamento: async (meio) => {
    const response = await api.post('/configuracoes/meios-pagamento', meio);
    return response.data;
  },
  
  atualizarMeioPagamento: async (id, meio) => {
    const response = await api.put(`/configuracoes/meios-pagamento/${id}`, meio);
    return response.data;
  },
  
  deletarMeioPagamento: async (id) => {
    const response = await api.delete(`/configuracoes/meios-pagamento/${id}`);
    return response.data;
  },
  
  // Configurações do usuário
  obterConfiguracoes: async () => {
    const response = await api.get('/configuracoes/usuario');
    return response.data;
  },
  
  atualizarConfiguracoes: async (config) => {
    const response = await api.put('/configuracoes/usuario', config);
    return response.data;
  },
  
  // Alterar senha
  alterarSenha: async (senhaData) => {
    const response = await api.put('/auth/alterar-senha', senhaData);
    return response.data;
  },
  
  // Excluir conta
  excluirConta: async () => {
    const response = await api.delete('/auth/excluir-conta');
    return response.data;
  },
  
  // Listar países
  getPaises: async () => {
    const response = await api.get('/configuracoes/paises');
    return response.data;
  },
  
  // Atualizar perfil do usuário
  atualizarPerfil: async (dadosPerfil) => {
    const response = await api.put('/auth/perfil', dadosPerfil);
    return response.data;
  }
};

// Alias para compatibilidade
export const configuracaoService = configService;

export default api;

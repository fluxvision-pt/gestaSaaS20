import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Settings, Plus, Edit2, Trash2, Save, Bell, DollarSign, MapPin, Palette, CreditCard } from 'lucide-react';
import { configuracaoService } from '../services/api';
import toast from 'react-hot-toast';
import { timezones, getTimezonesByRegion } from '../utils/timezones';

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('geral');
  const [categorias, setCategorias] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [meiosPagamento, setMeiosPagamento] = useState([]);
  const [configuracoes, setConfiguracoes] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showPlataformaModal, setShowPlataformaModal] = useState(false);
  const [showMeioPagamentoModal, setShowMeioPagamentoModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { register: registerConfig, handleSubmit: handleSubmitConfig, reset: resetConfig } = useForm();
  const { register: registerCategoria, handleSubmit: handleSubmitCategoria, reset: resetCategoria, formState: { errors: errorsCategoria } } = useForm();
  const { register: registerPlataforma, handleSubmit: handleSubmitPlataforma, reset: resetPlataforma, formState: { errors: errorsPlataforma } } = useForm();
  const { register: registerMeioPagamento, handleSubmit: handleSubmitMeioPagamento, reset: resetMeioPagamento, formState: { errors: errorsMeioPagamento } } = useForm();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [categoriasData, plataformasData, meiosPagamentoData, configData] = await Promise.all([
        configuracaoService.listarCategorias(),
        configuracaoService.listarPlataformas(),
        configuracaoService.listarMeiosPagamento(),
        configuracaoService.obterConfiguracoes()
      ]);
      
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
      setPlataformas(Array.isArray(plataformasData) ? plataformasData : []);
      setMeiosPagamento(Array.isArray(meiosPagamentoData) ? meiosPagamentoData : []);
      setConfiguracoes(configData || {});
      resetConfig(configData || {});
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setCategorias([]);
      setPlataformas([]);
      setMeiosPagamento([]);
      setConfiguracoes({});
      resetConfig({});
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async (data) => {
    try {
      await configuracaoService.atualizarConfiguracoes(data);
      toast.success('Configurações salvas com sucesso!');
      setConfiguracoes(data);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleCategoriaSubmit = async (data) => {
    try {
      if (editingItem) {
        await configuracaoService.atualizarCategoria(editingItem.id, data);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await configuracaoService.criarCategoria(data);
        toast.success('Categoria criada com sucesso!');
      }
      
      setShowCategoriaModal(false);
      setEditingItem(null);
      resetCategoria();
      carregarDados();
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    }
  };

  const handlePlataformaSubmit = async (data) => {
    try {
      if (editingItem) {
        await configuracaoService.atualizarPlataforma(editingItem.id, data);
        toast.success('Plataforma atualizada com sucesso!');
      } else {
        await configuracaoService.criarPlataforma(data);
        toast.success('Plataforma criada com sucesso!');
      }
      
      setShowPlataformaModal(false);
      setEditingItem(null);
      resetPlataforma();
      carregarDados();
    } catch (error) {
      toast.error('Erro ao salvar plataforma');
    }
  };

  const excluirCategoria = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await configuracaoService.deletarCategoria(id);
        toast.success('Categoria excluída com sucesso!');
        carregarDados();
      } catch (error) {
        toast.error('Erro ao excluir categoria');
      }
    }
  };

  const excluirPlataforma = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta plataforma?')) {
      try {
        await configuracaoService.deletarPlataforma(id);
        toast.success('Plataforma excluída com sucesso!');
        carregarDados();
      } catch (error) {
        toast.error('Erro ao excluir plataforma');
      }
    }
  };

  const editarCategoria = (categoria) => {
    setEditingItem(categoria);
    resetCategoria(categoria);
    setShowCategoriaModal(true);
  };

  const editarPlataforma = (plataforma) => {
    setEditingItem(plataforma);
    resetPlataforma(plataforma);
    setShowPlataformaModal(true);
  };

  const handleMeioPagamentoSubmit = async (data) => {
    try {
      if (editingItem) {
        await configuracaoService.atualizarMeioPagamento(editingItem.id, data);
        toast.success('Meio de pagamento atualizado com sucesso!');
      } else {
        await configuracaoService.criarMeioPagamento(data);
        toast.success('Meio de pagamento criado com sucesso!');
      }
      
      setShowMeioPagamentoModal(false);
      setEditingItem(null);
      resetMeioPagamento();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar meio de pagamento:', error);
      
      // Verificar se é erro de duplicação ou outro erro do backend
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Erro ao salvar meio de pagamento');
      }
    }
  };

  const excluirMeioPagamento = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este meio de pagamento?')) {
      try {
        await configuracaoService.deletarMeioPagamento(id);
        toast.success('Meio de pagamento excluído com sucesso!');
        carregarDados();
      } catch (error) {
        toast.error('Erro ao excluir meio de pagamento');
      }
    }
  };

  const editarMeioPagamento = (meio) => {
    setEditingItem(meio);
    resetMeioPagamento(meio);
    setShowMeioPagamentoModal(true);
  };

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'categorias', label: 'Categorias', icon: Palette },
    { id: 'plataformas', label: 'Plataformas', icon: MapPin },
    { id: 'meios-pagamento', label: 'Meios de Pagamento', icon: CreditCard },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'geral' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Configurações Gerais</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmitConfig(salvarConfiguracoes)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    {...registerConfig('nome_empresa')}
                    className="input"
                    placeholder="Minha Empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    {...registerConfig('cnpj')}
                    className="input"
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="text"
                    {...registerConfig('telefone')}
                    className="input"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    {...registerConfig('cidade')}
                    className="input"
                    placeholder="São Paulo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuso Horário
                  </label>
                  <select {...registerConfig('fuso_horario')} className="input">
                    {Object.entries(getTimezonesByRegion()).map(([region, timezoneList]) => (
                      <optgroup key={region} label={region}>
                        {timezoneList.map((timezone) => (
                          <option key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select {...registerConfig('moeda')} className="input">
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'categorias' && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="card-title">Categorias</h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetCategoria();
                  setShowCategoriaModal(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Categoria
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      ></div>
                      <span className="font-medium">{categoria.nome}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => editarCategoria(categoria)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirCategoria(categoria.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{categoria.descricao}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    categoria.tipo === 'receita' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {categoria.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plataformas' && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="card-title">Plataformas</h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetPlataforma();
                  setShowPlataformaModal(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Plataforma
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plataformas.map((plataforma) => (
                <div key={plataforma.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: plataforma.cor }}
                      ></div>
                      <span className="font-medium">{plataforma.nome}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => editarPlataforma(plataforma)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirPlataforma(plataforma.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{plataforma.tipo}</p>
                  <p className="text-sm text-gray-600">
                    Comissão: {plataforma.comissao_percentual}%
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    plataforma.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plataforma.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'meios-pagamento' && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="card-title">Meios de Pagamento</h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetMeioPagamento();
                  setShowMeioPagamentoModal(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Meio de Pagamento
              </button>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meiosPagamento.map((meio) => (
                <div key={meio.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{meio.nome}</span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => editarMeioPagamento(meio)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirMeioPagamento(meio.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                   <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    meio.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {meio.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notificacoes' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Configurações de Notificações</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmitConfig(salvarConfiguracoes)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
                    <p className="text-sm text-gray-500">Receber notificações importantes por email</p>
                  </div>
                  <input
                    type="checkbox"
                    {...registerConfig('notificacoes_email')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Alertas de Meta</h4>
                    <p className="text-sm text-gray-500">Notificar quando atingir metas mensais</p>
                  </div>
                  <input
                    type="checkbox"
                    {...registerConfig('alertas_meta')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Alertas de Gastos</h4>
                    <p className="text-sm text-gray-500">Notificar quando ultrapassar limite de gastos</p>
                  </div>
                  <input
                    type="checkbox"
                    {...registerConfig('alertas_gastos')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Relatórios Semanais</h4>
                    <p className="text-sm text-gray-500">Receber resumo semanal por email</p>
                  </div>
                  <input
                    type="checkbox"
                    {...registerConfig('relatorios_semanais')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'financeiro' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Configurações Financeiras</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmitConfig(salvarConfiguracoes)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Mensal de Receita (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerConfig('meta_mensal_receita')}
                    className="input"
                    placeholder="5000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite Mensal de Despesas (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerConfig('meta_mensal_despesa')}
                    className="input"
                    placeholder="2000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite Diário de Gastos (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerConfig('limite_gasto_diario')}
                    className="input"
                    placeholder="200.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Médio do Combustível (R$/L)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerConfig('preco_combustivel')}
                    className="input"
                    placeholder="5.50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Alerta de Limite de Gastos</h4>
                    <p className="text-sm text-gray-500">Notificar quando atingir 80% do limite diário</p>
                  </div>
                  <input
                    type="checkbox"
                    {...registerConfig('alerta_limite_gasto')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Categoria */}
      {showCategoriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            
            <form onSubmit={handleSubmitCategoria(handleCategoriaSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  {...registerCategoria('nome', { required: 'Nome é obrigatório' })}
                  className="input"
                  placeholder="Nome da categoria"
                />
                {errorsCategoria.nome && (
                  <p className="text-red-500 text-sm mt-1">{errorsCategoria.nome.message || 'Erro de validação'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  {...registerCategoria('tipo', { required: 'Tipo é obrigatório' })}
                  className="input"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
                {errorsCategoria.tipo && (
                  <p className="text-red-500 text-sm mt-1">{errorsCategoria.tipo.message || 'Erro de validação'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <input
                  type="color"
                  {...registerCategoria('cor')}
                  className="input h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  {...registerCategoria('descricao')}
                  className="input"
                  rows="3"
                  placeholder="Descrição da categoria..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoriaModal(false);
                    setEditingItem(null);
                    resetCategoria();
                  }}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Plataforma */}
      {showPlataformaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Editar Plataforma' : 'Nova Plataforma'}
            </h2>
            
            <form onSubmit={handleSubmitPlataforma(handlePlataformaSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  {...registerPlataforma('nome', { required: 'Nome é obrigatório' })}
                  className="input"
                  placeholder="Nome da plataforma"
                />
                {errorsPlataforma.nome && (
                  <p className="text-red-500 text-sm mt-1">{errorsPlataforma.nome.message || 'Erro de validação'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  {...registerPlataforma('tipo', { required: 'Tipo é obrigatório' })}
                  className="input"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="delivery">Delivery</option>
                  <option value="driver">Driver</option>
                  <option value="outro">Outro</option>
                </select>
                {errorsPlataforma.tipo && (
                  <p className="text-red-500 text-sm mt-1">{errorsPlataforma.tipo.message || 'Erro de validação'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <input
                  type="color"
                  {...registerPlataforma('cor')}
                  className="input h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comissão (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...registerPlataforma('comissao_percentual')}
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...registerPlataforma('ativo')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Plataforma ativa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlataformaModal(false);
                    setEditingItem(null);
                    resetPlataforma();
                  }}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Meio de Pagamento */}
      {showMeioPagamentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingItem ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento'}
            </h2>
            
            <form onSubmit={handleSubmitMeioPagamento(handleMeioPagamentoSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  {...registerMeioPagamento('nome', { required: 'Nome é obrigatório' })}
                  className="input"
                  placeholder="Nome do meio de pagamento"
                />
                {errorsMeioPagamento.nome && (
                  <p className="text-red-500 text-sm mt-1">{getErrorMessage(errorsMeioPagamento.nome)}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...registerMeioPagamento('ativo')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Meio de pagamento ativo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMeioPagamentoModal(false);
                    setEditingItem(null);
                    resetMeioPagamento();
                  }}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
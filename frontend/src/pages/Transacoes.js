import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Search, Filter, Calendar, DollarSign, MapPin, Car, Save, X } from 'lucide-react';
import { transacaoService, configuracaoService } from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useCurrencyFormatter } from '../utils/currency';

const Transacoes = () => {
  const [transacoes, setTransacoes] = useState([]);
  // Estados para filtros (todos os itens)
  const [categoriasFiltro, setCategoriasFiltro] = useState([]);
  const [plataformasFiltro, setPlataformasFiltro] = useState([]);
  // Estados para formulários (apenas ativos)
  const [categorias, setCategorias] = useState([]);
  const [plataformas, setPlataformas] = useState([]);
  const [meiosPagamento, setMeiosPagamento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo: '',
    categoria: '',
    plataforma: '',
    dataInicio: '',
    dataFim: ''
  });
  const { formatCurrency } = useCurrencyFormatter();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const tipoWatch = watch('tipo');

  // Função para extrair mensagem de erro de forma segura
  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error.message === 'string') return error.message;
    if (typeof error === 'string') return error;
    return 'Erro de validação';
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [
        transacoesData, 
        categoriasAtivasData, 
        plataformasAtivasData, 
        meiosPagamentoAtivasData,
        categoriasTodasData,
        plataformasTodasData
      ] = await Promise.all([
        transacaoService.listar(),
        configuracaoService.listarCategoriasAtivas(),
        configuracaoService.listarPlataformasAtivas(),
        configuracaoService.listarMeiosPagamentoAtivos(),
        configuracaoService.listarCategorias(),
        configuracaoService.listarPlataformas()
      ]);
      
      setTransacoes(transacoesData);
      // Para formulários (apenas ativos)
      setCategorias(categoriasAtivasData);
      setPlataformas(plataformasAtivasData);
      setMeiosPagamento(meiosPagamentoAtivasData);
      // Para filtros (todos os itens)
      setCategoriasFiltro(categoriasTodasData);
      setPlataformasFiltro(plataformasTodasData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingTransaction) {
        await transacaoService.atualizar(editingTransaction.id, data);
        toast.success('Transação atualizada com sucesso!');
      } else {
        await transacaoService.criar(data);
        toast.success('Transação criada com sucesso!');
      }
      
      setShowModal(false);
      setEditingTransaction(null);
      reset();
      carregarDados();
    } catch (error) {
      toast.error('Erro ao salvar transação');
    }
  };

  const handleEdit = (transacao) => {
    setEditingTransaction(transacao);
    
    // Formatar a data para o formato esperado pelo input date (YYYY-MM-DD)
    const transacaoFormatada = {
      ...transacao,
      data: transacao.data ? new Date(transacao.data).toISOString().split('T')[0] : ''
    };
    
    reset(transacaoFormatada);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await transacaoService.deletar(id);
        toast.success('Transação excluída com sucesso!');
        carregarDados();
      } catch (error) {
        toast.error('Erro ao excluir transação');
      }
    }
  };



  const transacoesFiltradas = transacoes.filter(transacao => {
    // Aplicar filtros de data apenas se houver filtros de data definidos
    const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
    const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;

    // Se há filtros de data, verificar se a transação tem data válida
    if (dataInicio || dataFim) {
      if (!transacao.data) {
        return false;
      }
      
      const dataTransacao = new Date(transacao.data);
      if (isNaN(dataTransacao.getTime())) {
        return false;
      }
      
      // Filtro por data
      if (dataInicio && dataTransacao < dataInicio) {
        return false;
      }
      if (dataFim && dataTransacao > dataFim) {
        return false;
      }
    }

    return (!filtros.tipo || transacao.tipo === filtros.tipo) &&
           (!filtros.categoria || transacao.categoria_id === filtros.categoria) &&
           (!filtros.plataforma || transacao.plataforma_id === filtros.plataforma);
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
        <button
          onClick={() => {
            setEditingTransaction(null);
            reset();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="input"
            >
              <option value="">Todos os tipos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
            
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
              className="input"
            >
              <option value="">Todas as categorias</option>
              {categoriasFiltro.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome} {!categoria.ativo && '(Inativo)'}
                </option>
              ))}
            </select>
            
            <select
              value={filtros.plataforma}
              onChange={(e) => setFiltros({...filtros, plataforma: e.target.value})}
              className="input"
            >
              <option value="">Todas as plataformas</option>
              {plataformasFiltro.map(plataforma => (
                <option key={plataforma.id} value={plataforma.id}>
                  {plataforma.nome} {!plataforma.ativo && '(Inativo)'}
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
              className="input"
              placeholder="Data início"
            />
            
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
              className="input"
              placeholder="Data fim"
            />
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transacoesFiltradas.map((transacao) => (
                  <tr key={transacao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transacao.data ? format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transacao.tipo === 'receita' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transacao.descricao}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transacao.categoria?.nome || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(transacao.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transacao.km_percorridos ? `${transacao.km_percorridos} km` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transacao)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transacao.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Transação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    {...register('tipo', { required: 'Tipo é obrigatório' })}
                    className="input"
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                  {errors.tipo && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.tipo)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('valor', { required: 'Valor é obrigatório' })}
                    className="input"
                    placeholder="0,00"
                  />
                  {errors.valor && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.valor)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    {...register('data', { required: 'Data é obrigatória' })}
                    className="input"
                  />
                  {errors.data && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.data)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    {...register('categoria_id')}
                    className="input"
                  >
                    <option value="">Selecione a categoria</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {tipoWatch === 'receita' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plataforma
                    </label>
                    <select
                      {...register('plataforma_id')}
                      className="input"
                    >
                      <option value="">Selecione a plataforma</option>
                      {plataformas.map(plataforma => (
                        <option key={plataforma.id} value={plataforma.id}>
                          {plataforma.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meio de Pagamento *
                  </label>
                  <select
                    {...register('meio_pagamento_id', { required: 'Meio de pagamento é obrigatório' })}
                    className="input"
                  >
                    <option value="">Selecione o meio de pagamento</option>
                    {meiosPagamento.map(meio => (
                      <option key={meio.id} value={meio.id}>
                        {meio.nome}
                      </option>
                    ))}
                  </select>
                  {errors.meio_pagamento_id && (
                    <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.meio_pagamento_id)}</p>
                  )}
                </div>

                {tipoWatch === 'receita' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KM Percorridos
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('km_percorridos')}
                      className="input"
                      placeholder="0,00"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  {...register('descricao')}
                  className="input"
                  rows="3"
                  placeholder="Descrição da transação..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                    reset();
                  }}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTransaction ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transacoes;
import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car, 
  MapPin,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [graficoMensal, setGraficoMensal] = useState([]);
  const [resumoCategorias, setResumoCategorias] = useState([]);
  const [resumoPlataformas, setResumoPlataformas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, graficoData, categoriasData, plataformasData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getGraficoMensal(),
        dashboardService.getResumoCategorias(),
        dashboardService.getResumoPlataformas()
      ]);

      setStats(statsData);
      setGraficoMensal(graficoData);
      setResumoCategorias(categoriasData);
      setResumoPlataformas(plataformasData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Visão geral dos seus ganhos e performance</p>
        </div>
        <div className="text-sm text-slate-500">
          Atualizado em {format(new Date(), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.total_receitas)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">
                {formatCurrency(stats?.receitas_mes_atual)}
              </span>
              <span className="text-slate-500 ml-1">este mês</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats?.total_despesas)}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">
                {formatCurrency(stats?.despesas_mes_atual)}
              </span>
              <span className="text-slate-500 ml-1">este mês</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Saldo Total</p>
                <p className={`text-2xl font-bold ${stats?.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats?.saldo)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-slate-600">
                KM Total: {formatNumber(stats?.km_total)} km
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor por KM</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(stats?.valor_por_km)}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <MapPin className="h-4 w-4 text-slate-400 mr-1" />
              <span className="text-slate-600">por quilômetro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              <h3 className="card-title">Receitas vs Despesas (6 meses)</h3>
            </div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={graficoMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Receitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-slate-600" />
              <h3 className="card-title">Receitas por Categoria</h3>
            </div>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={Array.isArray(resumoCategorias) ? resumoCategorias.filter(cat => cat.receitas > 0) : []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="receitas"
                  nameKey="categoria"
                >
                  {Array.isArray(resumoCategorias) ? resumoCategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )) : []}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Performance por Plataforma</h3>
          <p className="card-description">Análise detalhada de ganhos e KM por plataforma</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(resumoPlataformas) ? resumoPlataformas.map((plataforma, index) => (
              <div key={plataforma.plataforma} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{plataforma.plataforma}</h4>
                  <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Receitas:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(plataforma.receitas)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">KM:</span>
                    <span className="font-medium">{formatNumber(plataforma.km)} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Corridas:</span>
                    <span className="font-medium">{formatNumber(plataforma.corridas)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                    <span className="text-slate-600">Valor/KM:</span>
                    <span className="font-semibold text-primary-600">
                      {formatCurrency(plataforma.valor_por_km)}
                    </span>
                  </div>
                </div>
              </div>
            )) : []}
          </div>
        </div>
      </div>

      {stats?.transacoes_recentes && stats.transacoes_recentes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Transações Recentes</h3>
            <p className="card-description">Últimas 5 transações registradas</p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {stats?.transacoes_recentes && Array.isArray(stats.transacoes_recentes) ? stats.transacoes_recentes.map((transacao) => (
                <div key={transacao.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${transacao.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{transacao.descricao}</p>
                      <p className="text-sm text-slate-500">
                        {transacao.categoria?.nome || transacao.categoria || '-'} • {transacao.data ? format(new Date(transacao.data), "dd/MM/yyyy", { locale: ptBR }) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(transacao.valor))}
                    </p>
                    {transacao.km && (
                      <p className="text-sm text-slate-500">{transacao.km} km</p>
                    )}
                  </div>
                </div>
              )) : []}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
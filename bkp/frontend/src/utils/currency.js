import React from 'react';
import { configuracaoService } from '../services/api';

// Cache para as configurações do usuário
let userConfig = null;

// Função para carregar as configurações do usuário
export const loadUserConfig = async () => {
  try {
    userConfig = await configuracaoService.obterConfiguracoes();
    return userConfig;
  } catch (error) {
    console.error('Erro ao carregar configurações do usuário:', error);
    // Retorna configurações padrão em caso de erro
    userConfig = {
      moeda: 'BRL',
      fuso_horario: 'America/Sao_Paulo'
    };
    return userConfig;
  }
};

// Função para obter as configurações (carrega se necessário)
export const getUserConfig = async () => {
  if (!userConfig) {
    await loadUserConfig();
  }
  return userConfig;
};

// Função síncrona para formatação quando já temos a configuração
export const formatCurrencySync = (value, currency = 'BRL') => {
  const currencyLocales = {
    'BRL': 'pt-BR',
    'USD': 'en-US',
    'EUR': 'de-DE' // Alemão tem boa formatação para EUR
  };
  
  const locale = currencyLocales[currency] || 'pt-BR';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};

// Hook para usar formatação de moeda em componentes React
export const useCurrencyFormatter = () => {
  const [config, setConfig] = React.useState(null);
  
  React.useEffect(() => {
    loadUserConfig().then((userConfig) => {
      console.log('Configuração carregada:', userConfig); // Debug
      setConfig(userConfig);
    });
  }, []);
  
  const formatCurrency = React.useCallback((value) => {
    if (!config) return formatCurrencySync(value, 'BRL');
    
    // Verificar se a configuração tem o campo moeda
    const currency = config.moeda || config.currency || 'BRL';
    console.log('Usando moeda:', currency); // Debug
    
    return formatCurrencySync(value, currency);
  }, [config]);
  
  return { formatCurrency, currency: config?.moeda || config?.currency || 'BRL' };
};
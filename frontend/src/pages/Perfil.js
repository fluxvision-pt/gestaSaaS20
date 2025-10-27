import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, MapPin, Phone, Lock, Save, Camera, Shield, Bell, Trash2, Globe, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { configuracaoService } from '../services/api';
import toast from 'react-hot-toast';
import { timezones, getTimezonesByRegion } from '../utils/timezones';

const Perfil = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paises, setPaises] = useState([]);

  useEffect(() => {
    fetchPaises();
  }, []);

  const fetchPaises = async () => {
    try {
      const data = await configuracaoService.getPaises();
      setPaises(data);
    } catch (error) {
      console.error('Erro ao carregar países:', error);
    }
  };

  const { register: registerPerfil, handleSubmit: handleSubmitPerfil, formState: { errors: errorsPerfil } } = useForm({
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      pais: user?.pais || '',
      cidade: user?.cidade || '',
      bio: user?.bio || ''
    }
  });

  const { register: registerSenha, handleSubmit: handleSubmitSenha, reset: resetSenha, formState: { errors: errorsSenha } } = useForm();

  const { register: registerPreferencias, handleSubmit: handleSubmitPreferencias } = useForm({
    defaultValues: {
      idioma: user?.idioma || 'pt-BR',
      timezone: user?.timezone || 'America/Sao_Paulo'
    }
  });

  const atualizarPerfil = async (data) => {
    try {
      const response = await configuracaoService.atualizarPerfil(data);
      updateUser(response);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const alterarSenha = async (data) => {
    if (data.nova_senha !== data.confirmar_senha) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      await configuracaoService.alterarSenha({
        senha_atual: data.senha_atual,
        nova_senha: data.nova_senha
      });
      toast.success('Senha alterada com sucesso!');
      setShowPasswordModal(false);
      resetSenha();
    } catch (error) {
      toast.error('Erro ao alterar senha');
    }
  };

  const salvarPreferencias = async (data) => {
    try {
      const response = await configuracaoService.atualizarPerfil(data);
      updateUser(response);
      toast.success('Preferências salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar preferências');
    }
  };

  const excluirConta = async () => {
    try {
      await configuracaoService.excluirConta();
      toast.success('Conta excluída com sucesso!');
      // Redirecionar para login ou página inicial
    } catch (error) {
      toast.error('Erro ao excluir conta');
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'preferencias', label: 'Preferências', icon: Bell }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

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

      {/* Aba Perfil */}
      {activeTab === 'perfil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card do Avatar */}
          <div className="card">
            <div className="card-content text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{user?.nome}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user?.cidade || 'Cidade não informada'}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-1" />
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Perfil */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Informações Pessoais</h3>
              </div>
              <div className="card-content">
                <form onSubmit={handleSubmitPerfil(atualizarPerfil)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        {...registerPerfil('nome', { required: 'Nome é obrigatório' })}
                        className="input"
                        placeholder="Seu nome completo"
                      />
                      {errorsPerfil.nome && (
                        <p className="text-red-500 text-sm mt-1">{errorsPerfil.nome.message || 'Erro de validação'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        {...registerPerfil('email', { 
                          required: 'Email é obrigatório',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                        className="input"
                        placeholder="seu@email.com"
                      />
                      {errorsPerfil.email && (
                        <p className="text-red-500 text-sm mt-1">{errorsPerfil.email.message || 'Erro de validação'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="text"
                        {...registerPerfil('telefone')}
                        className="input"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <select {...registerPerfil('pais')} className="input">
                        <option value="">Selecione o país</option>
                        {paises.map((pais) => (
                          <option key={pais.id} value={pais.id}>
                            {pais.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        {...registerPerfil('cidade')}
                        className="input"
                        placeholder="Sua cidade"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...registerPerfil('bio')}
                      className="input"
                      rows="4"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aba Segurança */}
      {activeTab === 'seguranca' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Segurança da Conta</h3>
            </div>
            <div className="card-content space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Alterar Senha</h4>
                  <p className="text-sm text-gray-500">Mantenha sua conta segura com uma senha forte</p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Alterar Senha
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores</h4>
                  <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                </div>
                <button className="btn btn-outline">
                  Configurar 2FA
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Sessões Ativas</h4>
                  <p className="text-sm text-gray-500">Gerencie dispositivos conectados à sua conta</p>
                </div>
                <button className="btn btn-outline">
                  Ver Sessões
                </button>
              </div>
            </div>
          </div>

          <div className="card border-red-200">
            <div className="card-header">
              <h3 className="card-title text-red-600">Zona de Perigo</h3>
            </div>
            <div className="card-content">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="text-sm font-medium text-red-900">Excluir Conta</h4>
                  <p className="text-sm text-red-600">Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aba Preferências */}
      {activeTab === 'preferencias' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Preferências</h3>
          </div>
          <div className="card-content space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
                  <p className="text-sm text-gray-500">Receber atualizações importantes por email</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notificações Push</h4>
                  <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Relatórios Semanais</h4>
                  <p className="text-sm text-gray-500">Receber resumo semanal das suas atividades</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Modo Escuro</h4>
                  <p className="text-sm text-gray-500">Usar tema escuro na interface</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Compartilhamento de Dados</h4>
                  <p className="text-sm text-gray-500">Permitir uso de dados para melhorar o serviço</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <form onSubmit={handleSubmitPreferencias(salvarPreferencias)}>
              <div className="pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Idioma</h4>
                <select {...registerPreferencias('idioma')} className="input max-w-xs">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div className="pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Fuso Horário</h4>
                <select {...registerPreferencias('timezone')} className="input max-w-xs">
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

              <div className="flex justify-end pt-6">
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar Preferências
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Alterar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
            
            <form onSubmit={handleSubmitSenha(alterarSenha)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha Atual *
                </label>
                <input
                  type="password"
                  {...registerSenha('senha_atual', { required: 'Senha atual é obrigatória' })}
                  className="input"
                  placeholder="Digite sua senha atual"
                />
                {errorsSenha.senha_atual && (
                  <p className="text-red-500 text-sm mt-1">{errorsSenha.senha_atual.message || 'Erro de validação'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  {...registerSenha('nova_senha', { 
                    required: 'Nova senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  className="input"
                  placeholder="Digite a nova senha"
                />
                {errorsSenha.nova_senha && (
                  <p className="text-red-500 text-sm mt-1">{errorsSenha.nova_senha.message || 'Erro de validação'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  {...registerSenha('confirmar_senha', { required: 'Confirmação é obrigatória' })}
                  className="input"
                  placeholder="Confirme a nova senha"
                />
                {errorsSenha.confirmar_senha && (
                  <p className="text-red-500 text-sm mt-1">{errorsSenha.confirmar_senha.message || 'Erro de validação'}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    resetSenha();
                  }}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Alterar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão permanentemente removidos.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button
                onClick={excluirConta}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Excluir Conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const SecretPasswordMigration = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleMigration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/secret-password-migration', {
        email,
        old_password: password
      });

      setResult({
        success: true,
        message: response.data.message,
        email: response.data.email
      });

      // Atualiza a lista de status
      loadPasswordStatus();
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Erro ao migrar senha',
        email
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPasswordStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await api.get('/secret-password-status');
      setPasswordStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status das senhas:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    loadPasswordStatus();
  }, []);

  const oldFormatUsers = passwordStatus.filter(user => user.has_old_format);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔐 Migração Secreta de Senhas
            </h1>
            <p className="text-gray-600">
              Esta página permite converter senhas do formato antigo para bcrypt.
            </p>
          </div>

          {/* Status das Senhas */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Status das Senhas
            </h2>
            
            {statusLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando...</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-100 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800">Formato Bcrypt</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {passwordStatus.filter(u => !u.has_old_format).length}
                    </p>
                    <p className="text-sm text-green-700">usuários migrados</p>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800">Formato Antigo</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {oldFormatUsers.length}
                    </p>
                    <p className="text-sm text-yellow-700">usuários pendentes</p>
                  </div>
                </div>

                {oldFormatUsers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Usuários com formato antigo:
                    </h4>
                    <div className="space-y-2">
                      {oldFormatUsers.map((user, index) => (
                        <div key={index} className="bg-white rounded border p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{user.email}</span>
                            <span className="text-xs text-gray-500 font-mono">
                              {user.senha_hash_preview}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulário de Migração */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Migração Manual
            </h2>
            
            <form onSubmit={handleMigration} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email do Usuário
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha Atual (texto plano)
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite a senha atual"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Migrando...
                  </div>
                ) : (
                  'Migrar Senha'
                )}
              </button>
            </form>

            {/* Resultado */}
            {result && (
              <div className={`mt-4 p-4 rounded-md ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {result.success ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.success ? 'Sucesso!' : 'Erro'}
                    </h3>
                    <div className={`mt-2 text-sm ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      <p>{result.message}</p>
                      {result.email && (
                        <p className="mt-1">
                          <strong>Email:</strong> {result.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informações Importantes */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              ℹ️ Informações Importantes
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• A migração automática ocorre durante o login normal</li>
              <li>• Esta página é para casos onde a migração automática falha</li>
              <li>• Senhas migradas ficam mais seguras com bcrypt</li>
              <li>• O processo é irreversível</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretPasswordMigration;
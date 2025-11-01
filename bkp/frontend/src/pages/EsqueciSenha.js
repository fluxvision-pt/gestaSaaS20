import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Car, Mail, ArrowLeft } from 'lucide-react';

const EsqueciSenha = () => {
  const [emailEnviado, setEmailEnviado] = useState(false);
  const { forgotPassword, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  // Função para extrair mensagem de erro de forma segura
  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error.message === 'string') return error.message;
    if (typeof error === 'string') return error;
    return 'Erro de validação';
  };

  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email);
    if (result.success) {
      setEmailEnviado(true);
    }
  };

  if (emailEnviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <Car className="h-12 w-12 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">gestaSaaS</h1>
                  <p className="text-sm text-slate-600">Gestão Inteligente</p>
                </div>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
              Email enviado!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-slate-200">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Se o email estiver cadastrado em nosso sistema, você receberá as instruções em breve.
              </p>
              <Link
                to="/login"
                className="btn btn-primary w-full"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Car className="h-12 w-12 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">gestaSaaS</h1>
                <p className="text-sm text-slate-600">Gestão Inteligente</p>
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Esqueceu sua senha?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Digite seu email e enviaremos instruções para redefinir sua senha.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  type="email"
                  className="input pl-10"
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage(errors.email)}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  'Enviar instruções'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar ao login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;
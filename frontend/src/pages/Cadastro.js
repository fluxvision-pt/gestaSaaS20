import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Car, Mail, Lock, User, Phone } from 'lucide-react';


const Cadastro = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const senha = watch('senha');

  // Função para extrair mensagem de erro de forma segura
  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error.message === 'string') return error.message;
    if (typeof error === 'string') return error;
    return 'Erro de validação';
  };



  const onSubmit = async (data) => {
    const { confirmarSenha, ...userData } = data;
    const result = await registerUser(userData);
    if (result.success) {
      navigate('/login');
    }
  };

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
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-slate-600">       Ou{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              faça login em sua conta existente
            </Link>
          </p>
        </div>



        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-slate-700">
                Nome completo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('nome', {
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres'
                    }
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Seu nome completo"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage(errors.nome)}</p>
              )}
            </div>

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
              <label htmlFor="telefone" className="block text-sm font-medium text-slate-700">
                Telefone
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('telefone', {
                    required: 'Telefone é obrigatório',
                    pattern: {
                      value: /^\+[1-9]\d{1,14}$/,
                      message: 'Telefone deve começar com + seguido do código do país (ex: +351987654321)'
                    }
                  })}
                  type="tel"
                  className="input pl-10"
                  placeholder="+5500000000000"
                />
              </div>
              {errors.telefone && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage(errors.telefone)}</p>
              )}
            </div>



            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('senha', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage(errors.senha)}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-slate-700">
                Confirmar senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('confirmarSenha', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: value =>
                      value === senha || 'As senhas não coincidem'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              {errors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-600">{getErrorMessage(errors.confirmarSenha)}</p>
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
                    Criando conta...
                  </div>
                ) : (
                  'Criar conta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;

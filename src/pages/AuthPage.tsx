import { useState } from 'react';
import { signIn, signUp } from '../services/authService';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName, companyName);
        setMessage('Cadastro criado. Faça login para continuar.');
        setMode('login');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
      <form
        onSubmit={handleSubmit}
        className='card w-full max-w-md space-y-4 p-8'
      >
        <h1 className='text-2xl font-bold text-slate-800'>
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>

        {mode === 'signup' && (
          <>
            <input
              className='input w-full'
              type='text'
              placeholder='Nome completo'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              className='input w-full'
              type='text'
              placeholder='Nome da empresa'
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </>
        )}

        <input
          className='input w-full'
          type='email'
          placeholder='E-mail'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className='input w-full'
          type='password'
          placeholder='Senha'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        {message && (
          <div className='rounded bg-slate-100 p-2 text-sm text-slate-700'>
            {message}
          </div>
        )}

        <button
          type='submit'
          className='btn-primary w-full'
          disabled={loading}
        >
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>

        <button
          type='button'
          className='btn-secondary w-full'
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
        </button>
      </form>
    </div>
  );
}

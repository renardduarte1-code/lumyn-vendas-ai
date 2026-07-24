import { useState } from 'react';
import { Sparkles } from 'lucide-react';
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
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-surface-400 p-4'>
      <div className='w-full max-w-md space-y-6 rounded-2xl border border-surface-border bg-surface-card/70 p-8 shadow-card backdrop-blur'>
        <div className='mb-6 flex items-center justify-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-lumyn-500 to-lumyn-700'>
            <Sparkles size={20} className='text-white' />
          </div>
          <div className='text-left'>
            <div className='text-sm font-bold text-white'>LUMYN</div>
            <div className='text-[0.7rem] tracking-[0.08em] text-lumyn-300'>VENDAS AI</div>
          </div>
        </div>

        <h1 className='text-center text-2xl font-bold text-white'>
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>

        {message && (
          <div className='rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-400'>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {mode === 'signup' && (
            <>
              <input
                className='input'
                type='text'
                placeholder='Nome completo'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <input
                className='input'
                type='text'
                placeholder='Nome da empresa'
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </>
          )}
          <input
            className='input'
            type='email'
            placeholder='E-mail'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className='input'
            type='password'
            placeholder='Senha'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type='submit' className='btn-primary w-full' disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p className='text-center text-sm text-slate-500'>
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
          <button
            type='button'
            className='text-lumyn-300 hover:underline'
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}

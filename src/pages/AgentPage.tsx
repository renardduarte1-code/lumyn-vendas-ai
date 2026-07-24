import { useState } from 'react';
import { Bot } from 'lucide-react';
import { planAgentAction } from '../services/agentService';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import type { AgentPlan } from '../types';

export function AgentPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AgentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    setError(null);
    try {
      const plan = await planAgentAction(prompt);
      setResult(plan);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Erro no agente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-white'>Agente de prospecção</h2>

      <form onSubmit={handleSubmit} className='card space-y-4 p-5'>
        <textarea
          className='input w-full resize-none'
          rows={4}
          placeholder='Ex: Encontre 20 clínicas de estética em Brasília com WhatsApp'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
        <button type='submit' className='btn-primary' disabled={loading}>
          {loading ? 'Planejando...' : 'Planejar ação'}
        </button>
      </form>

      {error && (
        <div className='card border-red-400/30 p-4 text-sm text-red-400'>
          {error}
        </div>
      )}

      {result && (
        <div className='card space-y-4 p-5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-lumyn-500/15 text-lumyn-300'>
              <Bot size={18} />
            </div>
            <div>
              <p className='font-semibold text-white'>Plano de ação</p>
              <p className='text-xs text-slate-500'>Confiança: {Math.round(result.parsed.confidence * 100)}%</p>
            </div>
          </div>

          <AIInsightBox text={result.response} priority='medium' />

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='rounded-xl border border-surface-border bg-surface-200/40 p-3'>
              <p className='text-xs text-slate-500'>Créditos estimados</p>
              <p className='text-lg font-semibold text-slate-200'>{result.estimatedCredits}</p>
            </div>
            <div className='rounded-xl border border-surface-border bg-surface-200/40 p-3'>
              <p className='text-xs text-slate-500'>Requer confirmação</p>
              <p className='text-lg font-semibold text-slate-200'>{result.requiresConfirmation ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

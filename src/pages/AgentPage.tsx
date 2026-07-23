import { useState } from 'react';
import { planAgentAction } from '../services/agentService';
import type { AgentPlan } from '../types';

export function AgentPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AgentPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    try {
      const plan = await planAgentAction(prompt);
      setResult(plan);
    } catch (err) {
      setResult(null);
      alert(err instanceof Error ? err.message : 'Erro no agente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Agente de prospecção</h2>

      <form onSubmit={handleSubmit} className='card space-y-3 p-4'>
        <textarea
          className='input w-full'
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

      {result && (
        <div className='card space-y-2 p-4'>
          <p className='text-slate-800'>{result.response}</p>
          <p className='text-sm text-slate-500'>
            Créditos estimados: {result.estimatedCredits}
          </p>
          <p className='text-sm text-slate-500'>
            Confiança: {Math.round(result.parsed.confidence * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}

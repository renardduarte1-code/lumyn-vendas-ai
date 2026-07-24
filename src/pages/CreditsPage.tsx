import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { estimateCredits } from '../lib/credits';
import type { CreditEstimate } from '../types';

export function CreditsPage() {
  const [estimate, setEstimate] = useState<CreditEstimate | null>(null);

  const handleEstimate = () => {
    setEstimate(estimateCredits('search_company_basic', 20));
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-white'>Estimativa de créditos</h2>

      <div
        className='flex items-start gap-3 rounded-xl p-4 text-sm text-slate-300'
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
      >
        <AlertTriangle size={18} className='mt-0.5 text-amber-400' />
        <div>
          <p className='font-semibold text-amber-400'>Valores calculados localmente</p>
          <p className='mt-1'>
            Não existe ainda endpoint de saldo, consumo ou movimentação de créditos. Os valores abaixo
            são estimativas baseadas na tabela de custos fixos do frontend e não representam saldo
            oficial ou transações reais.
          </p>
        </div>
      </div>

      <div className='card p-5'>
        <h3 className='mb-2 font-semibold text-white'>Base de cálculo</h3>
        <ul className='list-inside list-disc space-y-1 text-sm text-slate-400'>
          <li>Busca básica de empresa: 1 crédito/unidade</li>
          <li>Enriquecimento de telefone/e-mail: 2 créditos/unidade</li>
          <li>Verificação de e-mail: 1 crédito/unidade</li>
          <li>Geração de copy: 1 crédito/unidade</li>
          <li>Export CSV: 0 crédito/unidade</li>
        </ul>

        <button className='btn-secondary mt-4' onClick={handleEstimate}>
          Estimar busca de 20 empresas
        </button>

        {estimate && (
          <div className='mt-4 space-y-2 rounded-xl border border-surface-border bg-surface-200/40 p-4 text-sm text-slate-300'>
            <p>{estimate.explanation}</p>
            <p>Créditos estimados: {estimate.estimatedCredits}</p>
            <p>Confirmação necessária: {estimate.requiresConfirmation ? 'Sim' : 'Não'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

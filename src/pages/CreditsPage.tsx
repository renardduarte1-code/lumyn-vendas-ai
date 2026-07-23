import { useState } from 'react';
import { useAuthStore } from '../state/authStore';
import { estimateCredits } from '../lib/credits';
import type { CreditEstimate } from '../types';

export function CreditsPage() {
  const { tenant } = useAuthStore();
  const [estimate, setEstimate] = useState<CreditEstimate | null>(null);

  const handleEstimate = () => {
    setEstimate(estimateCredits('search_company_basic', 20));
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Créditos</h2>

      <div className='card p-4'>
        <p className='text-sm text-slate-500'>Saldo atual</p>
        <p className='text-3xl font-bold'>{tenant?.creditsBalance ?? 0}</p>
      </div>

      <div className='card p-4'>
        <button className='btn-secondary' onClick={handleEstimate}>
          Estimar busca de 20 empresas
        </button>
        {estimate && (
          <div className='mt-4 text-sm text-slate-600'>
            <p>{estimate.explanation}</p>
            <p>Confirmação necessária: {estimate.requiresConfirmation ? 'Sim' : 'Não'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Building2, Coins, ListChecks, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../state/authStore';
import { listCompanies } from '../services/companyService';
import { listLeadLists } from '../services/listService';
import { MetricCard } from '../components/ui/MetricCard';
import { SimpleBarChart } from '../components/ui/SimpleBarChart';
import type { Company, LeadList } from '../types';

function industryDistribution(companies: Company[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const company of companies) {
    const key = company.industry?.trim() || 'Sem segmento';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }));
}

export function DashboardPage() {
  const { user, tenant } = useAuthStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [lists, setLists] = useState<LeadList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [companiesData, listsData] = await Promise.all([listCompanies(), listLeadLists()]);
        if (!cancelled) {
          setCompanies(companiesData);
          setLists(listsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const distribution = industryDistribution(companies);

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-white'>
        Olá, {user?.fullName || user?.email}
      </h2>

      {error && (
        <div className='card border-red-400/30 p-4 text-sm text-red-400'>
          Não foi possível carregar os dados: {error}
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <MetricCard
          label='Créditos disponíveis'
          value={tenant?.creditsBalance ?? 0}
          icon={<Coins size={18} />}
          highlight
        />
        <MetricCard
          label='Plano'
          value={tenant?.plan || '-'}
          icon={<ShieldCheck size={18} />}
          iconColor='#34d399'
          subtitle={tenant?.name}
        />
        <MetricCard
          label='Empresas na base'
          value={loading ? '…' : companies.length}
          icon={<Building2 size={18} />}
          iconColor='#8a7bfd'
        />
        <MetricCard
          label='Listas de leads'
          value={loading ? '…' : lists.length}
          icon={<ListChecks size={18} />}
          iconColor='#f59e0b'
        />
      </div>

      {!loading && !error && distribution.length > 0 && (
        <div className='card p-5'>
          <h3 className='mb-4 font-semibold text-white'>Empresas por segmento</h3>
          <SimpleBarChart data={distribution} height={140} />
        </div>
      )}

      {!loading && !error && companies.length === 0 && (
        <div className='card p-5 text-sm text-slate-400'>
          Nenhuma empresa cadastrada ainda. Cadastre empresas na aba Empresas ou use o Agente IA
          para planejar uma prospecção.
        </div>
      )}
    </div>
  );
}

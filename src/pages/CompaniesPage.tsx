import { useEffect, useState } from 'react';
import { listCompanies, createCompany } from '../services/companyService';
import { ScoreBadge, StatusBadge } from '../components/ui/StatusBadge';
import type { Company } from '../types';

const emptyForm: Partial<Company> = {
  name: '',
  legalName: '',
  cnpj: '',
  website: '',
  phone: '',
  whatsapp: '',
  email: '',
  instagram: '',
  linkedin: '',
  city: '',
  state: '',
  industry: '',
  keywords: [],
  employeeCountEstimate: undefined,
};

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<Partial<Company>>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCompanies({ segment: form.industry || undefined, city: form.city || undefined });
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    try {
      await createCompany({ ...form, source: 'manual' });
      setForm(emptyForm);
      await fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-white'>Empresas</h2>
        {companies.length > 0 && (
          <span className='text-sm text-slate-500'>{companies.length} cadastradas</span>
        )}
      </div>

      <form onSubmit={handleCreate} className='card space-y-4 p-5'>
        <h3 className='font-semibold text-white'>Nova empresa</h3>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <input
            className='input'
            placeholder='Nome *'
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className='input'
            placeholder='Razão social'
            value={form.legalName || ''}
            onChange={(e) => setForm({ ...form, legalName: e.target.value })}
          />
          <input
            className='input'
            placeholder='CNPJ'
            value={form.cnpj || ''}
            onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
          />
          <input
            className='input'
            placeholder='Site'
            value={form.website || ''}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          <input
            className='input'
            placeholder='Telefone'
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className='input'
            placeholder='WhatsApp'
            value={form.whatsapp || ''}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
          <input
            className='input'
            placeholder='E-mail'
            type='email'
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className='input'
            placeholder='Instagram'
            value={form.instagram || ''}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          />
          <input
            className='input'
            placeholder='LinkedIn'
            value={form.linkedin || ''}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
          />
          <input
            className='input'
            placeholder='Cidade'
            value={form.city || ''}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className='input'
            placeholder='Estado'
            value={form.state || ''}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <input
            className='input'
            placeholder='Indústria / Segmento'
            value={form.industry || ''}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          />
        </div>
        <button type='submit' className='btn-primary' disabled={loading}>
          {loading ? 'Salvando...' : 'Cadastrar empresa'}
        </button>
      </form>

      {error && (
        <div className='card border-red-400/30 p-4 text-sm text-red-400'>
          {error}
        </div>
      )}

      {loading ? (
        <p className='text-slate-500'>Carregando...</p>
      ) : companies.length === 0 ? (
        <div className='card p-5 text-sm text-slate-400'>
          Nenhuma empresa encontrada. Cadastre a primeira acima ou use filtros diferentes.
        </div>
      ) : (
        <div className='card overflow-hidden'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-surface-200/60'>
              <tr>
                <th className='p-3 font-semibold text-slate-300'>Nome</th>
                <th className='p-3 font-semibold text-slate-300'>Cidade</th>
                <th className='p-3 font-semibold text-slate-300'>Indústria</th>
                <th className='p-3 font-semibold text-slate-300'>Score</th>
                <th className='p-3 font-semibold text-slate-300'>Qualidade</th>
                <th className='p-3 font-semibold text-slate-300'>WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className='border-t border-surface-border hover:bg-surface-hover/40'>
                  <td className='p-3 font-medium text-slate-200'>{company.name}</td>
                  <td className='p-3 text-slate-400'>{company.city || '-'}</td>
                  <td className='p-3 text-slate-400'>{company.industry || '-'}</td>
                  <td className='p-3'><ScoreBadge score={company.leadScore} /></td>
                  <td className='p-3'><StatusBadge status={company.dataQualityStatus} /></td>
                  <td className='p-3 text-slate-400'>{company.whatsapp || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

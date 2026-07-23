import { useEffect, useState } from 'react';
import { listCompanies, createCompany } from '../services/companyService';
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

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await listCompanies({ segment: form.industry || undefined, city: form.city || undefined });
      setCompanies(data);
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
    await createCompany({ ...form, source: 'manual' });
    setForm(emptyForm);
    await fetchCompanies();
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Empresas</h2>

      <form onSubmit={handleCreate} className='card space-y-3 p-4'>
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

      {loading ? (
        <p className='text-slate-500'>Carregando...</p>
      ) : (
        <table className='w-full text-left text-sm'>
          <thead className='bg-slate-100'>
            <tr>
              <th className='p-2'>Nome</th>
              <th className='p-2'>Cidade</th>
              <th className='p-2'>Indústria</th>
              <th className='p-2'>Score</th>
              <th className='p-2'>WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className='border-b'>
                <td className='p-2'>{company.name}</td>
                <td className='p-2'>{company.city}</td>
                <td className='p-2'>{company.industry}</td>
                <td className='p-2'>{company.leadScore}</td>
                <td className='p-2'>{company.whatsapp || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

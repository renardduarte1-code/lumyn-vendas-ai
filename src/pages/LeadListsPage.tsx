import { useEffect, useState } from 'react';
import { Calendar, List } from 'lucide-react';
import { listLeadLists, createLeadList } from '../services/listService';
import type { LeadList } from '../types';

export function LeadListsPage() {
  const [lists, setLists] = useState<LeadList[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listLeadLists();
      setLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar listas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await createLeadList({ name, description, type: 'manual' });
      setName('');
      setDescription('');
      await fetchLists();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lista');
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-white'>Listas de leads</h2>

      <form onSubmit={handleSubmit} className='card space-y-4 p-5'>
        <h3 className='font-semibold text-white'>Nova lista</h3>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
          <input
            className='input'
            placeholder='Nome da lista *'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className='input'
            placeholder='Descrição'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type='submit' className='btn-primary self-start md:self-auto' disabled={loading}>
            {loading ? 'Salvando...' : 'Criar lista'}
          </button>
        </div>
      </form>

      {error && (
        <div className='card border-red-400/30 p-4 text-sm text-red-400'>
          {error}
        </div>
      )}

      {loading ? (
        <p className='text-slate-500'>Carregando...</p>
      ) : lists.length === 0 ? (
        <div className='card p-5 text-sm text-slate-400'>
          Nenhuma lista criada ainda. Crie a primeira acima.
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
          {lists.map((list) => (
            <div key={list.id} className='card flex flex-col justify-between p-4'>
              <div className='mb-3 flex items-start justify-between'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-lumyn-500/15 text-lumyn-300'>
                  <List size={16} />
                </div>
                <span className='badge' style={{ color: '#a89bfd', background: 'rgba(168,155,253,0.1)', border: '1px solid rgba(168,155,253,0.25)' }}>
                  {list.type}
                </span>
              </div>
              <p className='font-semibold text-slate-100'>{list.name}</p>
              {list.description && (
                <p className='mt-1 text-sm text-slate-500'>{list.description}</p>
              )}
              <div className='mt-3 flex items-center gap-1 text-xs text-slate-500'>
                <Calendar size={12} />
                {new Date(list.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

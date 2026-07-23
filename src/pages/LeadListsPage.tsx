import { useEffect, useState } from 'react';
import { listLeadLists, createLeadList } from '../services/listService';
import type { LeadList } from '../types';

export function LeadListsPage() {
  const [lists, setLists] = useState<LeadList[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const data = await listLeadLists();
      setLists(data);
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
    await createLeadList({ name, description, type: 'manual' });
    setName('');
    setDescription('');
    await fetchLists();
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Listas de leads</h2>

      <form onSubmit={handleSubmit} className='card space-y-3 p-4'>
        <input
          className='input w-full md:w-1/3'
          placeholder='Nome da lista'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className='input w-full md:w-1/3'
          placeholder='Descrição'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type='submit' className='btn-primary' disabled={loading}>
          {loading ? 'Salvando...' : 'Criar lista'}
        </button>
      </form>

      {loading ? (
        <p className='text-slate-500'>Carregando...</p>
      ) : (
        <ul className='space-y-2'>
          {lists.map((list) => (
            <li key={list.id} className='card flex justify-between p-3'>
              <span className='font-medium'>{list.name}</span>
              <span className='text-xs text-slate-500'>
                {new Date(list.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

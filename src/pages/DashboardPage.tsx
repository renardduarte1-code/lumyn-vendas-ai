import { useAuthStore } from '../state/authStore';

export function DashboardPage() {
  const { user, tenant } = useAuthStore();

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>
        Olá, {user?.fullName || user?.email}
      </h2>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div className='card p-4'>
          <p className='text-sm text-slate-500'>Créditos disponíveis</p>
          <p className='text-2xl font-bold'>{tenant?.creditsBalance ?? 0}</p>
        </div>
        <div className='card p-4'>
          <p className='text-sm text-slate-500'>Plano</p>
          <p className='text-2xl font-bold'>{tenant?.plan || '-'}</p>
        </div>
        <div className='card p-4'>
          <p className='text-sm text-slate-500'>Tenant</p>
          <p className='text-2xl font-bold'>{tenant?.name || '-'}</p>
        </div>
        <div className='card p-4'>
          <p className='text-sm text-slate-500'>Permissão</p>
          <p className='text-2xl font-bold'>{user?.role || '-'}</p>
        </div>
      </div>

      <div className='card p-4'>
        <h3 className='mb-2 font-semibold'>Status da migração</h3>
        <ul className='list-inside list-disc space-y-1 text-sm text-slate-600'>
          <li>Banco PostgreSQL próprio com multitenancy.</li>
          <li>Backend Fastify + Prisma + autenticação JWT.</li>
          <li>Frontend comunica apenas via API HTTP.</li>
          <li>Sem dependências ativas do Supabase.</li>
        </ul>
      </div>
    </div>
  );
}

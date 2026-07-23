import { useAuthStore } from '../state/authStore';

export function SettingsPage() {
  const { user, tenant, signOut } = useAuthStore();

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Configurações</h2>

      <div className='card space-y-2 p-4'>
        <p className='text-sm text-slate-500'>Usuário</p>
        <p className='font-medium'>{user?.email}</p>
        <p className='text-sm text-slate-500'>Empresa</p>
        <p className='font-medium'>{tenant?.name}</p>
        <p className='text-sm text-slate-500'>Plano</p>
        <p className='font-medium'>{tenant?.plan}</p>
      </div>

      <button
        className='btn-secondary'
        onClick={() => signOut()}
      >
        Sair
      </button>
    </div>
  );
}

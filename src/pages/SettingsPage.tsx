import { useAuthStore } from '../state/authStore';

export function SettingsPage() {
  const { user, tenant, signOut } = useAuthStore();

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold text-white'>Configurações</h2>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='card space-y-4 p-5'>
          <h3 className='font-semibold text-white'>Conta</h3>
          <div>
            <p className='label'>Usuário</p>
            <p className='font-medium text-slate-200'>{user?.email}</p>
          </div>
          <div>
            <p className='label'>Nome</p>
            <p className='font-medium text-slate-200'>{user?.fullName || '-'}</p>
          </div>
          <div>
            <p className='label'>Função</p>
            <p className='font-medium text-slate-200'>{user?.role}</p>
          </div>
        </div>

        <div className='card space-y-4 p-5'>
          <h3 className='font-semibold text-white'>Empresa</h3>
          <div>
            <p className='label'>Nome</p>
            <p className='font-medium text-slate-200'>{tenant?.name}</p>
          </div>
          <div>
            <p className='label'>Plano</p>
            <p className='font-medium text-slate-200'>{tenant?.plan}</p>
          </div>
          <div>
            <p className='label'>Créditos</p>
            <p className='font-medium text-slate-200'>{tenant?.creditsBalance}</p>
          </div>
        </div>
      </div>

      <button className='btn-secondary' onClick={() => signOut()}>
        Sair
      </button>
    </div>
  );
}

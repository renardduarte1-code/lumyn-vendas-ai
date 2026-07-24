import { useState } from 'react';
import {
  Bot,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { PageKey } from '../state/navigationStore';
import { useNavigationStore } from '../state/navigationStore';
import { useAuthStore } from '../state/authStore';

const navItems: Array<{ key: PageKey; label: string; icon: LucideIcon }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'agent', label: 'Agente IA', icon: Bot },
  { key: 'companies', label: 'Empresas', icon: Building2 },
  { key: 'lists', label: 'Listas', icon: ListChecks },
  { key: 'settings', label: 'Configurações', icon: Settings },
];

const pageTitles: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral da operação de prospecção' },
  agent: { title: 'Agente IA', subtitle: 'Planejamento de prospecção com inteligência artificial' },
  companies: { title: 'Empresas', subtitle: 'Base de leads e qualificação' },
  lists: { title: 'Listas de leads', subtitle: 'Organização e segmentação da base' },
  settings: { title: 'Configurações', subtitle: 'Conta, empresa e sessão' },
};

export function Layout({ children }: { children: ReactNode }) {
  const { page, setPage } = useNavigationStore();
  const { user, tenant } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const pageInfo = pageTitles[page];
  const initial = (user?.fullName || user?.email || '?').charAt(0).toUpperCase();

  return (
    <div className='flex h-screen overflow-hidden bg-surface-400 text-slate-200'>
      <aside
        className={`sticky top-0 z-20 flex h-screen flex-col border-r border-surface-border bg-surface-300/95 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className='flex items-center justify-between border-b border-surface-border px-4 py-5'>
          {!collapsed ? (
            <div className='flex items-center gap-2.5'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-lumyn-500 to-lumyn-700'>
                <Sparkles size={16} className='text-white' />
              </div>
              <div>
                <div className='text-sm font-bold leading-tight text-white'>LUMYN</div>
                <div className='text-[0.65rem] leading-tight tracking-[0.08em] text-lumyn-300'>VENDAS AI</div>
              </div>
            </div>
          ) : (
            <div className='mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-lumyn-500 to-lumyn-700'>
              <Sparkles size={16} className='text-white' />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className='ml-1 flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-all hover:bg-surface-hover hover:text-slate-300'
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className='flex-1 space-y-0.5 overflow-y-auto px-2 py-3'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={17} className={isActive ? 'text-lumyn-300' : 'text-slate-500'} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!collapsed && tenant && (
          <div className='border-t border-surface-border px-3 py-4'>
            <div className='glass-card rounded-lg p-3'>
              <p className='text-xs font-semibold text-lumyn-300'>{tenant.name}</p>
              <p className='mt-1 text-xs text-slate-500'>
                {tenant.creditsBalance} créditos · plano {tenant.plan}
              </p>
            </div>
          </div>
        )}
      </aside>

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <header className='sticky top-0 z-10 flex items-center justify-between border-b border-surface-border bg-surface-300/95 px-6 py-4 backdrop-blur'>
          <div>
            <h1 className='text-lg font-bold text-white'>{pageInfo.title}</h1>
            <p className='mt-0.5 text-xs text-slate-500'>{pageInfo.subtitle}</p>
          </div>

          <div className='flex items-center gap-2 rounded-lg border border-surface-border bg-surface-card/50 px-3 py-1.5'>
            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-lumyn-500 to-lumyn-700 text-xs font-bold text-white'>
              {initial}
            </div>
            <span className='hidden text-sm text-slate-300 md:block'>
              {user?.fullName || user?.email}
            </span>
          </div>
        </header>

        <main className='flex-1 overflow-y-auto px-8 py-8'>
          <div className='mx-auto max-w-7xl animate-fade-in'>{children}</div>
        </main>
      </div>
    </div>
  );
}

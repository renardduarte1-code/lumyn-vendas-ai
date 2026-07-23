import { BarChart3, Bot, Building2, Coins, Home, ListChecks, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import type { PageKey } from '../state/navigationStore';
import { useNavigationStore } from '../state/navigationStore';

const items: Array<{ key: PageKey; label: string; icon: ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
  { key: 'agent', label: 'Agente IA', icon: <Bot size={18} /> },
  { key: 'companies', label: 'Empresas', icon: <Building2 size={18} /> },
  { key: 'lists', label: 'Listas', icon: <ListChecks size={18} /> },
  { key: 'credits', label: 'Créditos', icon: <Coins size={18} /> },
  { key: 'settings', label: 'Configurações', icon: <Settings size={18} /> },
];

export function Layout({ children }: { children: ReactNode }) {
  const { page, setPage } = useNavigationStore();

  return (
    <div className="min-h-screen bg-lumyn-50 text-slate-950">
      <aside className="fixed left-0 top-0 z-20 h-screen w-72 border-r border-slate-200 bg-white px-5 py-6">
        <div className="mb-8">
          <div className="text-xs font-semibold uppercase tracking-[0.35em] text-lumyn-700">Lumyn</div>
          <h1 className="mt-2 text-2xl font-bold">Prospect AI</h1>
          <p className="mt-1 text-sm text-slate-500">Lead intelligence com IA.</p>
        </div>

        <nav className="space-y-2">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                page === item.key
                  ? 'bg-lumyn-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="ml-72 min-h-screen px-8 py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

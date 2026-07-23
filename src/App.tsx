import { useEffect } from 'react';
import { useAuthStore } from './state/authStore';
import { useNavigationStore } from './state/navigationStore';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { LeadListsPage } from './pages/LeadListsPage';
import { AgentPage } from './pages/AgentPage';
import { CreditsPage } from './pages/CreditsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const { user, loading } = useAuthStore();
  const { page } = useNavigationStore();

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center text-slate-500'>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Layout>
      {page === 'dashboard' && <DashboardPage />}
      {page === 'companies' && <CompaniesPage />}
      {page === 'lists' && <LeadListsPage />}
      {page === 'agent' && <AgentPage />}
      {page === 'credits' && <CreditsPage />}
      {page === 'settings' && <SettingsPage />}
    </Layout>
  );
}

export default App;

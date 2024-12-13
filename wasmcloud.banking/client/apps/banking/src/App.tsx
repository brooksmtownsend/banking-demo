import React from 'react';
import {Navigation} from '@/layout/Navigation';
import {PageContent} from '@/layout/PageContent';
import {Sidebar} from '@/layout/Sidebar';
import {TopNav} from '@/layout/TopNav';
import {Dashboard} from '@/features/dashboard/components/Dashboard';
import {
  Notifications,
  NotificationButton,
  NotificationDropdown,
} from '@/features/notifications/components/Notifications';
import {SettingsDialog} from '@/features/settings/components/SettingsDialog';
import {useApi} from '@repo/common/services/backend/useApi';

export interface UserInformation {
  login: string;
  avatar_url: string;
  name: string;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserInformation | null>(null);
  const api = useApi();

  React.useEffect(() => {
    if (window.location.pathname === '/oauth/callback' && user === null) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      // Fetch OAuth information here
      // TODO: If error, redirect back to login page
      api
        .oauthCallback(code, state)
        .then((res) => {
          const decoded = window.atob(res.data);
          const parsed = JSON.parse(decoded) as UserInformation;
          setUser(parsed);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [api, user]);

  return (
    <div>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <Navigation />
      </Sidebar>
      <TopNav setSidebarOpen={setSidebarOpen} user={user}>
        <Notifications>
          <NotificationButton />
          <NotificationDropdown />
        </Notifications>
      </TopNav>
      <PageContent>
        <Dashboard user={user} />
        <SettingsDialog />
      </PageContent>
    </div>
  );
}

export default App;

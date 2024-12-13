import React from 'react';
import {Navigation} from '@/layout/Navigation';
import {PageContent} from '@/layout/PageContent';
import {Sidebar} from '@/layout/Sidebar';
import {TopNav} from '@/layout/TopNav';
import {Dashboard} from '@/features/dashboard/components/Dashboard';
import {DialogAccountValidation} from '@/features/dashboard/components/DialogAccountValidation';
import {
  Notifications,
  NotificationButton,
  NotificationDropdown,
} from '@/features/notifications/components/Notifications';
import {SettingsDialog} from '@/features/settings/components/SettingsDialog';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <Navigation />
      </Sidebar>
      <TopNav setSidebarOpen={setSidebarOpen}>
        <Notifications>
          <NotificationButton />
          <NotificationDropdown />
        </Notifications>
      </TopNav>
      <PageContent>
        <Dashboard />
        <DialogAccountValidation />
        <SettingsDialog />
      </PageContent>
    </div>
  );
}

export default App;

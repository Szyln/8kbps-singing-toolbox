import { useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../Header';
import Sidebar from '../Sidebar';
import Footer from '../Footer';
import { parseUserIds } from '../../utils/users';

export default function MainLayout() {
  const { userIds } = useParams<{ userIds: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Parse userIds from URL, handling cases where userIds might be undefined or empty
  const currentSelectedUserIds = userIds ? parseUserIds(userIds) : [];

  // Derive the title based on the current route
  const getTitle = (): string => {
    if (userIds) {
      return t('header.listTitle', { userIds });
    }
    if (location.pathname.startsWith('/tool/which-line')) {
      return t('header.whichLineTitle');
    }
    return t('header.homeTitle');
  };

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        title={getTitle()}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUserIds={currentSelectedUserIds} // Correctly pass parsed userIds
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}




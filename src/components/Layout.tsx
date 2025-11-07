import { memo } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

// interface LayoutProps {
//   children: ReactNode;
// }

export const Layout = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Header />
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
});

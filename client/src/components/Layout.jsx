import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <main className="lg:col-span-8">
              <Outlet />
            </main>
            <aside className="lg:col-span-4">
              <Sidebar />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}; 
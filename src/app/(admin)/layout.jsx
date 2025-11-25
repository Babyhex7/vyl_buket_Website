'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Squares2X2Icon,
  ShoppingBagIcon, 
  CubeIcon, 
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tutup sidebar saat route berubah di mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent scroll saat sidebar terbuka di mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Jangan tampilkan layout di halaman login
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
    { name: 'Manajemen Pesanan', href: '/orders', icon: ShoppingBagIcon },
    { name: 'Katalog Buket', href: '/bouquets', icon: CubeIcon },
    { name: 'Pengaturan', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        
        {/* Sidebar - Hidden di mobile, fixed di desktop */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex-shrink-0
          lg:translate-x-0 lg:static lg:shadow-sm
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Logo Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                vyl<span className="text-pink-500">.bouquet</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Admin Panel</p>
            </div>
            
            {/* Close button - Hanya tampil di mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 sm:p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 py-3 px-3 sm:px-4 rounded-lg transition-all touch-target ${
                    isActive
                      ? 'bg-pink-50 text-pink-600 font-semibold border-l-4 border-pink-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-pink-500'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button - Di bagian bawah sidebar (mobile) */}
          <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-lg transition-all touch-target"
            >
              <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Backdrop Overlay untuk mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 min-h-screen lg:ml-0 min-w-0 overflow-hidden">
          {/* Header - Sticky top */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
              
              {/* Hamburger Menu Button - Hanya tampil di mobile */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors touch-target"
                aria-label="Open sidebar"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              {/* Spacer di desktop */}
              <div className="hidden lg:block"></div>

              {/* User Info & Logout */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                
                {/* Logout Desktop */}
                <button
                  onClick={handleLogout}
                  className="hidden lg:flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                {/* User Avatar Mobile */}
                <div className="lg:hidden w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                  {(user?.username || 'A').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>
          
          {/* Page Content - Responsive padding */}
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

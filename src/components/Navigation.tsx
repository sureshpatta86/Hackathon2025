'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { Menu, X, LogOut, Home, BarChart3, LucideIcon } from 'lucide-react';

interface NavigationProps {
  variant?: 'home' | 'dashboard';
}

interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

export default function Navigation({ variant = 'home' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const isLoginPage = pathname === '/login';
  const isDashboard = pathname === '/dashboard' || variant === 'dashboard';

  // Navigation items for home page
  const homeNavItems: NavItem[] = [
    { href: '#features', label: 'Features' },
    { href: '#benefits', label: 'Benefits' },
    { href: '#about', label: 'About' },
  ];

  // Navigation items for dashboard
  const dashboardNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/', label: 'Home', icon: Home },
  ];

  const navItems = isDashboard ? dashboardNavItems : homeNavItems;

  return (
    <nav className={`${
      isDashboard ? 'bg-white shadow-sm border-b' : 'bg-white/80 backdrop-blur-md border-b border-gray-200'
    } sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo 
              size="md" 
              variant={isDashboard ? 'default' : 'default'} 
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoginPage && (
              <>
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isExternal = item.href.startsWith('#');
                  
                  if (isExternal) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                      >
                        {item.label}
                      </a>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                        pathname === item.href ? 'text-blue-600' : ''
                      }`}
                    >
                      {IconComponent && <IconComponent className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                
                {isDashboard ? (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button variant="primary" className="bg-blue-600 hover:bg-blue-700">
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}

            {/* Login page - minimal nav */}
            {isLoginPage && (
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {!isLoginPage && (
                <>
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isExternal = item.href.startsWith('#');
                    
                    if (isExternal) {
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </a>
                      );
                    }
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium ${
                          pathname === item.href ? 'text-blue-600' : ''
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  {isDashboard ? (
                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700">
                        Login
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Login page mobile nav */}
              {isLoginPage && (
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

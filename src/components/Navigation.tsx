'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { Menu, X, LogOut, ArrowLeft, LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // Debug logging
  console.log('Navigation component - Current user:', user);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isLoginPage = pathname === '/login';
  const isDashboard = pathname === '/dashboard' || variant === 'dashboard';

  // Navigation items for home page
  const homeNavItems: NavItem[] = [
    { href: '#features', label: 'Features' },
    { href: '#benefits', label: 'Benefits' },
    { href: '#about', label: 'About' },
  ];

  const navItems = isDashboard ? [] : homeNavItems;

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
                
                {isDashboard && user && (
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100 shadow-sm">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-bold text-sm">
                      Welcome, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
                    </span>
                  </div>
                )}
                
                {isDashboard ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
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
                <button className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-blue-600 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105" title="Home">
                  <ArrowLeft className="h-5 w-5" />
                </button>
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
                  
                  {isDashboard && user && (
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 shadow-sm">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 font-bold text-sm">
                        Welcome, {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
                      </span>
                    </div>
                  )}
                  
                  {isDashboard ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      title="Log out"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
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
                  <button className="w-full flex items-center justify-center py-3 bg-green-500 hover:bg-green-600 text-blue-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg" title="Home">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

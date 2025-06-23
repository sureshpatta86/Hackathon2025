'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/logo';
import { Menu, X, LogOut, ArrowLeft, LucideIcon, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';

interface NavigationProps {
  variant?: 'home' | 'dashboard' | 'admin';
}

interface NavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
}

export default function Navigation({ variant = 'home' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messagingMode, setMessagingMode] = useState<string | null>(null);
  const [hasFetchedSettings, setHasFetchedSettings] = useState(false);
  const pathname = usePathname();
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const { isAdmin } = useRole();

  const isLoginPage = pathname === '/login';
  const isDashboard = pathname === '/dashboard' || variant === 'dashboard';
  const isAdminPage = pathname === '/admin' || variant === 'admin';

  // Fetch messaging mode for dashboard/admin users
  useEffect(() => {
    const fetchMessagingMode = async () => {
      // Only fetch if user is authenticated, not loading, and on dashboard/admin pages
      // and we haven't successfully fetched yet
      if ((isDashboard || isAdminPage) && isAuthenticated && !isLoading && !hasFetchedSettings) {
        try {
          const response = await fetch('/api/settings', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            setMessagingMode(data.messagingMode);
            setHasFetchedSettings(true); // Mark as successfully fetched
          } else {
            console.warn(`Settings API returned ${response.status}: ${response.statusText}`);
            // Don't set fallback on auth errors, let user handle login
            if (response.status !== 401 && response.status !== 403) {
              setMessagingMode('demo');
              setHasFetchedSettings(true);
            }
          }
        } catch (error) {
          console.error('Error fetching messaging mode:', error);
          // Only set fallback for network errors, not auth errors
          if (error instanceof Error && !error.message?.includes('fetch')) {
            setMessagingMode('demo');
            setHasFetchedSettings(true);
          }
        }
      }
    };

    fetchMessagingMode();

    // Listen for custom settings update events
    const handleSettingsUpdate = () => {
      setHasFetchedSettings(false); // Reset flag to allow refetch
      fetchMessagingMode();
    };

    // Listen for window focus to refresh when user comes back
    const handleWindowFocus = () => {
      // Only fetch if we don't already have a valid messaging mode
      if (!hasFetchedSettings) {
        fetchMessagingMode();
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    window.addEventListener('focus', handleWindowFocus);

    // Only set up interval if we haven't fetched successfully yet
    let interval: NodeJS.Timeout | null = null;
    if (!hasFetchedSettings) {
      interval = setInterval(() => {
        if (!hasFetchedSettings) {
          fetchMessagingMode();
        }
      }, 60000); // Check every 60 seconds only if not fetched
    }

    // Cleanup
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
      window.removeEventListener('focus', handleWindowFocus);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user, isDashboard, isAdminPage, isAuthenticated, isLoading, hasFetchedSettings]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items for home page
  const homeNavItems: NavItem[] = [
    { href: '#features', label: 'Features' },
    { href: '#benefits', label: 'Benefits' },
    { href: '#about', label: 'About' },
  ];

  const navItems = (isDashboard || isAdminPage) ? [] : homeNavItems;

  return (
    <nav className={`${
      (isDashboard || isAdminPage) ? 'bg-white shadow-sm border-b' : 'bg-white/80 backdrop-blur-md border-b border-gray-200'
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
          <div className="hidden md:flex items-center space-x-4">{/* Reduced from space-x-8 to space-x-4 */}
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
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100 shadow-sm">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium text-xs hidden lg:inline">
                      {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
                    </span>
                  </div>
                )}
                
                {/* Dashboard Link - Show when on admin page */}
                {isAdminPage && user && (
                  <Link href="/dashboard">
                    <button
                      className="group relative flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-blue-400/20"
                      title="Return to Dashboard"
                    >
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                      <span className="text-sm">Dashboard</span>
                      <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </button>
                  </Link>
                )}
                
                {/* Admin Panel Link - Only for admin users, show when on dashboard */}
                {isDashboard && isAdmin && (
                  <Link href="/admin">
                    <button
                      className="group relative flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-purple-400/20"
                      title="Admin Panel"
                    >
                      <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" />
                      <span className="text-sm">Admin</span>
                      <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </button>
                  </Link>
                )}
                
                {/* Messaging Mode Indicator */}
                {(isDashboard || isAdminPage) && messagingMode && (
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm shadow-lg animate-pulse ${
                      messagingMode === 'demo' 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                    title={`Messaging Mode: ${messagingMode === 'demo' ? 'Demo' : 'Live'}`}
                  >
                    {messagingMode === 'demo' ? 'D' : 'L'}
                  </div>
                )}
                
                {(isDashboard || isAdminPage) ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-9 h-9 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="Log out"
                  >
                    <LogOut className="h-4 w-4" />
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
                  
                  {/* Dashboard Link for mobile - Show when on admin page */}
                  {isAdminPage && user && (
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <button
                        className="group relative w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-400/20"
                        title="Return to Dashboard"
                      >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Dashboard</span>
                        <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </button>
                    </Link>
                  )}
                  
                  {/* Admin Panel Link for mobile - Only for admin users, show when on dashboard */}
                  {isDashboard && isAdmin && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                      <button
                        className="group relative w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-purple-400/20"
                        title="Admin Panel"
                      >
                        <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" />
                        <span>Admin Panel</span>
                        <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </button>
                    </Link>
                  )}
                  
                  {/* Messaging Mode Indicator for mobile */}
                  {(isDashboard || isAdminPage) && messagingMode && (
                    <div className="flex items-center justify-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm shadow-lg animate-pulse ${
                          messagingMode === 'demo' 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        title={`Messaging Mode: ${messagingMode === 'demo' ? 'Demo' : 'Live'}`}
                      >
                        {messagingMode === 'demo' ? 'D' : 'L'}
                      </div>
                    </div>
                  )}
                  
                  {(isDashboard || isAdminPage) ? (
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

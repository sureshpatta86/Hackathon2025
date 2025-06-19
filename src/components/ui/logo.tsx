import React from 'react';
import { Heart, Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

export default function Logo({ 
  className = '', 
  size = 'md', 
  showText = true, 
  variant = 'default' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const colorClasses = {
    default: {
      icon: 'text-blue-600',
      text: 'text-gray-900',
      accent: 'text-green-500'
    },
    white: {
      icon: 'text-white',
      text: 'text-white',
      accent: 'text-blue-200'
    },
    dark: {
      icon: 'text-blue-500',
      text: 'text-gray-800',
      accent: 'text-green-600'
    }
  };

  const colors = colorClasses[variant];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className={`${sizeClasses[size]} relative`}>
          {/* Main heart icon */}
          <Heart 
            className={`${sizeClasses[size]} ${colors.icon} fill-current`} 
            strokeWidth={1.5}
          />
          {/* Activity pulse overlay */}
          <Activity 
            className={`absolute inset-0 ${sizeClasses[size]} ${colors.accent} opacity-60`} 
            strokeWidth={2}
          />
        </div>
        
        {/* Pulse animation dot */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 ${colors.accent.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${textSizeClasses[size]} font-bold ${colors.text}`}>
            Health<span className={colors.accent}>Comm</span>
          </span>
          {size === 'lg' && (
            <span className={`text-sm ${colors.text} opacity-60 font-medium`}>
              Healthcare Communication
            </span>
          )}
        </div>
      )}
    </div>
  );
}

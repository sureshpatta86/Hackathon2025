import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(({ 
  onClear, 
  showClearButton = true, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        ref={ref}
        type="text"
        className={`pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${className}`}
        {...props}
      />
      {showClearButton && props.value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

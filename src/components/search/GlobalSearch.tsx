'use client';

import React, { useState, useEffect } from 'react';
import { SearchInput } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { SearchResult, FilterConfig } from '@/types/search';
import { Filter, Search as SearchIcon } from 'lucide-react';

interface GlobalSearchProps {
  onSearch: (query: string, filters: FilterConfig) => Promise<SearchResult[]>;
  onFiltersToggle: () => void;
  filters: FilterConfig;
  hasActiveFilters: boolean;
}

export default function GlobalSearch({ 
  onSearch, 
  onFiltersToggle, 
  filters, 
  hasActiveFilters 
}: GlobalSearchProps) {
  const [query, setQuery] = useState(filters.searchQuery || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setQuery(filters.searchQuery || '');
  }, [filters.searchQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await onSearch(searchQuery, filters);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return '👤';
      case 'template':
        return '📄';
      case 'communication':
        return '💬';
      default:
        return '📋';
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'patient':
        return 'Patient';
      case 'template':
        return 'Template';
      case 'communication':
        return 'Communication';
      default:
        return 'Result';
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <SearchInput
            placeholder="Search patients, templates, communications..."
            value={query}
            onChange={handleInputChange}
            onClear={handleClear}
            className="w-full"
          />
          
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <SearchIcon className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{getResultIcon(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {getResultTypeLabel(result.type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {result.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button
          variant={hasActiveFilters ? 'primary' : 'outline'}
          onClick={onFiltersToggle}
          className="flex items-center space-x-2 px-3"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
              !
            </span>
          )}
        </Button>
      </div>
      
      {/* Click outside to close results */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}

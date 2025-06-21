'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SearchInput } from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { SearchResult, FilterConfig } from '@/types/search';
import { Filter, Search as SearchIcon, Clock, Zap, User, FileText, MessageSquare } from 'lucide-react';

interface GlobalSearchProps {
  onSearch: (query: string, filters: FilterConfig) => Promise<SearchResult[]>;
  onFiltersToggle: () => void;
  onResultSelect?: (result: SearchResult) => void;
  filters: FilterConfig;
  hasActiveFilters: boolean;
}

export default function GlobalSearch({ 
  onSearch, 
  onFiltersToggle, 
  onResultSelect,
  filters, 
  hasActiveFilters 
}: GlobalSearchProps) {
  const [query, setQuery] = useState(filters.searchQuery || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('healthcomm-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('healthcomm-recent-searches', JSON.stringify(updated));
  };

  useEffect(() => {
    setQuery(filters.searchQuery || '');
  }, [filters.searchQuery]);

  // Add global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        if (recentSearches.length > 0 && !query.trim()) {
          setShowRecentSearches(true);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [query, recentSearches.length]);

  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setShowRecentSearches(searchQuery.trim().length === 0 && recentSearches.length > 0);
      return;
    }

    setIsLoading(true);
    setShowRecentSearches(false);
    try {
      const searchResults = await onSearch(searchQuery, filters);
      setResults(searchResults);
      setShowResults(true);
      setSelectedIndex(-1);
      
      // Save to recent searches when user actually searches
      saveRecentSearch(searchQuery);
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
    
    // Show recent searches if input is empty or very short
    if (value.trim().length === 0) {
      setShowRecentSearches(recentSearches.length > 0);
      setShowResults(false);
      return;
    }
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults && !showRecentSearches) return;

    const totalItems = showRecentSearches ? recentSearches.length : results.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < totalItems - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (showRecentSearches) {
            const selectedSearch = recentSearches[selectedIndex];
            setQuery(selectedSearch);
            handleSearch(selectedSearch);
          } else {
            const selectedResult = results[selectedIndex];
            handleResultClick(selectedResult);
          }
        }
        break;
      case 'Escape':
        setShowResults(false);
        setShowRecentSearches(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    if (query.trim().length === 0 && recentSearches.length > 0) {
      setShowRecentSearches(true);
    } else if (query.trim().length >= 2 && results.length > 0) {
      setShowResults(true);
    }
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    setShowRecentSearches(false);
    handleSearch(searchTerm);
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    
    // Close results with a slight delay for better UX
    setTimeout(() => {
      setShowResults(false);
      setShowRecentSearches(false);
      setQuery('');
      setSelectedIndex(-1);
    }, 150);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setShowRecentSearches(recentSearches.length > 0);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'template':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <SearchIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResultTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'patient':
        return 'text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium';
      case 'template':
        return 'text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium';
      case 'communication':
        return 'text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium';
      default:
        return 'text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium';
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
            ref={inputRef}
            placeholder="Search patients, templates, communications... (⌘K)"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onClear={handleClear}
            className="w-full"
          />
          
          {/* Recent Searches Dropdown */}
          {showRecentSearches && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Recent Searches
                </div>
                {recentSearches.map((searchTerm, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 ${
                      selectedIndex === index ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleRecentSearchClick(searchTerm)}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{searchTerm}</span>
                    </div>
                  </div>
                ))}
                {recentSearches.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No recent searches
                  </div>
                )}
              </div>
            </div>
          )}
          
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
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Results ({results.length})
                  </div>
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className={`px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                        selectedIndex === index ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start space-x-3">
                        {getResultIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </h4>
                            <span className={getResultTypeBadgeClass(result.type)}>
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
                  <SearchIcon className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                  <p>No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1">Try different keywords or check your spelling</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button
          variant={hasActiveFilters ? 'primary' : 'outline'}
          onClick={onFiltersToggle}
          className="flex items-center space-x-2 px-3 relative"
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
      {(showResults || showRecentSearches) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowResults(false);
            setShowRecentSearches(false);
            setSelectedIndex(-1);
          }}
        />
      )}
      
      {/* Keyboard shortcut hint */}
      <div className="absolute top-full right-0 mt-1 text-xs text-gray-400 hidden sm:block">
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">⌘K</kbd> to focus
      </div>
    </div>
  );
}

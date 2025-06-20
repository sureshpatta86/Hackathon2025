'use client';

import { useState, useEffect } from 'react';
import { FilterConfig, FilterPreset, SearchResult } from '@/types/search';
import { SearchService } from '@/lib/searchService';

export function useAdvancedSearch() {
  const [filters, setFilters] = useState<FilterConfig>({});
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    setSavedPresets(SearchService.getSavedPresets());
  }, []);

  const performSearch = async (query: string, searchFilters: FilterConfig): Promise<SearchResult[]> => {
    const updatedFilters = { ...searchFilters, searchQuery: query };
    setFilters(updatedFilters);
    return SearchService.performGlobalSearch(query, updatedFilters);
  };

  const updateFilters = (newFilters: FilterConfig) => {
    setFilters(newFilters);
  };

  const savePreset = (name: string, description?: string) => {
    const preset = SearchService.saveFilterPreset({
      name,
      description,
      filters,
    });
    setSavedPresets([...savedPresets, preset]);
  };

  const loadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  const deletePreset = (presetId: string) => {
    SearchService.deleteFilterPreset(presetId);
    setSavedPresets(savedPresets.filter(p => p.id !== presetId));
  };

  const hasActiveFilters = SearchService.hasActiveFilters(filters);

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  return {
    filters,
    savedPresets,
    showAdvancedFilters,
    hasActiveFilters,
    performSearch,
    updateFilters,
    savePreset,
    loadPreset,
    deletePreset,
    toggleAdvancedFilters,
    clearAllFilters,
  };
}

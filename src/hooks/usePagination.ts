'use client';

import { useState, useMemo } from 'react';

export interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  canNextPage: boolean;
  canPreviousPage: boolean;
  getPageData: <T>(data: T[]) => T[];
  pageInfo: {
    startIndex: number;
    endIndex: number;
    startItem: number;
    endItem: number;
  };
}

export function usePagination({
  totalItems,
  itemsPerPage: initialItemsPerPage = 10,
  initialPage = 1
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const pageInfo = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const startItem = startIndex + 1;
    const endItem = endIndex;

    return {
      startIndex,
      endIndex,
      startItem,
      endItem
    };
  }, [currentPage, itemsPerPage, totalItems]);

  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const setItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPageState(newItemsPerPage);
    // Reset to first page when changing items per page
    setCurrentPage(1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const firstPage = () => {
    setCurrentPage(1);
  };

  const lastPage = () => {
    setCurrentPage(totalPages);
  };

  const canNextPage = currentPage < totalPages;
  const canPreviousPage = currentPage > 1;

  const getPageData = <T,>(data: T[]): T[] => {
    const { startIndex, endIndex } = pageInfo;
    return data.slice(startIndex, endIndex);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    setPage,
    setItemsPerPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    canNextPage,
    canPreviousPage,
    getPageData,
    pageInfo
  };
}

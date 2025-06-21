'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { usePagination } from '@/hooks/usePagination';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface PaginatedTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  itemsPerPage?: number;
  searchQuery?: string;
  onItemClick?: (item: T) => void;
  emptyMessage?: string;
  actions?: (item: T) => React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export function PaginatedTable<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  itemsPerPage = 10,
  searchQuery = '',
  onItemClick,
  emptyMessage = 'No data available',
  actions,
  className = '',
  headerActions
}: PaginatedTableProps<T>) {
  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;

    const filtered = data.filter(item => {
      // For patient objects, search in specific fields
      if ('firstName' in item && 'lastName' in item && 'phoneNumber' in item) {
        const patient = item as Record<string, unknown> & {
          firstName: string;
          lastName: string;
          phoneNumber: string;
          email?: string;
        };
        const searchTerm = searchQuery.toLowerCase();
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        
        return (
          patient.firstName?.toLowerCase().includes(searchTerm) ||
          patient.lastName?.toLowerCase().includes(searchTerm) ||
          fullName.includes(searchTerm) ||
          patient.phoneNumber?.includes(searchTerm) ||
          patient.email?.toLowerCase().includes(searchTerm)
        );
      }
      
      // For other objects, use the original logic
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'object') return false; // Skip nested objects
        return value.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
    });

    return filtered;
  }, [data, searchQuery]);

  const pagination = usePagination({
    totalItems: filteredData.length,
    itemsPerPage
  });

  const pageData = pagination.getPageData(filteredData);

  const getCellValue = (item: T, column: TableColumn<T>): React.ReactNode => {
    if (column.render) {
      return column.render(item, 0);
    }
    const value = item[column.key as keyof T];
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  };

  return (
    <div className={className}>
      <Card>
        {(title || headerActions) && (
          <CardHeader className="flex flex-row items-center justify-between">
            {title && <CardTitle className="text-gray-900">{title}</CardTitle>}
            {headerActions}
          </CardHeader>
        )}
        
        <CardContent className="p-0">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: column.width }}
                    >
                      {column.header}
                    </th>
                  ))}
                  {actions && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pageData.length > 0 ? (
                  pageData.map((item, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 transition-colors ${
                        onItemClick ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => onItemClick?.(item)}
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {getCellValue(item, column)}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {actions(item)}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (actions ? 1 : 0)}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 border-t bg-white">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={filteredData.length}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={pagination.setPage}
                onItemsPerPageChange={pagination.setItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

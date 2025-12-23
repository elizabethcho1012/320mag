import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchPWAApps } from '@/services/pwaDatabase';

export function usePWASearch(initialQuery: string = '') {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['pwaSearch', debouncedQuery],
    queryFn: () => searchPWAApps(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  return {
    searchQuery,
    setSearchQuery,
    results: results || [],
    isLoading,
  };
}

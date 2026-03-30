'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
}

// Componente de busca com debounce de 300ms
export default function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('');

  // Debounce: só busca 300ms após parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleClear = useCallback(() => {
    setValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por problema, erro, palavra-chave... (ex: estorno, webhook, senha)"
        className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

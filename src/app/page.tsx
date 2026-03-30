'use client';

import { useState, useEffect, useCallback } from 'react';
import { Case } from '@/types/case';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import CaseCard from '@/components/CaseCard';
import CaseDetail from '@/components/CaseDetail';
import AssistantPanel from '@/components/AssistantPanel';
import { BookOpen, Zap } from 'lucide-react';

export default function Home() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filtered, setFiltered] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);

  // Carrega todos os casos na inicialização
  useEffect(() => {
    fetch('/api/cases')
      .then((res) => res.json())
      .then((data: Case[]) => {
        setCases(data);
        setFiltered(data);
        setIsLoading(false);
      });
  }, []);

  // Busca com debounce — evita requisições a cada tecla
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery);
      setSelectedCase(null);

      if (!searchQuery.trim()) {
        const url = activeCategory !== 'all'
          ? `/api/cases?category=${activeCategory}`
          : '/api/cases';
        const res = await fetch(url);
        const data = await res.json();
        setFiltered(data);
        return;
      }

      const params = new URLSearchParams({ q: searchQuery });
      if (activeCategory !== 'all') params.set('category', activeCategory);

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setFiltered(data);
    },
    [activeCategory]
  );

  // Filtra por categoria
  const handleCategoryChange = useCallback(
    async (category: string) => {
      setActiveCategory(category);
      setSelectedCase(null);

      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category !== 'all') params.set('category', category);

      const endpoint = query ? `/api/search?${params}` : `/api/cases?${params}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setFiltered(data);
    },
    [query]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-white shadow-md" style={{ backgroundColor: '#0b1e16' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo_dom-pagamentos.png"
              alt="Dom Pagamentos"
              className="h-9 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold leading-none">CX Assistant</h1>
              <p className="text-white/50 text-xs mt-0.5">Base de Conhecimento Interna</p>
            </div>
          </div>
          <button
            onClick={() => setShowAssistant(!showAssistant)}
            className="flex items-center gap-2 transition px-4 py-2 rounded-lg text-sm font-medium bg-brand-700 hover:bg-brand-600 border border-brand-600"
          >
            <Zap className="w-4 h-4" />
            {showAssistant ? 'Fechar Assistente' : 'Abrir Assistente IA'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        {/* Assistente IA */}
        {showAssistant && (
          <AssistantPanel
            cases={cases}
            onSelectCase={setSelectedCase}
            onClose={() => setShowAssistant(false)}
          />
        )}

        {/* Search + Filters */}
        <div className="flex flex-col gap-3">
          <SearchBar onSearch={handleSearch} />
          <CategoryFilter
            cases={cases}
            active={activeCategory}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Main content */}
        <div className="flex gap-6 flex-1">
          {/* Case list */}
          <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col gap-3">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">Carregando casos...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum caso encontrado</p>
                <p className="text-sm">Tente outras palavras-chave</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  {filtered.length} caso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </p>
                {filtered.map((c) => (
                  <CaseCard
                    key={c.id}
                    caseItem={c}
                    isSelected={selectedCase?.id === c.id}
                    onClick={() => setSelectedCase(c)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Case detail */}
          <div className="hidden md:block flex-1">
            {selectedCase ? (
              <CaseDetail caseItem={selectedCase} onClose={() => setSelectedCase(null)} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Selecione um caso para ver os detalhes</p>
                  <p className="text-sm">Clique em qualquer card à esquerda</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

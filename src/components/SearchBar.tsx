'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface SearchResult {
  id: string;
  name: string;
  address: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search pubs as user types
  useEffect(() => {
    const searchPubs = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const { data } = await supabase
        .from('pubs')
        .select('id, name, address')
        .ilike('name', `%${query}%`)
        .limit(6);

      setResults(data || []);
      setIsLoading(false);
      setSelectedIndex(-1);
    };

    const debounce = setTimeout(searchPubs, 200);
    return () => clearTimeout(debounce);
  }, [query, supabase]);

  const handleSelect = (pub: SearchResult) => {
    router.push(`/pubs/${pub.id}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stout-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pubs..."
          className="w-full pl-9 pr-4 py-2 bg-cream-300 border border-cream-400 rounded-lg text-stout-900 placeholder-stout-500 focus:outline-none focus:ring-2 focus:ring-stout-400 focus:border-stout-400 text-sm shadow-inner"
        />
      </div>

      {/* Dropdown results */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-stout-800 border border-stout-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-stout-400">Searching...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((pub, index) => (
                <li key={pub.id}>
                  <button
                    onClick={() => handleSelect(pub)}
                    className={`w-full text-left px-4 py-3 hover:bg-stout-700 transition-colors ${
                      index === selectedIndex ? 'bg-stout-700' : ''
                    }`}
                  >
                    <p className="text-cream-100 font-medium text-sm">{pub.name}</p>
                    <p className="text-stout-400 text-xs truncate">{pub.address}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-stout-400">
              No pubs found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

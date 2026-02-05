'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface SearchResult {
  type: 'pub' | 'neighborhood' | 'drink';
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  href: string;
  badge?: string;
}

interface SmartSearchProps {
  placeholder?: string;
  className?: string;
  onSelect?: (result: SearchResult) => void;
  autoFocus?: boolean;
}

export default function SmartSearch({
  placeholder = 'Search pubs, neighborhoods, or drinks...',
  className = '',
  onSelect,
  autoFocus = false,
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save to recent searches
  const saveSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Search pubs, neighborhoods, and drinks
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const searchPubs = async () => {
      const searchResults: SearchResult[] = [];

      // Search pubs
      const { data: pubs } = await supabase
        .from('pubs')
        .select('id, name, slug, neighborhood')
        .or(`name.ilike.%${query}%,neighborhood.ilike.%${query}%`)
        .limit(5);

      if (pubs) {
        pubs.forEach(pub => {
          searchResults.push({
            type: 'pub',
            id: pub.id,
            name: pub.name,
            subtitle: pub.neighborhood,
            icon: '🍺',
            href: `/pubs/${pub.slug}`,
          });
        });
      }

      // Add common neighborhoods
      const neighborhoods = ['Temple Bar', 'Grafton Street', 'Camden Street', 'Ranelagh', 'Rathmines'];
      neighborhoods
        .filter(n => n.toLowerCase().includes(query.toLowerCase()))
        .forEach(neighborhood => {
          searchResults.push({
            type: 'neighborhood',
            id: neighborhood,
            name: neighborhood,
            subtitle: 'Neighborhood',
            icon: '📍',
            href: `/pubs?neighborhood=${encodeURIComponent(neighborhood)}`,
          });
        });

      // Add drink types
      const drinks = [
        { name: 'Guinness', query: 'drink_id=1' },
        { name: 'Heineken', query: 'drink_id=2' },
        { name: 'Craft Beer', query: 'amenity=craft-beer' },
      ];
      drinks
        .filter(d => d.name.toLowerCase().includes(query.toLowerCase()))
        .forEach(drink => {
          searchResults.push({
            type: 'drink',
            id: drink.name,
            name: `${drink.name} Pubs`,
            subtitle: 'Drink type',
            icon: '🍻',
            href: `/pubs?${drink.query}`,
          });
        });

      setResults(searchResults);
      setIsLoading(false);
    };

    const debounce = setTimeout(searchPubs, 300);
    return () => clearTimeout(debounce);
  }, [query, supabase]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        } else if (query) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    saveSearch(query);
    setQuery('');
    setIsOpen(false);
    if (onSelect) {
      onSelect(result);
    } else {
      router.push(result.href);
    }
  };

  const handleSearch = () => {
    if (query) {
      saveSearch(query);
      setIsOpen(false);
      router.push(`/pubs?search=${encodeURIComponent(query)}`);
    }
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-stout-800 text-cream-100 pl-12 pr-4 py-3 rounded-xl border border-stout-700 focus:border-irish-green-600 focus:ring-2 focus:ring-irish-green-600/20 transition-colors"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stout-400"
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
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-irish-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || recentSearches.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-stout-800 border border-stout-700 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50 animate-slide-up"
        >
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-stout-400 uppercase">Recent</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-irish-green-500 hover:text-irish-green-400"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(search)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stout-700 text-left transition-colors"
                >
                  <span className="text-base">🕐</span>
                  <span className="text-sm text-cream-100">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {query && results.length > 0 && (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    index === selectedIndex ? 'bg-stout-700' : 'hover:bg-stout-700'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-cream-100 truncate">
                      {result.name}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-stout-400 truncate">{result.subtitle}</div>
                    )}
                  </div>
                  {result.badge && (
                    <span className="px-2 py-0.5 bg-irish-green-600 text-white text-xs rounded-full flex-shrink-0">
                      {result.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && !isLoading && results.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-stout-400 mb-3">No results found for "{query}"</p>
              <button
                onClick={handleSearch}
                className="text-sm text-irish-green-500 hover:text-irish-green-400"
              >
                Search all pubs →
              </button>
            </div>
          )}

          {/* Search Tips */}
          {!query && recentSearches.length === 0 && (
            <div className="p-4">
              <p className="text-xs text-stout-400 mb-3">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {['Temple Bar', 'Cheap Guinness', 'Sports bars', 'Beer garden'].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => {
                      setQuery(tip);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 bg-stout-700 hover:bg-stout-600 text-xs text-cream-100 rounded-full transition-colors"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

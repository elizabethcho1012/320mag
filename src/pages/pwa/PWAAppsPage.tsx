import { useState } from 'react';
import { PWAAppGrid } from '@/components/pwa/PWAAppGrid';
import { PWAAppFilters } from '@/components/pwa/PWAAppFilters';
import { PWASubmitForm } from '@/components/pwa/PWASubmitForm';
import { PWASearchBar } from '@/components/pwa/PWASearchBar';
import { PWASearchResults } from '@/components/pwa/PWASearchResults';
import PWAAppDetailPage from './PWAAppDetailPage';
import { usePWASearch } from '@/hooks/usePWASearch';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import type { PWASortBy } from '@/types/pwa.types';

export default function PWAAppsPage() {
  const [category, setCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<PWASortBy>('newest');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const { searchQuery, setSearchQuery, results, isLoading } = usePWASearch();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-0">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient pb-1">
                Discover
              </span>
              <span className="block bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent pt-2 pb-6">
                Amazing Service
              </span>
            </h1>
            <p className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide text-gray-600">
              for <span className="font-semibold italic bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Ageless Generation</span>
            </p>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={() => setShowSubmitForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Submit Your App
            </button>
          </div>
        </div>
      </div>

      {/* Apps Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-24">
        {/* Search Bar */}
        <PWASearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search for apps by name or description..."
        />

        {/* Show search results if searching, otherwise show filtered grid */}
        {searchQuery ? (
          <PWASearchResults
            results={results}
            isLoading={isLoading}
            query={searchQuery}
            onAppClick={(appId) => setSelectedAppId(appId)}
          />
        ) : (
          <>
            {/* Filters */}
            <PWAAppFilters
              category={category}
              sortBy={sortBy}
              onCategoryChange={setCategory}
              onSortChange={setSortBy}
            />

            {/* Apps Grid */}
            <PWAAppGrid
              filters={{
                category: category || undefined,
                sortBy,
              }}
              onAppClick={(appId) => setSelectedAppId(appId)}
            />
          </>
        )}
      </div>

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <PWASubmitForm onClose={() => setShowSubmitForm(false)} />
      )}

      {/* App Detail Modal */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setSelectedAppId(null)}
            />
            <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <PWAAppDetailPage
                appId={selectedAppId}
                onClose={() => setSelectedAppId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

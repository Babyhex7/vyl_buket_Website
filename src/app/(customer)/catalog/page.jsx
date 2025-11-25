'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavBar from '../../../components/ui/NavBar';
import Footer from '../../../components/ui/Footer';
import Pagination from '../../../components/ui/Pagination';
import { usePagination } from '../../../hooks/usePagination';

export default function CatalogPage() {
  const [bouquets, setBouquets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchBouquets();
  }, []);

  const fetchBouquets = async () => {
    try {
      const response = await fetch('/api/bouquets');
      const data = await response.json();
      if (data.success) {
        setBouquets(data.data.filter(b => b.is_active));
      }
    } catch (error) {
      console.error('Error fetching bouquets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filtered = useMemo(() => {
    if (!query) return bouquets;
    const q = query.toLowerCase();
    return bouquets.filter(b => (b.name || '').toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q));
  }, [bouquets, query]);

  // Pagination untuk catalog
  const {
    paginatedData: paginatedBouquets,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    perPage,
    goToPage,
    changePerPage,
  } = usePagination(filtered, 12); // 12 items (6 rows x 2 cols mobile)

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">Memuat katalog...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <div className="relative z-20">
        <NavBar />
      </div>

      {/* Main Content */}
      <div className="min-h-screen pt-20 md:pt-24 pb-12 px-3 sm:px-4 md:px-6 font-serif bg-gradient-soft">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12 animate-slide-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
              Katalog Buket
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Jelajahi koleksi buket bunga kami yang indah dan elegan untuk setiap momen spesial
            </p>
          </div>

          {/* Search Bar - Responsive width */}
          <div className="max-w-2xl mx-auto mb-8 md:mb-12 px-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 sm:left-4 flex items-center text-gray-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM8 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari buket..."
                className="w-full border border-gray-300 rounded-full py-3 sm:py-4 pl-10 sm:pl-14 pr-4 sm:pr-6 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all text-sm sm:text-base touch-target"
              />
            </div>
          </div>

          {/* Catalog Grid */}
          {filtered.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg">Belum ada buket tersedia</p>
            </div>
          ) : (
            <>
            {/* Grid: 2 kolom di mobile, 2 di tablet, 3 di desktop */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {paginatedBouquets.map((bouquet) => (
                <div 
                  key={bouquet.id} 
                  className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-shadow flex flex-col group"
                >
                  {/* Image - Responsive height */}
                  <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-100 overflow-hidden rounded-t-lg sm:rounded-t-xl">
                    {bouquet.image_url ? (
                      <Image
                        src={bouquet.image_url}
                        alt={bouquet.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Card Content - Responsive padding */}
                  <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title - Responsive text size */}
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-serif font-bold mb-1 sm:mb-2 line-clamp-2 text-gray-900">
                        {bouquet.name}
                      </h3>
                      
                      {/* Description - Hidden di mobile kecil */}
                      <p className="hidden sm:block text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
                        {bouquet.description || 'Mixed seasonal flowers in warm tones'}
                      </p>
                    </div>

                    {/* Price & Button */}
                    <div className="mt-2 sm:mt-3">
                      {/* Price - Responsive size */}
                      <div className="mb-2 sm:mb-3">
                        <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-pink-400 block">
                          {formatPrice(bouquet.price)}
                        </span>
                      </div>

                      {/* Order Button - Touch friendly */}
                      <Link
                        href={`/order?bouquet_id=${bouquet.id}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-pink-400 hover:bg-pink-500 active:bg-pink-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all hover:shadow-md text-xs sm:text-sm md:text-base touch-target"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-2 5h13" />
                        </svg>
                        <span className="hidden sm:inline">Pilih buket ini</span>
                        <span className="sm:hidden">Pilih</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 md:mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                perPage={perPage}
                onPerPageChange={changePerPage}
              />
            </div>

            {/* Result count - Helper text */}
            <div className="text-center mt-6 text-sm text-gray-500">
              Menampilkan {startIndex}-{endIndex} dari {totalItems} buket
              {query && ` untuk "${query}"`}
            </div>
            </>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  );
}

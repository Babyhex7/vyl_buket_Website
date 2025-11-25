import Link from 'next/link'
import { ShoppingBagIcon, SparklesIcon, HeartIcon, ArrowDownLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import NavBar from '../components/ui/NavBar'
import Footer from '../components/ui/Footer'

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden relative">
      {/* Background image (full screen) - responsive blur */}
      <div
        className="absolute inset-0 bg-center bg-cover blur-sm brightness-90"
        style={{
          backgroundImage: "url('/bg_image.jpg')",
        }}
      />
      
      {/* Overlay gradient - responsive opacity */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-white/70 md:from-white/60 md:via-transparent md:to-white/60" />

      {/* Navbar */}
      <div className="relative z-20">
        <NavBar />
      </div>

      {/* Hero Content - Responsive layout */}
      <div className="relative z-10 min-h-screen flex items-center font-serif">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-8 py-20 md:py-24">
          
          {/* Text Content */}
          <div className="text-left max-w-3xl animate-slide-in-up">
            
            {/* Heading - Responsive typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900">
              Rangkaian Bunga
              <br />
              <span className="text-pink-400">Elegan</span> untuk Momen
              <br />
              Istimewa
            </h1>

            {/* Description - Responsive text */}
            <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-gray-800 max-w-xl leading-relaxed">
              Pesan buket artificial flowers, bunga kering, dan pipe cleaner dengan mudah. Custom design, kualitas premium, dan pelayanan terbaik untuk setiap momen spesial Anda.
            </p>

            {/* CTA Buttons - Responsive layout */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                href="/order" 
                className="inline-flex items-center justify-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold px-6 py-3 md:px-7 md:py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all touch-target"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                Pesan Sekarang
              </Link>

              <Link 
                href="/catalog" 
                className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-900 text-gray-900 font-semibold px-6 py-3 md:px-7 md:py-3.5 rounded-2xl hover:bg-white hover:shadow-md transition-all touch-target"
              >
                Lihat Katalog
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>

            {/* Feature Grid - Responsive columns */}
            <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl">
              
              {/* Feature 1 */}
              <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-3 py-2.5 md:px-4 md:py-3 rounded-xl shadow-sm">
                <div className="flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800">
                  100+ Pelanggan Puas
                </span>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-3 py-2.5 md:px-4 md:py-3 rounded-xl shadow-sm">
                <div className="flex-shrink-0">
                  <HeartIcon className="w-5 h-5 md:w-6 md:h-6 text-rose-400" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800">
                  Bouquet Artificial Flowers
                </span>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2 md:gap-3 bg-white/80 backdrop-blur-sm px-3 py-2.5 md:px-4 md:py-3 rounded-xl shadow-sm">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800">
                  DP 30% Saja
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-20">
        <Footer />
      </div>
    </main>
  )
}

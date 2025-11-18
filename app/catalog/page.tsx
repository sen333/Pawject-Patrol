// NOTE: This is only a temporarily prompted catalog page to test backend, not yet the final version
// NOTE: Not yet fully tested

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase/client'

// Animal type definition
interface Animal {
  animal_id: string
  animal_name: string | null
  animal_species: string | null
  animal_breed: string | null
  animal_description: string | null
  animal_status: string | null
  animal_photo: string | null
  created_at: string | null
}

// Catalog Page Component
export default function CatalogPage() {
  // State variables
  const [filter, setFilter] = useState<'all' | 'cat' | 'dog'>('all')
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch animals on mount
  useEffect(() => {

    // Make API call to fetch animals
    const fetchAnimals = async () => {
      // Set loading and error states
      setLoading(true)
      setError(null)

      // Fetch animals from Supabase
      const { data, error } = await supabase
        .from('animal')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Handle errors or set animals
      if (error) {
        setError(error.message)
        setAnimals([])
      } else {
        // Set animals state with fetched data
        setAnimals((data || []) as Animal[])
      }

      // Finalize loading state
      setLoading(false)
    }
    // Start fetching animals
    fetchAnimals()
  }, [])

  // Filter animals based on selected filter
  const filteredAnimals = animals.filter(animal => {
    if (filter === 'all') return true
    const species = (animal.animal_species || '').toLowerCase()
    return species === filter
  })

  // Function to get status badge CSS classes
  const getStatusColor = (status: string | null) => {
    // Determine CSS classes based on status text
    const s = (status || '').toLowerCase()
    if (s.includes('available')) return 'bg-green-100 text-green-800 border-green-200'
    if (s.includes('adopted')) return 'bg-gray-100 text-gray-800 border-gray-200'
    if (s.includes('pending')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (s.includes('shelter') || s.includes('rescue')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (s.includes('treat') || s.includes('care')) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (s.includes('lost') || s.includes('missing')) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-extrabold text-gray-900">Pet Catalog</h1>
            <Link href="/" className="text-sm text-purple-700 hover:underline">
              ← Back to Home
            </Link>
          </div>
          <p className="text-gray-600">Browse our lovely pets looking for their forever homes</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            All Pets
          </button>
          <button
            onClick={() => setFilter('cat')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              filter === 'cat'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            🐱 Cats
          </button>
          <button
            onClick={() => setFilter('dog')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              filter === 'dog'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            🐶 Dogs
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Loading animals...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4">
            Error loading animals: {error}
          </div>
        )}

        {/* Pet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => {
            const name = animal.animal_name || 'Unnamed'
            const species = animal.animal_species || 'Unknown'
            const breed = animal.animal_breed || ''
            const status = animal.animal_status || ''
            const photo = animal.animal_photo || ''
            const isAvailable = (status || '').toLowerCase().includes('available')
            
            return (
              <Link
                href={`/catalog/animal/${animal.animal_id}`}
                key={animal.animal_id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {/* Pet Image */}
                <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100">
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = ''
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No photo
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
                    {status || 'Unknown'}
                  </div>
                </div>

                {/* Pet Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">{name}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {breed ? `${breed} • ${species}` : species}
                  </p>
                  
                  {animal.animal_description && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {animal.animal_description}
                    </p>
                  )}

                  {/* Action Button */}
                  <button
                    disabled={!isAvailable}
                    onClick={(e)=>{ if(!isAvailable) e.preventDefault(); }}
                    className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all ${
                      isAvailable
                        ? 'bg-purple-600 text-white group-hover:bg-purple-700 shadow-md group-hover:shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'View & Adopt' : status || 'Not Available'}
                  </button>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {!loading && filteredAnimals.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No animals found in this category.</p>
          </div>
        )}
      </div>
    </main>
  )
}

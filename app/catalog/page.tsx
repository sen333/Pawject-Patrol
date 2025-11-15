// NOTE: This is only a temporarily prompted catalog page to test backend, not yet the final version
// NOTE: Not yet fully tested

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Pet {
  id: number
  name: string
  species: string
  breed: string
  age: string
  gender: string
  color: string
  imageUrl: string
  status: 'available' | 'adopted' | 'pending'
}

// Sample pet data
const samplePets: Pet[] = [
  {
    id: 1,
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Tabby',
    age: '2 years',
    gender: 'Male',
    color: 'Orange & White',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    status: 'available'
  },
  {
    id: 2,
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '3 years',
    gender: 'Male',
    color: 'Golden',
    imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
    status: 'available'
  },
  {
    id: 3,
    name: 'Luna',
    species: 'Cat',
    breed: 'Persian',
    age: '1 year',
    gender: 'Female',
    color: 'Gray',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10c1dd7aa5f8?w=400&h=400&fit=crop',
    status: 'available'
  },
  {
    id: 4,
    name: 'Max',
    species: 'Dog',
    breed: 'Beagle',
    age: '4 years',
    gender: 'Male',
    color: 'Brown & White',
    imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=400&fit=crop',
    status: 'adopted'
  },
  {
    id: 5,
    name: 'Mittens',
    species: 'Cat',
    breed: 'Siamese',
    age: '6 months',
    gender: 'Female',
    color: 'Cream & Brown',
    imageUrl: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&h=400&fit=crop',
    status: 'pending'
  },
  {
    id: 6,
    name: 'Rocky',
    species: 'Dog',
    breed: 'German Shepherd',
    age: '2 years',
    gender: 'Male',
    color: 'Black & Tan',
    imageUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=400&fit=crop',
    status: 'available'
  }
]

export default function CatalogPage() {
  const [filter, setFilter] = useState<'all' | 'cat' | 'dog'>('all')

  const filteredPets = samplePets.filter(pet => {
    if (filter === 'all') return true
    return pet.species.toLowerCase() === filter
  })

  const getStatusColor = (status: Pet['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'adopted':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusBadge = (status: Pet['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
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

        {/* Pet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Pet Image */}
              <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100">
                <Image
                  src={pet.imageUrl}
                  alt={pet.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(pet.status)}`}>
                  {getStatusBadge(pet.status)}
                </div>
              </div>

              {/* Pet Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{pet.breed} • {pet.species}</p>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Age:</span>
                    <span>{pet.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Gender:</span>
                    <span>{pet.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Color:</span>
                    <span>{pet.color}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  disabled={pet.status !== 'available'}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all ${
                    pet.status === 'available'
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {pet.status === 'available' ? 'Adopt Me' : pet.status === 'adopted' ? 'Adopted' : 'Adoption Pending'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No pets found in this category.</p>
          </div>
        )}
      </div>
    </main>
  )
}

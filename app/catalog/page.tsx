'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, LogIn, MapPin, PawPrint, Unlink2, ArrowRight, X, Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { FaMars, FaVenus } from 'react-icons/fa';
import { useRouter } from "next/navigation";

// Panel colors
const panelColors = ["#689668", "#DCB57E", "#5E9BBA", "#C575AD", "#8D52A7"]

// Helper: get random color not equal to last color
function getRandomColor(lastColor: string | null) {
  const filtered = panelColors.filter(c => c !== lastColor)
  return filtered[Math.floor(Math.random() * filtered.length)]
}

// Helper: convert animal_theme name to hex color
function getThemeColor(theme: string | null): string {
  if (!theme) return '#689668' // default green
  const themeMap: Record<string, string> = {
    'blue': '#5E9BBA',
    'green': '#689668',
    'orange': '#DCB57E',
    'pink': '#C575AD'
  }
  return themeMap[theme.toLowerCase()] || '#689668'
}
import { supabase } from '@/utils/supabase/client'

// Animal type definition
interface Animal {
  animal_id: string
  animal_name: string | null
  animal_species: string | null
  animal_breed: string | null
  animal_age: string | null
  animal_gender: string | null // <-- Add gender
  animal_description: string | null
  animal_status: string | null
  animal_photo: string | null
  animal_affiliation: string | null
  animal_collar: string | null // <-- Add collar for status display
  animal_theme: string | null // <-- Add theme for panel color
  created_at: string | null
}

// Catalog Page Component
export default function CatalogPage() {
  // State variables
  const [filter, setFilter] = useState<'all' | 'cat' | 'dog'>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // User info state for sidebar
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Search state
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        setUserEmail(user.email || "");
        const nameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name || "";
        setUserName(nameFromMeta || user.email?.split("@")[0] || "");
      } else {
        setUserName("");
        setUserEmail("");
      }
    };
    checkAuth();
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        setUserEmail(session.user.email || "");
        const nameFromMeta = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
        setUserName(nameFromMeta || session.user.email?.split("@")[0] || "");
      } else {
        setUserName("");
        setUserEmail("");
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch animals on mount
  useEffect(() => {
    // Make API call to fetch animals
    const fetchAnimals = async () => {
      // Set loading and error states
      setLoading(true)
      setError(null)

      // Fetch animals from Supabase (animal table only, not join)
      const { data, error } = await supabase
        .from('animal')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Handle errors or set animals
      if (error) {
        setError(error.message)
        setAnimals([])
      } else {
        setAnimals((data || []) as Animal[])
      }

      // Finalize loading state
      setLoading(false)
    }
    // Start fetching animals
    fetchAnimals()
  }, [])

  // Filter animals based on selected filter and search
  const filteredAnimals = animals.filter(animal => {
    // Filter by species
    if (filter !== 'all') {
      const species = (animal.animal_species || '').toLowerCase();
      if (species !== filter) return false;
    }
    // Filter by search (name, breed, species, gender)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (
        !(animal.animal_name || "").toLowerCase().includes(q) &&
        !(animal.animal_breed || "").toLowerCase().includes(q) &&
        !(animal.animal_species || "").toLowerCase().includes(q) &&
        !(animal.animal_gender || "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // Map of hover colors
  const hoverColors: Record<string, string> = {
    "#689668": "#5E875E",
    "#DCB57E": "#C6A371",
    "#5E9BBA": "#558CA7",
    "#C575AD": "#B1699C",
    "#8D52A7": "#7F4A96"
  }

    // Sidebar Component
  const Sidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-[375px] bg-[#E1E69D] z-40 transition-transform transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
        style={{
          display: "flex",
          padding: "24px",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg transition"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* Top Section */}
        <div className="flex flex-col gap-6 items-center w-full">
          {/* Logo */}
          <Image
            src="/YFALogo.png"
            alt="Youth for Animals Logo"
            width={92}
            height={77}
          />

          <div className="flex flex-col gap-6 items-center w-full">
            {/* Account Information */}
            <div
              className="w-full"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "5px",
                alignSelf: "stretch",
                borderRadius: "16px",
                border: "1px solid #3C3333",
                backgroundColor: "#E6E6E6",
                padding: "12px",
              }}
            >
              {userName ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{userName[0].toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-sm" style={{ color: "#3C3333", fontFamily: "Genty Sans", fontSize: "16px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal" }}>{userName}</span>
                    <span className="text-xs text-gray-600" style={{ color: "#3C3333", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal" }}>{userEmail}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full text-center py-4">
                  <span className="text-sm font-semibold text-gray-700">You are not logged in.</span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav
              className="w-full"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "5px",
                alignSelf: "stretch",
                borderRadius: "16px",
                border: "1px solid #3C3333",
                backgroundColor: "#E6E6E6",
                padding: "12px",
              }}
            >
              {[
                { label: "Home", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: "About Us", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20.42 4.57996C19.9183 4.07653 19.3222 3.67709 18.6658 3.40455C18.0094 3.132 17.3057 2.9917 16.595 2.9917C15.8843 2.9917 15.1806 3.132 14.5242 3.40455C13.8678 3.67709 13.2717 4.07653 12.77 4.57996L12 5.35996L11.23 4.57996C10.7283 4.07653 10.1322 3.67709 9.47582 3.40455C8.81944 3.132 8.11571 2.9917 7.40499 2.9917C6.69428 2.9917 5.99055 3.132 5.33417 3.40455C4.67779 3.67709 4.08167 4.07653 3.57999 4.57996C1.45999 6.69996 1.32999 10.28 3.99999 13L12 21L20 13C22.67 10.28 22.54 6.69996 20.42 4.57996Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: "Mission", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0)">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C575AD" strokeWidth="3" />
                      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="#C575AD" strokeWidth="3" />
                      <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="#C575AD" strokeWidth="3" />
                    </g>
                  </svg>
                )},
                { label: "Vision", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#5E9BBA" strokeWidth="2" />
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#5E9BBA" strokeWidth="2" />
                  </svg>
                )},
                { label: "Goals", icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.0799V11.9999C21.9988 14.1563 21.3005 16.2545 20.0093 17.9817C18.7182 19.7088 16.9033 20.9723 14.8354 21.5838C12.7674 22.1952 10.5573 22.1218 8.53447 21.3744C6.51168 20.6271 4.78465 19.246 3.61096 17.4369C2.43727 15.6279 1.87979 13.4879 2.02168 11.3362C2.16356 9.18443 2.99721 7.13619 4.39828 5.49694C5.79935 3.85768 7.69279 2.71525 9.79619 2.24001C11.8996 1.76477 14.1003 1.9822 16.07 2.85986" stroke="#689668" strokeWidth="2"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="#689668" strokeWidth="2"/>
                  </svg>
                )}
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                  setSidebarOpen(false);
                  router.push("/"); // Redirect to landing page
                }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Animal Actions Section */}
        <div
          className="w-full"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "5px",
            alignSelf: "stretch",
            borderRadius: "16px",
            border: "1px solid #000",
            backgroundColor: "#E6E6E6",
            padding: "12px",
            marginTop: "24px",
          }}
        >
          <Link
            href="/catalog"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Animal Catalogue</span>
          </Link>

          <Link
            href="/form"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <path d="M20.42 4.58C19.92 4.08 19.32 3.68 18.67 3.4C18.01 3.13 17.31 2.99 16.6 2.99C15.89 2.99 15.18 3.13 14.52 3.4C13.87 3.68 13.27 4.08 12.77 4.58L12 5.36L11.23 4.58C10.73 4.08 10.13 3.68 9.48 3.4C8.82 3.13 8.12 2.99 7.41 2.99C6.7 2.99 5.99 3.13 5.33 3.4C4.68 3.68 4.08 4.08 3.58 4.58C1.46 6.7 1.33 10.28 4 13L12 21L20 13C22.67 10.28 22.54 6.7 20.42 4.58Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Report Animal</span>
          </Link>

          <button
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/30 transition text-left w-full"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                <g clipPath="url(#clip0)">
                  <path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22Z" stroke="#C575AD" strokeWidth="3" />
                  <path d="M12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18Z" stroke="#C575AD" strokeWidth="3" />
                  <path d="M12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14Z" stroke="#C575AD" strokeWidth="3" />
                </g>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Task Volunteer</span>
          </button>
        </div>

        {/* Bottom Section – Social Links */}
        <div className="flex items-center gap-3 mt-auto">
          <a href="#" className="bg-[#C575AD] p-2 rounded-full text-white hover:opacity-80">
            <Facebook size={18} />
          </a>
          <a href="#" className="bg-[#8D52A7] p-2 rounded-full text-white hover:opacity-80">
            <Instagram size={18} />
          </a>
          <a href="#" className="bg-[#5E9BBA] p-2 rounded-full text-white hover:opacity-80">
            <Twitter size={18} />
          </a>
          <a href="#" className="bg-[#9BBF94] p-2 rounded-full text-white hover:opacity-80">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </>
  );


  return (
    <>
       <main className="min-h-screen bg-[#E6E6E6]">
        {/* Sidebar */}
        <Sidebar />
        <div className="max-w-7xl mx-auto px-4 py-0">
          {/* Navigation header */}
          <div className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
            <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition"><Menu className="w-6 h-6 text-gray-800" /></button>
              <div className="flex-1 flex justify-center items-center h-full">
                <Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition"><LogIn className="w-6 h-6 text-gray-800" /></button>
            </div>
          </div>
          {/* Page header below navigation, styled like animal profile form */}
          <header className="flex flex-col items-start justify-center py-6 mb-6">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
              style={{
                color: "#C2C876",
                WebkitTextStrokeWidth: ".5px",
                WebkitTextStrokeColor: "#3C3333",
                fontFamily: '"Kawaii RT", sans-serif',
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
                outlineColor: "#3C3333",
              }}
            >
              Animal Catalog
            </h1>
            <p
              className="text-xs sm:text-sm md:text-md"
              style={{ color: "#3C3333", fontFamily: '"Genty Sans", sans-serif' }}
            >
              Browse all animals available for adoption and care
            </p>
          </header>

          {/* Filter Buttons and Search input in one row */}
          <div className="flex flex-wrap gap-2 mb-6 mt-2 items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-full font-medium transition-all ${filter === 'all' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'}`}>All Animals</button>
              <button onClick={() => setFilter('cat')} className={`px-6 py-2 rounded-full font-medium transition-all ${filter === 'cat' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'}`}>🐱 Cats</button>
              <button onClick={() => setFilter('dog')} className={`px-4 py-2 rounded-full font-medium transition-all ${filter === 'dog' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'}`}>🐶 Dogs</button>
            </div>
            <div className="flex-1 flex justify-end min-w-[300px]">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, breed, or species..."
                className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </div>
          </div>

          {/* Pet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((pet: Animal) => {
              // Convert animal_theme name to hex color
              const color = getThemeColor(pet.animal_theme)
              const pillHover = hoverColors[color] || '#000'
              return (
                  <div key={pet.animal_id} className="shadow-lg hover:shadow-xl transition rounded-2xl overflow-hidden flex flex-col h-full bg-transparent">
                    {/* Image Section */}
                    <div className="relative h-64 w-full bg-white">
                      <Image src={pet.animal_photo || '/default-animal.jpg'} alt={pet.animal_name || 'Animal'} fill className="object-cover" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <h3 className="text-xl font-extrabold drop-shadow">{pet.animal_name}</h3>
                        <p className="text-sm font-medium drop-shadow">{pet.animal_breed}</p>
                      </div>
                    </div>

                    {/* Colored Panel - fills bottom, no white space */}
                    <div
                      className="flex-1 flex flex-col justify-between p-5 rounded-b-2xl"
                      style={{
                        backgroundColor: color,
                        color: '#E6E6E6',
                        fontFamily: '"Genty Sans", sans-serif',
                        fontSize: '15px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '20px',
                        minHeight: '180px',
                        marginTop: '-1px', // Remove gap between image and panel
                      }}
                    >
                      <p className="mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {pet.animal_affiliation || "CSM"}
                      </p>

                      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                        {[
                          { icon: <PawPrint className="w-5 h-5 mx-auto" />, label: pet.animal_species },
                          { icon: pet.animal_gender === "Male" ? <FaMars className="w-5 h-5 mx-auto" /> : <FaVenus className="w-5 h-5 mx-auto" />, label: pet.animal_gender },
                          { icon: <Unlink2 className="w-5 h-5 mx-auto" />, label: pet.animal_collar && pet.animal_collar.toLowerCase() !== 'none' ? 'Has Collar' : 'Has No Collar' },
                        ].map((pill, i) => (
                          <div
                            key={i}
                            className="backdrop-blur-md rounded-xl py-2 flex flex-col items-center gap-1 border border-white"
                            style={{ backgroundColor: 'rgba(0,0,0,0.15)', color: '#E6E6E6' }}
                          >
                            {pill.icon}
                            <span className="text-xs">{pill.label}</span>
                          </div>
                        ))}
                      </div>

                      <Link href={`/catalog/${pet.animal_id}`} className="flex items-center gap-2 font-semibold">
                        View Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
              )
            })}
          </div>

          {filteredAnimals.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No animals found in this category.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
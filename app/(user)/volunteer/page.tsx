'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail, Calendar, MapPin, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { getVolunteerSignupCount } from '@/actions/volunteer/user';
import { syncAllVolunteerCallStatuses } from '@/actions/volunteer/admin';

// Volunteer Call type definition
interface VolunteerCall {
  call_id: string;
  call_title: string | null;
  call_details: string | null;
  call_status: string | null;
  call_starttime: string | null;
  call_endtime: string | null;
  call_location: string | null;
  capacity: number | null;
  created_at: string | null;
}

// Helper function to format date and time
function formatDateTime(value?: string | null) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return value;
  }
}

// Helper function for status badge colors
function statusBadgeClasses(status?: string | null) {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (s === 'filled') return 'bg-green-100 text-green-800 border-green-200';
  if (s === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

// Volunteer Page Component
export default function VolunteerPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [volunteers, setVolunteers] = useState<VolunteerCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [search, setSearch] = useState('');
  const [signupCounts, setSignupCounts] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Define fetchVolunteers using useCallback to prevent recreation on every render
  const fetchVolunteers = useCallback(async (isInitialLoad = false) => {
    // Don't set loading on refetch to avoid UI flicker
    if (isInitialLoad) setLoading(true);
    setError(null);

    // Sync all statuses first
    await syncAllVolunteerCallStatuses();

    const { data, error } = await supabase
      .from('volunteer_call')
      .select('*')
      .in('call_status', ['Active', 'Filled', 'Cancelled'])
      .order('call_starttime', { ascending: true });

    if (error) {
      setError(error.message);
      setVolunteers([]);
    } else {
      const volunteerData = (data || []) as VolunteerCall[];
      setVolunteers(volunteerData);
      
      // Fetch signup counts directly from volunteer_response table
      const counts: Record<string, number> = {};
      await Promise.all(
        volunteerData.map(async (v) => {
          const { count } = await supabase
            .from('volunteer_response')
            .select('*', { count: 'exact', head: true })
            .eq('call_id', v.call_id);
          
          counts[v.call_id] = count || 0;
        })
      );
      setSignupCounts(counts);
      setLastUpdate(new Date());
    }

    if (isInitialLoad) setLoading(false);
  }, []);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user) {
        setUserEmail(user.email || '');
        const nameFromMeta = user.user_metadata?.full_name || user.user_metadata?.name || '';
        setUserName(nameFromMeta || user.email?.split('@')[0] || '');
      } else {
        setUserName('');
        setUserEmail('');
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        setUserEmail(session.user.email || '');
        const nameFromMeta = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
        setUserName(nameFromMeta || session.user.email?.split('@')[0] || '');
      } else {
        setUserName('');
        setUserEmail('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch volunteer opportunities
  useEffect(() => {
    // Initial fetch
    fetchVolunteers(true);

    // Create unique channel names to avoid conflicts between multiple clients
    const channelId = Math.random().toString(36).substring(7);
    
    // Set up real-time subscription for volunteer_call changes
    const callSubscription = supabase
      .channel(`volunteer_call_changes_${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'volunteer_call' },
        async () => {
          // Add small delay to ensure database transaction is committed
          setTimeout(async () => {
            await fetchVolunteers(false);
          }, 500);
        }
      )
      .subscribe();

    // Set up real-time subscription for volunteer_response changes
    const responseSubscription = supabase
      .channel(`volunteer_response_changes_${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'volunteer_response' },
        async () => {
          // Add small delay to ensure database transaction is committed
          setTimeout(async () => {
            await fetchVolunteers(false);
          }, 500);
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      callSubscription.unsubscribe();
      responseSubscription.unsubscribe();
    };
  }, [fetchVolunteers]);

  // Filter volunteers based on search
  const filteredVolunteers = volunteers.filter(volunteer => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (
        !(volunteer.call_title || '').toLowerCase().includes(q) &&
        !(volunteer.call_details || '').toLowerCase().includes(q) &&
        !(volunteer.call_location || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // Sidebar Component
  const Sidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-[375px] bg-[#E1E69D] z-40 transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
        style={{
          display: 'flex',
          padding: '24px',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '5px',
                alignSelf: 'stretch',
                borderRadius: '16px',
                border: '1px solid #3C3333',
                backgroundColor: '#E6E6E6',
                padding: '12px',
              }}
            >
              {userName ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{userName[0].toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-sm" style={{ color: '#3C3333', fontFamily: 'Genty Sans', fontSize: '16px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>{userName}</span>
                    <span className="text-xs text-gray-600" style={{ color: '#3C3333', fontSize: '12px', fontStyle: 'normal', fontWeight: 400, lineHeight: 'normal' }}>{userEmail}</span>
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '5px',
                alignSelf: 'stretch',
                borderRadius: '16px',
                border: '1px solid #3C3333',
                backgroundColor: '#E6E6E6',
                padding: '12px',
              }}
            >
              {[
                { label: 'Home', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke="#3C3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: 'About Us', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20.42 4.57996C19.9183 4.07653 19.3222 3.67709 18.6658 3.40455C18.0094 3.132 17.3057 2.9917 16.595 2.9917C15.8843 2.9917 15.1806 3.132 14.5242 3.40455C13.8678 3.67709 13.2717 4.07653 12.77 4.57996L12 5.35996L11.23 4.57996C10.7283 4.07653 10.1322 3.67709 9.47582 3.40455C8.81944 3.132 8.11571 2.9917 7.40499 2.9917C6.69428 2.9917 5.99055 3.132 5.33417 3.40455C4.67779 3.67709 4.08167 4.07653 3.57999 4.57996C1.45999 6.69996 1.32999 10.28 3.99999 13L12 21L20 13C22.67 10.28 22.54 6.69996 20.42 4.57996Z" stroke="#8D52A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: 'Mission', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clip0)">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#C575AD" strokeWidth="3" />
                      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="#C575AD" strokeWidth="3" />
                      <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="#C575AD" strokeWidth="3" />
                    </g>
                  </svg>
                )},
                { label: 'Vision', icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="#5E9BBA" strokeWidth="2" />
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#5E9BBA" strokeWidth="2" />
                  </svg>
                )},
                { label: 'Goals', icon: (
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
                    router.push('/');
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '5px',
            alignSelf: 'stretch',
            borderRadius: '16px',
            border: '1px solid #000',
            backgroundColor: '#E6E6E6',
            padding: '12px',
            marginTop: '24px',
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

          <Link
            href="/volunteer"
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
          </Link>
        </div>

        {/* Bottom Section – Social Links */}
        <div className="flex items-center gap-3 mt-6">
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
        
        <div className="max-w-6xl mx-auto px-4 py-0 pl-[24px] pr-[24px]">
          {/* Navigation header */}
          <div className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto z-10">
            <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Menu className="w-6 h-6 text-gray-800" />
              </button>
              <div className="flex-1 flex justify-center items-center h-full">
                <Image src="/Moodboard2.png" alt="Pawject Patrol Logo" width={77} height={36} />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <LogIn className="w-6 h-6 text-gray-800" />
              </button>
            </div>
          </div>

          {/* Page header */}
          <header className="flex flex-col items-start justify-center py-6 mb-6">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
              style={{
                color: '#C2C876',
                WebkitTextStrokeWidth: '.5px',
                WebkitTextStrokeColor: '#3C3333',
                fontFamily: '"Kawaii RT", sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                outlineColor: '#3C3333',
              }}
            >
              Volunteer Opportunities
            </h1>
            <p className="text-xs sm:text-sm md:text-md" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
              Join us in making a difference for animals in need
            </p>
          </header>

          {/* Search bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search opportunities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#C2C876] focus:outline-none transition"
              style={{ fontFamily: '"Genty Sans", sans-serif' }}
            />
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Loading opportunities...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <p style={{ color: '#DC2626', fontFamily: '"Genty Sans", sans-serif' }}>Error: {error}</p>
            </div>
          )}

          {/* Volunteer opportunities grid */}
          {!loading && !error && (
            <>
              {filteredVolunteers.length === 0 ? (
                <div className="text-center py-12">
                  <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                    {search ? 'No opportunities match your search.' : 'No volunteer opportunities available at the moment.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                  {filteredVolunteers.map((volunteer) => (
                    <div
                      key={volunteer.call_id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => router.push(`/volunteer/${volunteer.call_id}`)}
                    >
                      {/* Card header with status */}
                      <div className="relative h-24 flex items-center px-4" style={{ backgroundColor: '#C2C876' }}>
                        <div className="flex items-center justify-between w-full">
                          <h3 className="text-xl font-bold truncate" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                            {volunteer.call_title || 'Untitled'}
                          </h3>
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-4">
                        {/* Status badge */}
                        <div className="mb-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(volunteer.call_status)}`}
                            style={{ fontFamily: '"Genty Sans", sans-serif' }}
                          >
                            {volunteer.call_status || 'Unknown'}
                          </span>
                        </div>

                        {/* Details */}
                        {volunteer.call_details && (
                          <p className="text-sm mb-3 line-clamp-2" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                            {volunteer.call_details}
                          </p>
                        )}

                        {/* Meta information */}
                        <div className="space-y-2">
                          {volunteer.call_starttime && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
                              <Calendar className="w-4 h-4" />
                              <span>{formatDateTime(volunteer.call_starttime)}</span>
                            </div>
                          )}
                          {volunteer.call_location && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{volunteer.call_location}</span>
                            </div>
                          )}
                          {volunteer.capacity !== null && (
                            <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
                              <Users className="w-4 h-4" />
                              <span>
                                {signupCounts[volunteer.call_id] || 0}/{volunteer.capacity} volunteers
                                {(() => {
                                  const spotsLeft = volunteer.capacity - (signupCounts[volunteer.call_id] || 0);
                                  if (spotsLeft > 1) {
                                    return (
                                      <span style={{ color: '#16A34A', fontWeight: 600 }}>
                                        {' '}({spotsLeft} slots left)
                                      </span>
                                    );
                                  } else if (spotsLeft === 1) {
                                    return (
                                      <span style={{ color: '#16A34A', fontWeight: 600 }}>
                                        {' '}(1 slot left)
                                      </span>
                                    );
                                  } else if (spotsLeft === 0) {
                                    return (
                                      <span style={{ color: '#DC2626', fontWeight: 600 }}>
                                        {' '}(Full)
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* View details button - all opportunities can be viewed */}
                        <button
                          onClick={() => router.push(`/volunteer/${volunteer.call_id}`)}
                          className="mt-4 w-full px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
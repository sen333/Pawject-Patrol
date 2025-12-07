'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { joinVolunteerCall, leaveVolunteerCall, getUserResponseStatus, getVolunteerSignupCount } from '@/actions/volunteer/user';
import { syncVolunteerCallStatus } from '@/actions/volunteer/admin';

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
  if (s === 'ongoing') return 'bg-purple-100 text-purple-800 border-purple-200';
  if (s === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
  if (s === 'completed') return 'bg-gray-100 text-gray-800 border-gray-200';
  return 'bg-amber-100 text-amber-800 border-amber-200';
}

// Volunteer Detail Page Component
export default function VolunteerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [volunteer, setVolunteer] = useState<VolunteerCall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [signupCount, setSignupCount] = useState(0);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

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

  // Fetch volunteer opportunity details
  useEffect(() => {
    const fetchVolunteer = async () => {
      setLoading(true);
      setError(null);

      // Sync status first
      await syncVolunteerCallStatus(unwrappedParams.id);

      const { data, error } = await supabase
        .from('volunteer_call')
        .select('*')
        .eq('call_id', unwrappedParams.id)
        .single();

      if (error) {
        setError(error.message);
        setVolunteer(null);
      } else {
        let volunteerData = data as VolunteerCall;
        
        // Sync status on the client side based on time
        const now = new Date();
        const startTime = volunteerData.call_starttime ? new Date(volunteerData.call_starttime) : null;
        const endTime = volunteerData.call_endtime ? new Date(volunteerData.call_endtime) : null;
        const currentStatus = (volunteerData.call_status || '').toLowerCase();
        
        // Status priority: Cancelled > Completed > Ongoing (time-based) > others
        if (currentStatus === 'cancelled') {
          // Keep cancelled status
        } else if (currentStatus === 'completed') {
          // Keep completed status (overrides all except cancelled)
        } else if (startTime && endTime && now >= startTime && now <= endTime) {
          // Check if ongoing (between start and end time) - overrides active/filled
          volunteerData = { ...volunteerData, call_status: 'Ongoing' };
        } else if (endTime && now > endTime && currentStatus !== 'completed') {
          // If past end time and not already marked completed, mark as completed
          volunteerData = { ...volunteerData, call_status: 'Completed' };
        }
        
        setVolunteer(volunteerData);
        
        // Fetch signup count and user status
        const count = await getVolunteerSignupCount(unwrappedParams.id);
        setSignupCount(count);
        
        const status = await getUserResponseStatus(unwrappedParams.id);
        setUserStatus(status);
      }

      setLoading(false);
    };

    if (unwrappedParams.id) {
      fetchVolunteer();
    }
  }, [unwrappedParams.id]);

  // Handle joining volunteer opportunity
  const handleJoin = async () => {
    if (!isAuthenticated) {
      alert('Please log in to join this opportunity');
      return;
    }

    setJoining(true);
    const result = await joinVolunteerCall(unwrappedParams.id);
    setJoining(false);

    if (result.success) {
      // Refetch volunteer data to get updated status
      const { data: updatedCall } = await supabase
        .from('volunteer_call')
        .select('*')
        .eq('call_id', unwrappedParams.id)
        .single();
      
      if (updatedCall) {
        setVolunteer(updatedCall as VolunteerCall);
      }
      
      // Refresh counts and status
      const count = await getVolunteerSignupCount(unwrappedParams.id);
      setSignupCount(count);
      const status = await getUserResponseStatus(unwrappedParams.id);
      setUserStatus(status);
      alert('Successfully joined this opportunity!');
    } else {
      alert(result.error || 'Failed to join opportunity');
    }
  };

  // Handle leaving volunteer opportunity
  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this opportunity?')) {
      return;
    }

    setJoining(true);
    const result = await leaveVolunteerCall(unwrappedParams.id);
    setJoining(false);

    if (result.success) {
      // Refetch volunteer data to get updated status
      const { data: updatedCall } = await supabase
        .from('volunteer_call')
        .select('*')
        .eq('call_id', unwrappedParams.id)
        .single();
      
      if (updatedCall) {
        setVolunteer(updatedCall as VolunteerCall);
      }
      
      // Refresh counts and status
      const count = await getVolunteerSignupCount(unwrappedParams.id);
      setSignupCount(count);
      const status = await getUserResponseStatus(unwrappedParams.id);
      setUserStatus(status);
      alert('You have left this opportunity.');
    } else {
      alert(result.error || 'Failed to leave opportunity');
    }
  };

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

  // Loading state
  if (loading) {
    return (
      <>
        <main className="min-h-screen bg-[#E6E6E6]">
          <Sidebar />
          <div className="max-w-6xl mx-auto px-4 py-0 pl-[24px] pr-[24px]">
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
            <div className="text-center py-24">
              <p style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>Loading...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Error or not found state
  if (error || !volunteer) {
    return (
      <>
        <main className="min-h-screen bg-[#E6E6E6]">
          <Sidebar />
          <div className="max-w-6xl mx-auto px-4 py-0 pl-[24px] pr-[24px]">
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
            <div className="text-center py-24">
              <p style={{ color: '#DC2626', fontFamily: '"Genty Sans", sans-serif' }}>
                {error || 'Volunteer opportunity not found.'}
              </p>
              <button
                onClick={() => router.push('/volunteer')}
                className="mt-4 px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
              >
                Back to Opportunities
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

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
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 mb-4 text-sm hover:opacity-70 transition"
              style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Opportunities
            </button>
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
              {volunteer.call_title || 'Volunteer Opportunity'}
            </h1>
          </header>

          {/* Volunteer Details Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            {/* Card header with status */}
            <div className="relative h-28 flex items-center px-6" style={{ backgroundColor: '#C2C876' }}>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: '#3C3333', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}>
                  {(volunteer.call_title && volunteer.call_title[0]) ? volunteer.call_title[0].toUpperCase() : 'V'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                    {volunteer.call_title || 'Untitled'}
                  </h2>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {/* Display single status badge - priority: status > user joined state */}
                    {volunteer.call_status?.toLowerCase() === 'ongoing' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-purple-100 text-purple-800 border-purple-200" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        Ongoing
                      </span>
                    ) : userStatus ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-200" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        Joined
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(volunteer.call_status)}`} style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        {volunteer.call_status || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card content */}
            <div className="p-6 md:p-8">
              {volunteer.call_details && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                    Description
                  </h3>
                  <p className="leading-relaxed whitespace-pre-line" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                    {volunteer.call_details}
                  </p>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-1" style={{ color: '#6B7280' }} />
                  <div>
                    <dt className="font-medium text-sm mb-1" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
                      Start Time
                    </dt>
                    <dd style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {formatDateTime(volunteer.call_starttime)}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-1" style={{ color: '#6B7280' }} />
                  <div>
                    <dt className="font-medium text-sm mb-1" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
                      End Time
                    </dt>
                    <dd style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {formatDateTime(volunteer.call_endtime)}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1" style={{ color: '#6B7280' }} />
                  <div>
                    <dt className="font-medium text-sm mb-1" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
                      Location
                    </dt>
                    <dd style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {volunteer.call_location || 'To be announced'}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 mt-1" style={{ color: '#6B7280' }} />
                  <div>
                    <dt className="font-medium text-sm mb-1" style={{ color: '#6B7280', fontFamily: '"Genty Sans", sans-serif' }}>
                      Capacity
                    </dt>
                    <dd style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                      {volunteer.capacity !== null ? (
                        <>
                          {signupCount}/{volunteer.capacity} volunteers
                          {volunteer.capacity - signupCount > 0 && (
                            <span style={{ color: '#16A34A', fontWeight: 600 }}>
                              {' '}({volunteer.capacity - signupCount} spots remaining)
                            </span>
                          )}
                          {volunteer.capacity - signupCount <= 0 && (
                            <span style={{ color: '#DC2626', fontWeight: 600 }}>
                              {' '}(Full)
                            </span>
                          )}
                        </>
                      ) : (
                        'Unlimited'
                      )}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {userStatus ? (
                  <>
                    <button
                      disabled
                      className="flex-1 px-6 py-3 rounded-md text-base font-semibold opacity-70 cursor-not-allowed"
                      style={{ backgroundColor: '#3B82F6', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                    >
                      Already Joined
                    </button>
                    <button
                      onClick={handleLeave}
                      disabled={joining}
                      className="px-6 py-3 rounded-md text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: '#DC2626', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                    >
                      {joining ? 'Leaving...' : 'Leave Opportunity'}
                    </button>
                  </>
                ) : volunteer.call_status?.toLowerCase() === 'active' && volunteer.capacity && signupCount >= volunteer.capacity ? (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 rounded-md text-base font-semibold opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: '#9CA3AF', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    Capacity Full
                  </button>
                ) : volunteer.call_status?.toLowerCase() === 'active' ? (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="flex-1 px-6 py-3 rounded-md text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    {joining ? 'Joining...' : 'Join This Opportunity'}
                  </button>
                ) : volunteer.call_status?.toLowerCase() === 'filled' ? (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 rounded-md text-base font-semibold opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: '#9CA3AF', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    This Opportunity is Filled
                  </button>
                ) : volunteer.call_status?.toLowerCase() === 'cancelled' ? (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 rounded-md text-base font-semibold opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: '#9CA3AF', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    This Opportunity was Cancelled
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="flex-1 px-6 py-3 rounded-md text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    {joining ? 'Joining...' : 'Express Interest'}
                  </button>
                )}
                
                <button
                  onClick={() => router.push('/volunteer')}
                  className="px-6 py-3 rounded-md text-base font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#E6E6E6', color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

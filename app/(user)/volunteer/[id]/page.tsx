'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, LogIn, X, Facebook, Instagram, Twitter, Mail, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { joinVolunteerCall, leaveVolunteerCall, getUserResponseStatus, getVolunteerSignupCount } from '@/actions/volunteer/user';
import { syncVolunteerCallStatus } from '@/actions/volunteer/admin';
import Sidebar from '@/components/Sidebar';

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

  return (
    <>
      <main className="min-h-screen bg-[#E6E6E6]">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userName={userName}
          userEmail={userEmail ?? undefined}
          router={router}
          variant="user"
        />

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
              {volunteer?.call_title || 'Volunteer Opportunity'}
            </h1>
          </header>

          {/* Volunteer Details Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            {/* Card header with status */}
            <div className="relative h-28 flex items-center px-6" style={{ backgroundColor: '#C2C876' }}>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: '#3C3333', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}>
                  {(volunteer?.call_title && volunteer.call_title[0]) ? volunteer.call_title[0].toUpperCase() : 'V'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#3C3333', fontFamily: '"Genty Sans", sans-serif' }}>
                    {volunteer?.call_title || 'Untitled'}
                  </h2>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {/* Display single status badge - priority: status > user joined state */}
                    {volunteer?.call_status?.toLowerCase() === 'ongoing' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-purple-100 text-purple-800 border-purple-200" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        Ongoing
                      </span>
                    ) : userStatus ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-200" style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        Joined
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClasses(volunteer?.call_status)}`} style={{ fontFamily: '"Genty Sans", sans-serif' }}>
                        {volunteer?.call_status || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card content */}
            <div className="p-6 md:p-8">
              {volunteer?.call_details && (
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
                      {formatDateTime(volunteer?.call_starttime)}
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
                      {formatDateTime(volunteer?.call_endtime)}
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
                      {volunteer?.call_location || 'To be announced'}
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
                      {volunteer?.capacity !== null && volunteer?.capacity !== undefined ? (
                        <>
                          {signupCount}/{volunteer.capacity} {signupCount === 1 ? 'volunteer' : 'volunteers'}
                          {(volunteer.capacity ?? 0) - signupCount > 0 && (
                            <span style={{ color: '#16A34A', fontWeight: 600 }}>
                              {' '}({(volunteer.capacity ?? 0) - signupCount} spots remaining)
                            </span>
                          )}
                          {(volunteer.capacity ?? 0) - signupCount <= 0 && (
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
                ) : volunteer?.call_status?.toLowerCase() === 'active' && (volunteer?.capacity ?? 0) && signupCount >= (volunteer?.capacity ?? 0) ? (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 rounded-md text-base font-semibold opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: '#9CA3AF', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    Capacity Full
                  </button>
                ) : volunteer?.call_status?.toLowerCase() === 'active' ? (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="flex-1 px-6 py-3 rounded-md text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#C2C876', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    {joining ? 'Joining...' : 'Join This Opportunity'}
                  </button>
                ) : volunteer?.call_status?.toLowerCase() === 'filled' ? (
                  <button
                    disabled
                    className="flex-1 px-6 py-3 rounded-md text-base font-semibold opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: '#9CA3AF', color: 'white', fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    This Opportunity is Filled
                  </button>
                ) : volunteer?.call_status?.toLowerCase() === 'cancelled' ? (
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

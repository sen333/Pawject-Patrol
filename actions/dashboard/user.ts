"use server";

import { createClient } from "@/utils/supabase/server";

// Get user's dashboard statistics
export async function getUserDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Reports stats
  const { count: totalReports } = await supabase
    .from('animal_report')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
    
  const { count: acceptedReports } = await supabase
    .from('animal_report')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('report_status', 'Accepted');
    
  // Volunteer stats
  const { count: volunteersJoined } = await supabase
    .from('volunteer_response')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
    
  return {
    totalReports: totalReports || 0,
    acceptedReports: acceptedReports || 0,
    volunteersJoined: volunteersJoined || 0,
    impactScore: (acceptedReports || 0) + (volunteersJoined || 0)
  };
}

// Get community-wide statistics
export async function getCommunityStats() {
  const supabase = await createClient();
  
  const { count: totalAnimals } = await supabase
    .from('animal_report')
    .select('*', { count: 'exact', head: true })
    .eq('report_status', 'Accepted');
    
  // Get distinct volunteer count
  const { data: uniqueVolunteers } = await supabase
    .from('volunteer_response')
    .select('user_id')
    .limit(1000);
    
  const uniqueCount = uniqueVolunteers ? new Set(uniqueVolunteers.map(v => v.user_id)).size : 0;
    
  return {
    totalAnimalsHelped: totalAnimals || 0,
    activeVolunteers: uniqueCount || 0
  };
}

// Get user's recent animal reports
export async function getUserRecentReports(limit: number = 5) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: "Not authenticated", data: [] };
  
  const { data, error } = await supabase
    .from('animal_report')
    .select('report_id, report_title, reporter_name, animal_name, animal_type, animal_gender, date_seen, animal_description, area, landmark, road, health_issues, animal_collar, other_information, latitude, longitude, report_status, photo_url, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  return { success: !error, data: data || [], error: error?.message };
}

// Get upcoming volunteer calls
export async function getUpcomingVolunteerCalls(limit: number = 3) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('volunteer_call')
    .select('call_id, call_title, call_starttime, call_location, capacity, call_status')
    .eq('call_status', 'Active')
    .gte('call_starttime', new Date().toISOString())
    .order('call_starttime', { ascending: true })
    .limit(limit);
    
  if (!user || error) return { data: data || [], userJoined: [] };
  
  // Get user's joined calls
  const { data: joined } = await supabase
    .from('volunteer_response')
    .select('call_id')
    .eq('user_id', user.id);
    
  return { 
    data: data || [], 
    userJoined: joined?.map(j => j.call_id) || [] 
  };
}

// Get recent catalog animals (from animal profiles)
export async function getRecentCatalogAnimals(limit: number = 6) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('animal')
    .select('animal_id, animal_name, animal_species, animal_breed, animal_gender, animal_description, animal_status, animal_photo, area, animal_collar, animal_theme, vaccination_status, health_issues, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching catalog animals:', error);
  }
  
  console.log('Catalog animals fetched:', data?.length || 0, 'animals');
  console.log('Sample animal data:', data?.[0]);
    
  return { success: !error, data: data || [], error: error?.message };
}

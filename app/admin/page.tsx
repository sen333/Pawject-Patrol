"use client";

import { useEffect, useState } from "react";
import { Menu, LogIn } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

// Admin dashboard page component - displays stats and navigation cards
export default function HeaderAndBackground() {
  const router = useRouter();
  
  // State management for paw decorations, dog image, and dashboard stats
  const [paws, setPaws] = useState<
    { src: string; top: string; left: string; rotate: number }[]
  >([]);
  const [dogSrc, setDogSrc] = useState("/dog.png");
  const [totalAnimals, setTotalAnimals] = useState(0);
  const [animalReports, setAnimalReports] = useState(0);
  const [volunteerRequests, setVolunteerRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  // Handle responsive layout changes for paw decorations and dog image
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width > 768) {
        // Desktop/Tablet Layout — 12 paws positioned across the screen
        setPaws([
          { src: "/paws/paws1.png", top: "8%", left: "10%", rotate: 43 },
          { src: "/paws/paws2.png", top: "15%", left: "30%", rotate: -15 },
          { src: "/paws/paws1.png", top: "18%", left: "70%", rotate: 20 },
          { src: "/paws/paws2.png", top: "30%", left: "85%", rotate: -25 },
          { src: "/paws/paws1.png", top: "38%", left: "55%", rotate: 10 },
          { src: "/paws/paws2.png", top: "45%", left: "15%", rotate: -35 },
          { src: "/paws/paws1.png", top: "55%", left: "75%", rotate: 30 },
          { src: "/paws/paws2.png", top: "60%", left: "40%", rotate: -10 },
          { src: "/paws/paws1.png", top: "70%", left: "10%", rotate: 25 },
          { src: "/paws/paws2.png", top: "75%", left: "85%", rotate: -20 },
          { src: "/paws/paws1.png", top: "82%", left: "50%", rotate: 15 },
          { src: "/paws/paws2.png", top: "88%", left: "25%", rotate: -30 },
        ]);
        // Use larger dog image for desktop
        setDogSrc("/dog2.png");
      } else {
        // Mobile Layout — 10 paws optimized for smaller screens
        setPaws([
          { src: "/paws/paws1.png", top: "8%", left: "10%", rotate: 40 },
          { src: "/paws/paws2.png", top: "15%", left: "65%", rotate: -30 },
          { src: "/paws/paws1.png", top: "25%", left: "35%", rotate: 25 },
          { src: "/paws/paws2.png", top: "35%", left: "80%", rotate: -10 },
          { src: "/paws/paws1.png", top: "50%", left: "20%", rotate: 15 },
          { src: "/paws/paws2.png", top: "55%", left: "60%", rotate: -20 },
          { src: "/paws/paws1.png", top: "65%", left: "10%", rotate: 35 },
          { src: "/paws/paws2.png", top: "70%", left: "80%", rotate: -40 },
          { src: "/paws/paws1.png", top: "85%", left: "30%", rotate: 10 },
          { src: "/paws/paws2.png", top: "90%", left: "70%", rotate: -35 },
        ]);
        // Use smaller dog image for mobile
        setDogSrc("/dog.png");
      }
    };

    // Initialize layout and add resize listener
    handleResize();
    window.addEventListener("resize", handleResize);
    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Verify admin authentication and fetch dashboard statistics
  useEffect(() => {
    let mounted = true;

    const checkAdminAndFetchData = async () => {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      // Early return if component unmounted during async operation
      if (!mounted) return;

      if (authError || !user) {
        router.replace("/admin/login");
        return;
      }

      // Verify user has admin privileges
      const { data: adminData, error: adminError } = await supabase
        .from("admin")
        .select("auth_id")
        .eq("auth_id", user.id)
        .single();

      if (!mounted) return;

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        router.replace("/admin/login?error=unauthorized");
        return;
      }

      // Fetch dashboard statistics from database tables
      const { count: animalsCount } = await supabase
        .from("animal")
        .select("*", { count: "exact", head: true });

      const { count: reportsCount } = await supabase
        .from("animal_report")
        .select("*", { count: "exact", head: true });

      const { count: callCount } = await supabase
        .from("volunteer_call")
        .select("*", { count: "exact", head: true });

      // Update state with fetched counts if component still mounted
      if (mounted) {
        setTotalAnimals(animalsCount || 0);
        setAnimalReports(reportsCount || 0);
        setVolunteerRequests(callCount || 0);
        setLoading(false);
      }
    };

    // Execute authentication check and data fetch on mount
    checkAdminAndFetchData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, [router]);

  // Handle user logout and redirect to login page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden bg-[#E1E69D]">
      {/* --- Paw Background Decorations --- */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        {paws.map((paw, index) => (
          <Image
            key={index}
            src={paw.src}
            alt="paw"
            width={44}
            height={44}
            className="absolute"
            style={{
              top: paw.top,
              left: paw.left,
              transform: `rotate(${paw.rotate}deg)`,
              aspectRatio: "43.96 / 43.96",
              flexShrink: 0,
              objectFit: "cover",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        {/* Header with menu, logo, and logout button */}
        <header className="flex items-center justify-between px-4 w-full h-[52px] bg-[#E6E6E6] mx-auto">
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Menu className="w-6 h-6 text-gray-800" />
            </Link>

            <div className="flex-1 flex justify-center items-center h-full">
              <img
                src="/Moodboard2.png"
                alt="Pawject Patrol Logo"
                width={77}
                height={36}
                className="flex-shrink-0"
              />
            </div>

            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <LogIn className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </header>

        <div className="flex-1 w-full flex flex-col items-center lg:justify-center">
          {/* --- Dashboard Statistics --- */}
          <section className="w-full max-w-lg md:max-w-2xl lg:max-w-[1400px] mx-auto px-6 mt-8">
            <div
              className="flex flex-col gap-4"
              style={{ fontFamily: '"Genty Sans", sans-serif' }}
            >
              {/* Total Animals */}
              <div className="flex flex-col leading-tight">
                <span className="text-3xl md:text-4xl lg:text-6xl font-medium text-[#DCB57E]">
                  {loading ? "..." : totalAnimals}
                </span>
                <span className="text-sm md:text-base lg:text-3xl text-gray-600">
                  Total Animals
                </span>
              </div>

              {/* Animal Reports */}
              <div className="flex flex-col leading-tight">
                <span className="text-3xl md:text-4xl lg:text-6xl font-medium text-[#5E9BBA]">
                  {loading ? "..." : animalReports}
                </span>
                <span className="text-sm md:text-base lg:text-3xl text-gray-600">
                  Animal Reports
                </span>
              </div>

              {/* Volunteer Requests */}
              <div className="flex flex-col leading-tight">
                <span className="text-3xl md:text-4xl lg:text-6xl font-medium text-[#8D52A7]">
                  {loading ? "..." : volunteerRequests}
                </span>
                <span className="text-sm md:text-base lg:text-3xl text-gray-600">
                  Volunteer Requests
                </span>
              </div>
            </div>
          </section>

          {/* --- Decorative Dog Image --- */}
          <div className="w-full max-w-[1300px] mx-auto px-6 flex justify-end">
            <div
              className="relative w-[400px] h-[400px] -mt-72 mr-0 ml-2 
                               md:w-[500px] md:h-[440px] md:-mt-84 md:mr-4 
                               lg:w-[800px] lg:h-[700px] lg:-mt-[34rem] lg:mr-6"
            >
              <Image
                src={dogSrc}
                alt="Golden Retriever puppy"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>

          {/* --- Admin Navigation Cards --- */}
          <section className="w-full max-w-[1400px] mx-auto px-6 -mt-23 md:-mt-12 lg:-mt-24 pb-12">
            <div className="flex flex-col gap-5 lg:gap-6 self-stretch rounded-2xl bg-[#E6E6E6] py-5 px-5 lg:py-8 lg:px-8 shadow-[0_4px_6px_0_rgba(0,0,0,0.09)]">
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
                
                {/* Card 1: Animal Profiles - View and manage animal database */}

                <Link href="/admin/profiles" className="flex w-full lg:flex-1 min-h-[86px] lg:min-h-[110px] rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 active:scale-95 text-left border-2 border-[#C575AD] bg-[#fcfcfc]">
                  <div className="flex-1 px-4 py-5">
                    <h2
                      className="text-md lg:text-xl font-medium mb-0.5"
                      style={{
                        color: "#C575AD",
                        fontFamily: '"Genty Sans", sans-serif',
                      }}
                    >
                      Animal Profiles
                    </h2>
                    <p
                      className="text-[10px] md:text-xs lg:text-base text-gray-600"
                      style={{ fontFamily: '"Genty Sans", sans-serif' }}
                    >
                      View and Manage Animal Database
                    </p>
                  </div>
                  <div className="w-24 lg:w-32 flex items-center justify-center bg-[#C575AD]">
                    <img
                      src="/paws/paws1.png"
                      alt="Animal Profiles"
                      className="w-10 h-10 lg:w-12 lg-h-12"
                    />
                  </div>
                </Link>

                {/* Card 2: Volunteer Requests - Manage volunteer tasks and requests */}
                <Link href="/admin/volunteers" className="flex w-full lg:flex-1 min-h-[86px] lg:min-h-[110px] rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 active:scale-95 text-left border-2 border-[#5E9BBA] bg-[#fcfcfc]">
                  <div className="flex-1 px-4 py-5">
                    <h2
                      className="text-md lg:text-xl font-medium mb-0.5"
                      style={{
                        color: "#5E9BBA",
                        fontFamily: '"Genty Sans", sans-serif',
                      }}
                    >
                      Volunteer Requests
                    </h2>
                    <p
                      className="text-[10px] md:text-xs lg:text-base text-gray-600"
                      style={{ fontFamily: '"Genty Sans", sans-serif' }}
                    >
                      View and Manage Volunteer Tasks and Requests
                    </p>
                  </div>
                  <div className="w-24 lg:w-32 flex items-center justify-center bg-[#5E9BBA]">
                    <img
                      src="/nav/user.png"
                      alt="Volunteer Requests"
                      className="w-10 h-10 lg:w-12 lg-h-12"
                    />
                  </div>
                </Link>
              </div>

              {/* Card 3: Animal Reports - Track stray findings and reports */}
              <Link href="/admin/form" className="flex w-full min-h-[86px] lg:min-h-[110px] rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 active:scale-95 text-left border-2 border-[#DCB57E] bg-[#fcfcfc]">
                <div className="flex-1 px-4 py-5">
                  <h2
                    className="text-md lg:text-xl font-medium mb-0.5"
                    style={{
                      color: "#DCB57E",
                      fontFamily: '"Genty Sans", sans-serif',
                    }}
                  >
                    Animal Reports
                  </h2>
                  <p
                    className="text-[10px] md:text-xs lg:text-base text-gray-600"
                    style={{ fontFamily: '"Genty Sans", sans-serif' }}
                  >
                    Track Stray Findings and Reports
                  </p>
                </div>
                <div className="w-24 lg:w-32 flex items-center justify-center bg-[#DCB57E]">
                  <img
                    src="/nav/report.png"
                    alt="Animal Reports"
                    className="w-10 h-10 lg:w-12 lg-h-12"
                  />
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
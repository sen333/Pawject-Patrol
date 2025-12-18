"use client";

import { useState } from 'react';
import { adminLoginAction } from '@/actions/login/admin';
import { useRouter } from "next/navigation";

const EyeIcon = ({ onClick }: { onClick: () => void }) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
    onClick={onClick}
  >
    <path
      d="M7.05671 7.05794C6.8067 7.30804 6.66628 7.64721 6.66634 8.00085C6.6664 8.35448 6.80694 8.6936 7.05704 8.94361C7.30714 9.19362 7.64631 9.33404 7.99994 9.33398C8.35358 9.33392 8.6927 9.19338 8.94271 8.94328M11.1207 11.1154C10.1855 11.7005 9.1031 12.0073 8 12C5.6 12 3.6 10.6667 2 8.00002C2.848 6.58669 3.808 5.54802 4.88 4.88402M6.78667 4.12002C7.18603 4.03917 7.59254 3.99897 8 4.00002C10.4 4.00002 12.4 5.33335 14 8.00002C13.556 8.74002 13.0807 9.37802 12.5747 9.91335M2 2L14 14"
      stroke="#ACB5BB"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Login page component
export default function LoginPage() {
  // State variables
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Handle admin login form submission
  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    setMessage("");

    // Extract form data
    const formData = new FormData(event.currentTarget);

    // Call the admin login action
    const result = await adminLoginAction(formData);
    if (result?.success) {
      router.push("/admin");
      return;
    }
    if (result?.message) {
      setMessage(result.message);
    } else {
      setMessage("Login failed. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <main className="relative min-h-screen bg-[#E1E69D] flex flex-col items-center justify-center overflow-hidden">
      {/* --- Hero Container --- */}
      <div className="relative w-full flex flex-col items-center">
        {/* Ellipse Background */}
        <div className="relative w-full flex justify-center z-0">
          {/* Mobile SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 375 389"
            className="absolute top-0 sm:hidden w-[600px] h-auto top-[-34vh]"
          >
            <path
              d="M475.783 187C475.783 298.562 344.602 389 182.783 389C20.9632 389 -110.217 298.562 -110.217 187C-110.217 75.4385 20.9632 -15 182.783 -15C344.602 -15 475.783 75.4385 475.783 187Z"
              fill="#C2C876"
            />
          </svg>

          {/* Tablet SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 768 388"
            fill="none"
            className="absolute hidden sm:block lg:hidden w-[1200px] h-auto top-[-29vh] z-0"
          >
            <path
              d="M985.088 168.5C985.088 289.727 716.43 388 385.024 388C53.6178 388 -215.04 289.727 -215.04 168.5C-215.04 47.2735 53.6178 -51 385.024 -51C716.43 -51 985.088 47.2735 985.088 168.5Z"
              fill="#C2C876"
            />
          </svg>

          {/* Desktop SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 388"
            fill="none"
            className="absolute hidden lg:block w-full h-auto top-[-36vh]"
          >
            <path
              d="M1313.45 168.5C1313.45 289.727 955.24 388 513.365 388C71.4902 388 -286.72 289.727 -286.72 168.5C-286.72 47.2735 71.4902 -51 513.365 -51C955.24 -51 1313.45 47.2735 1313.45 168.5Z"
              fill="#C2C876"
            />
          </svg>
        </div>

        {/* --- Login Card --- */}
        <div
          className="
            relative 
            w-[90%]
            sm:w-[420px]
            md:w-[540px]
            lg:w-[560px]
            xl:w-[640px]
            bg-[#E6E6E6] 
            rounded-3xl 
            shadow-lg 
            flex 
            flex-col 
            items-center 
            px-4 
            pt-0 pb-6 lg:pt-8 lg:pb-12
            z-10
            transition-all 
            text-center
          "
        >
          <img
            src="/Moodboard2.png"
            alt="Pawject Patrol Logo"
            width="250"
            height="128"
            className="object-contain mb-[-30px]"
            // Add a placeholder image in case the src fails
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/250x128/E6E6E6/4E4E4E?text=Logo';
              (e.currentTarget as HTMLImageElement).onerror = null;
            }}
          />
          <h1
            className="text-[32px] font-medium leading-[1.3] tracking-[-0.64px] mb-2"
            style={{
              color: "#3C3333",
              fontFamily: '"Genty Sans", sans-serif',
            }}
          >
            Youth For Animals
          </h1>
          <p
            className="text-base font-normal leading-[1.4] tracking-[-0.16px] mb-4"
            style={{
              color: "#3C3333",
              fontFamily: '"Genty Sans", sans-serif',
            }}
          >
            Welcome YFA Officer!
          </p>

          {/* Error message */}
          {message && (
            <div className="w-full px-4 sm:px-6 mb-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {message}
              </div>
            </div>
          )}

          {/* Form container */}
          <form className="w-full px-4 sm:px-6 space-y-4" onSubmit={handleAdminLogin}>
            {/* Email Input */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="yfaupmindanao@gmail.com"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm p-3 text-sm"
                style={{
                  color: "#3C3333",
                }}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm p-3 text-sm"
                style={{
                  color: "#3C3333", // Fixed typo here
                }}
              />
              <EyeIcon onClick={() => setShowPassword(!showPassword)} />
            </div>

            {/* Forgot Passoword Link
            <div className="text-center">
              <a
                href="#"
                className="text-xs font-semibold leading-[1.4] tracking-[-0.12px] text-[#5E9BBA] hover:underline block"
                style={{
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Forgot Password?
              </a>
            </div>
            */}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#8D52A7] px-4 py-3 text-white text-base font-medium hover:bg-[#7B4692] focus:outline-none focus:ring-2 focus:ring-[#8D52A7] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: '"Genty Sans", sans-serif',
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <a
            href="/"
            className="text-sm font-medium text-[#8D52A7] hover:underline mt-4 block"
          >
            &larr; Go back home
          </a>
        </div>
      </div>
    </main>
  );
}
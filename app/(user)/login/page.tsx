"use client";

import Image from "next/image";
import Link from "next/link";
import { signInWithGoogle } from "@/actions/login/user";
import { useState } from "react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    const result = await signInWithGoogle();

    if (result && !result.success) {
      setError(result.message);
      setIsLoading(false);
    }
    // If successful, user will be redirected automatically
  };

  return (
    // --- 1. MODIFIED THIS LINE ---
    <main className="relative min-h-screen bg-[#E1E69D] flex flex-col items-center justify-center overflow-hidden">
      {/* --- Hero Container  --- */}
      <div className="relative w-full flex flex-col items-center">
        {/* Ellipse Background  */}
        <div className="relative w-full flex justify-center z-0">
          {/* Mobile SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 375 389"
            className="absolute top-0 sm:hidden w-[600px] h-auto top-[-46vh]"
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
            className="absolute hidden sm:block lg:hidden w-[1200px] h-auto top-[-34vh] z-0"
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
            className="absolute hidden lg:block w-full h-auto top-[-40vh]"
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
            z-0
            transition-all 
            text-center
          "
        >
          <Image
            src="/Moodboard2.png"
            alt="Pawject Patrol Logo"
            width={250}
            height={128}
            className="object-contain mb-[-30px]"
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
            }}
          >
            UP MINDANAO
          </p>
          <p
            className="text-xs font-normal leading-[1.4] tracking-[-0.12px] mb-6"
            style={{ color: "#3C3333" }}
          >
            Use your UP email account to sign in
          </p>

          {error && (
            <div className="w-full mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full rounded-lg bg-[#8D52A7] px-4 py-3 text-white text-base font-medium hover:bg-[#7B4692] focus:outline-none focus:ring-2 focus:ring-[#8D52A7] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: '"Genty Sans", sans-serif',
            }}
          >
            {isLoading ? "Redirecting to Google..." : "Login with Google"}
          </button>

          <Link
            href="/"
            className="text-sm font-medium text-[#8D52A7] hover:underline mt-4 block"
          >
            &larr; Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
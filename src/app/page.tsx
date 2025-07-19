"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Calendar from "@/components/Calendar";
import {
  LogOut,
  Calendar as CalendarIcon,
  Github,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Calendar App
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Modern Event Management
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {session ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Welcome, {session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn("github")}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Github size={18} />
                  <span>Sign In with GitHub</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
              {session ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600 px-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Welcome, {session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn("github")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md"
                >
                  <Github size={18} />
                  <span>Sign In with GitHub</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session ? (
          <Calendar />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="w-full">
              {/* Hero Section */}
              <div className="mb-8 max-w-4xl mx-auto px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Modern Calendar Experience</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  Organize Your Life with
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    A Smart Calendar App
                  </span>
                </h2>

                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  A beautiful, modern calendar application that helps you manage
                  events, projects, and stay organized with an intuitive
                  interface.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 w-full max-w-[1400px] mx-auto px-4">
                <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
                    Event Management
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center">
                    Create, edit, and delete events with ease. Drag and drop
                    functionality for seamless scheduling with timezone support.
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
                    Modern Design
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center">
                    Beautiful, responsive design with smooth animations and
                    intuitive user experience across all devices.
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-md p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 group md:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Github className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
                    Secure Login
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center">
                    Secure authentication with GitHub OAuth. Your data is
                    private, protected, and always accessible.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="px-4">
                <button
                  onClick={() => signIn("github")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg font-semibold"
                >
                  <Github size={18} className="sm:w-5 sm:h-5" />
                  <span>Get Started with GitHub</span>
                </button>

                {/* Footer Note */}
                <p className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 text-center">
                  Free to use • No credit card required • Your data stays
                  private
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="backdrop-blur-md border-t border-gray-200 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-gray-600">
            <p className="text-xs sm:text-sm">
              © 2024 Calendar App. Built with Next.js, Prisma, and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

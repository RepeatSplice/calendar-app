"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Calendar from "@/components/Calendar";
import { LogIn, LogOut } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <header className="flex justify-between items-center p-4 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
        {session ? (
          <div className="flex items-center gap-4">
            <p>Welcome, {session.user?.name}</p>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <LogIn size={18} />
            Sign In with GitHub
          </button>
        )}
      </header>
      {session ? (
        <Calendar />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-3xl font-bold mb-4">
            Please sign in to view your calendar.
          </h2>
          <p className="text-lg text-gray-600">
            A modern, multi-user calendar application.
          </p>
        </div>
      )}
    </main>
  );
}

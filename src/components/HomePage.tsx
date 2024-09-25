import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-8 text-gray-900">
          Welcome to Table Tennis Reservations
        </h1>

        <p className="text-lg sm:text-xl mb-8 text-gray-700">
          Find and book the best table tennis venues in your area.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/venues">View Venues</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/about">About Us</Link>
          </Button>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t bg-white">
        <p className="text-gray-600">
          © 2023 Table Tennis Reservations. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

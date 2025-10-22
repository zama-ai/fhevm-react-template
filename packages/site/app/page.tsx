import { FHECounterDemo } from "@/components/FHECounterDemo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        {/* SDK Demo Banner */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">🚀 Universal FHEVM SDK</h1>
            <p className="text-lg opacity-90 mb-4">
              Framework-agnostic SDK for building privacy-preserving dApps
            </p>
            <p className="text-sm opacity-75 mb-4">
              Created by mk83 for Zama Developer Program Bounty Track - October 2025
            </p>
            <Link 
              href="/sdk-demo"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <span className="mr-2">🎮</span>
              Try SDK Demo
            </Link>
          </div>
        </div>

        {/* Original FHEVM Counter Demo */}
        <div className="w-full">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Original FHEVM Counter Demo</h2>
            <p className="text-gray-600 text-sm">
              The original FHEVM React Template demonstration
            </p>
          </div>
          <FHECounterDemo />
        </div>
      </div>
    </main>
  );
}

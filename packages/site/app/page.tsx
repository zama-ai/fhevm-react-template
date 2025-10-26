import { FHECounterDemo } from "@/components/FHECounterDemo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex flex-col gap-16 md:gap-20 items-center w-full px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="w-full max-w-7xl mx-auto text-center">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-16 text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                Zama Developer Program Bounty Track - October 2025
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                🚀 Universal FHEVM SDK
              </h1>
              
              <p className="text-2xl md:text-3xl opacity-90 mb-12 max-w-4xl mx-auto leading-relaxed">
                Framework-agnostic SDK for building privacy-preserving dApps with 
                <span className="font-semibold text-yellow-300"> Fully Homomorphic Encryption</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <Link 
                  href="/sdk-demo" 
                  className="group inline-flex items-center px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg"
                >
                  <span className="mr-4 text-3xl">🎮</span>
                  Try Interactive Demo
                  <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <a 
                  href="https://github.com/83mhpll/fhevm-react-template/tree/bounty-submission-october-2025" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/30 transition-all duration-300 border border-white/30 text-lg"
                >
                  <svg className="mr-3 w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>
              
              <div className="text-lg opacity-75">
                Created by <span className="font-semibold text-yellow-300">mk83</span> • Privacy-First Developer
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose Our SDK?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Built with modern web standards and designed for developer productivity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Framework Agnostic</h3>
              <p className="text-gray-600 leading-relaxed">Works seamlessly with React, Vue, Node.js, and more frameworks. One SDK, multiple platforms.</p>
            </div>
            
            <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🔒</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">Built with Fully Homomorphic Encryption for maximum privacy. Your data stays encrypted even during computation.</p>
            </div>
            
            <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🛠️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Developer Friendly</h3>
              <p className="text-gray-600 leading-relaxed">Wagmi-like API that developers already know and love. Intuitive, well-documented, and TypeScript ready.</p>
            </div>
          </div>
        </div>

        {/* Original Demo Section */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Live Demo
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Original FHEVM Counter Demo
              </h2>
              <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
                Experience the original FHEVM React Template with enhanced UI and modern design
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 border border-blue-100">
              <div className="max-w-2xl mx-auto">
                <FHECounterDemo />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-6xl mx-auto text-center py-16">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Ready to Build Privacy-Preserving dApps?
                </h3>
                <p className="text-gray-600">
                  Get started with our Universal FHEVM SDK today
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/sdk-demo" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200"
                >
                  <span className="mr-2">🚀</span>
                  Try Demo
                </Link>
                
                <a 
                  href="https://github.com/83mhpll/fhevm-react-template/tree/bounty-submission-october-2025" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors duration-200"
                >
                  <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View Source
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-8 pt-8">
              <p className="text-gray-500 text-sm">
                Built with ❤️ for the Zama Developer Program • 
                <span className="font-semibold text-blue-600"> Universal FHEVM SDK</span> by 
                <span className="font-semibold text-purple-600"> mk83</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client'

import { Shield, Github, BookOpen } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cloak SDK</h1>
              <p className="text-sm text-gray-500">Confidential dApps Demo</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://docs.cloak-sdk.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Docs</span>
            </a>
            
            <a
              href="https://github.com/0xNana/cloak-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm">GitHub</span>
            </a>
            
            <appkit-button />
          </div>
        </div>
      </div>
    </header>
  )
}

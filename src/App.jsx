import { useState } from 'react'
import FlightSearch from './components/FlightSearch'

function App() {
  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10 slide-in">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="text-5xl md:text-6xl">✈️</div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white">
              SkyFinder
            </h1>
          </div>
          <p className="text-white/95 text-lg md:text-xl font-medium">
            Discover Your Next Journey - Compare & Book the Best Flights
          </p>
        </header>
        <FlightSearch />
      </div>
    </div>
  )
}

export default App

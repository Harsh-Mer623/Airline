import { useState } from 'react';

function FlightSearch() {
  // State management
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0], // Default to today
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance'); // relevance, price-low, price-high, duration
  const [hasSearched, setHasSearched] = useState(false); // Track if user has clicked search

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.from || !formData.to || !formData.date) {
      setError('Please fill in all fields');
      return;
    }

    setHasSearched(true); // Mark that user has initiated a search
    setLoading(true);
    setError(null);
    setFlights([]);

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: formData.from,
            to: formData.to,
            date: formData.date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }

      const data = await response.json();
      
      // Handle both array response and object with flights property
      const flightData = Array.isArray(data) ? data : data.flights || [];
      setFlights(flightData);

      if (flightData.length === 0) {
        setError('No flights found for your search criteria');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort flights based on selected option
  const getSortedFlights = () => {
    const flightsCopy = [...flights];
    
    switch (sortBy) {
      case 'price-low':
        return flightsCopy.sort((a, b) => {
          const priceA = parseFloat(a.price || a.Price || 0);
          const priceB = parseFloat(b.price || b.Price || 0);
          return priceA - priceB;
        });
      case 'price-high':
        return flightsCopy.sort((a, b) => {
          const priceA = parseFloat(a.price || a.Price || 0);
          const priceB = parseFloat(b.price || b.Price || 0);
          return priceB - priceA;
        });
      case 'duration':
        return flightsCopy.sort((a, b) => {
          const durationA = a.duration || 0;
          const durationB = b.duration || 0;
          return durationA - durationB;
        });
      case 'relevance':
      default:
        return flightsCopy;
    }
  };

  // Format time from ISO string
  const formatTime = (timeString) => {
    if (!timeString) return null;
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return null;
    }
  };

  // Format duration (minutes to hours)
  const formatDuration = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Render individual flight card
  const renderFlightCard = (flight, index) => {
    // Extract data from different possible field names
    const airlineName = flight.airline || flight.name || 'Airline Not Specified';
    const cityFrom = flight.from || flight.City_from || formData.from;
    const cityTo = flight.to || flight.city_to || formData.to;
    const flightDate = flight.date || flight.Date || formData.date;
    const price = flight.price || flight.Price || 'N/A';
    const departureTime = formatTime(flight.departure_time);
    const arrivalTime = formatTime(flight.arrival_time);
    const duration = flight.duration ? formatDuration(flight.duration) : null;
    const status = flight.status || 'scheduled';
    const flightId = flight.id || `flight-${index}`;
    const country = flight.Country;
    const countryCode = flight.countrycode;

    return (
      <div
        key={flightId}
        className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 fade-in group"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Airline Name & Flight ID */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {airlineName.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {airlineName}
            </h3>
          </div>
          {flightId && (
            <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full font-medium border border-gray-200">
              {flightId}
            </span>
          )}
        </div>

        {/* Country Info */}
        {country && (
          <div className="mb-4 flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-sm text-gray-700 font-medium">🌍 {country}</span>
            {countryCode && (
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-bold">
                {countryCode}
              </span>
            )}
          </div>
        )}

        {/* Route */}
        <div className="flex items-center justify-between mb-5 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
          <div className="text-left flex-1">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {departureTime || '••:••'}
            </p>
            <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{cityFrom}</p>
          </div>
          
          <div className="flex-1 px-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="h-0.5 bg-gradient-to-r from-blue-300 to-cyan-300 flex-1"></div>
              <div className="mx-3 text-2xl transform group-hover:translate-x-2 transition-transform">✈️</div>
              <div className="h-0.5 bg-gradient-to-r from-cyan-300 to-blue-300 flex-1"></div>
            </div>
            {duration && (
              <p className="text-xs text-gray-600 font-semibold bg-white px-3 py-1 rounded-full shadow-sm">{duration}</p>
            )}
          </div>

          <div className="text-right flex-1">
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {arrivalTime || '••:••'}
            </p>
            <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{cityTo}</p>
          </div>
        </div>

        {/* Date & Status Row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
            <span className="text-lg">📅</span>
            {new Date(flightDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
              status.toLowerCase() === 'scheduled'
                ? 'bg-green-500 text-white'
                : status.toLowerCase() === 'available'
                ? 'bg-blue-500 text-white'
                : status.toLowerCase() === 'limited'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-400 text-white'
            }`}
          >
            {status}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
          <span className="text-gray-600 font-semibold text-sm">Total Price</span>
          <div className="text-right">
            <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ${typeof price === 'number' ? price.toFixed(2) : price}
            </span>
          </div>
        </div>

        {/* Book Button */}
        <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          Select Flight
        </button>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => {
    return (
      <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl">
        <div className="inline-block w-20 h-20 border-4 border-white border-t-blue-600 rounded-full spinner mb-6 shadow-lg"></div>
        <p className="text-gray-800 text-xl font-bold mb-2">Searching for flights...</p>
        <p className="text-gray-600">Finding the best deals for you</p>
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-3 h-3 bg-blue-500 rounded-full pulse-animation"></div>
          <div className="w-3 h-3 bg-cyan-500 rounded-full pulse-animation" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full pulse-animation" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    return (
      <div className="bg-white/95 backdrop-blur-sm border-2 border-red-300 rounded-2xl p-8 text-center shadow-xl">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-2xl font-bold text-red-600 mb-3">Oops! Something went wrong</h3>
        <p className="text-gray-700 mb-6 text-lg">{error}</p>
        <button
          onClick={() => setError(null)}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          🔄 Try Again
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 mb-8 border border-white/50">
        <form onSubmit={handleSearch} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* From Input */}
            <div>
              <label htmlFor="from" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">🛫</span> From
              </label>
              <input
                type="text"
                id="from"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                placeholder="Departure city"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium hover:border-gray-300"
                required
              />
            </div>

            {/* To Input */}
            <div>
              <label htmlFor="to" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">🛬</span> To
              </label>
              <input
                type="text"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="Destination city"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium hover:border-gray-300"
                required
              />
            </div>

            {/* Date Input */}
            <div>
              <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-lg">📅</span> Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium hover:border-gray-300"
                required
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-blue-400 disabled:to-cyan-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? '🔄 Searching...' : '🔍 Search Flights'}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && renderLoading()}

      {/* Error State */}
      {error && !loading && renderError()}

      {/* Sort Bar & Results Display */}
      {!loading && !error && flights.length > 0 && (
        <div>
          {/* Results Header with Sort Options */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 mb-6 border border-white/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                ✈️ {flights.length} Flight{flights.length !== 1 ? 's' : ''} Available
              </h2>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <label htmlFor="sortBy" className="text-sm font-bold text-gray-700 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold bg-white hover:border-gray-300 cursor-pointer"
                >
                  <option value="relevance">🎯 Relevance</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💎 Price: High to Low</option>
                  <option value="duration">⏱️ Duration: Shortest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Flight Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getSortedFlights().map((flight, index) => renderFlightCard(flight, index))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!loading && !error && flights.length === 0 && hasSearched && (
        <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-800 text-2xl font-bold mb-2">No flights found</p>
          <p className="text-gray-600 text-lg">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}

export default FlightSearch;

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, AlertTriangle, Check, Info, ShieldAlert, HeartPulse } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  'All',
  'Pain Relief',
  'Antibiotics',
  'Cold & Flu',
  'Vitamins',
  'Skin Care',
  'Digestive Health',
  'Diabetes Care',
  'Cardiac Care'
];

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Catalog filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Local notification feedback state (for Cart mock)
  const [cartFeedback, setCartFeedback] = useState({}); // { [medicineId]: true }

  // Fetch medicines dynamically from the backend
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`http://localhost:5000/api/medicines?${params.toString()}`);
        const resData = await response.json();

        if (resData.success) {
          setMedicines(resData.data);
        } else {
          setError(resData.message || 'Failed to fetch medicines directory.');
        }
      } catch (err) {
        console.error('[Medicines Page] Fetch error:', err.message);
        setError('Failed to connect to the server. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchMedicines();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory]);

  const { addToCart } = useCart();

  // Add to cart handler
  const handleAddToCart = (med) => {
    addToCart(med);
    setCartFeedback(prev => ({ ...prev, [med._id]: true }));
    
    // Clear feedback icon after 1.5 seconds
    setTimeout(() => {
      setCartFeedback(prev => {
        const updated = { ...prev };
        delete updated[med._id];
        return updated;
      });
    }, 1500);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-300 mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Page Title & Description */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main font-headings">
            Online Pharmacy <span className="text-primary">Store</span>
          </h1>
          <p className="text-sm text-text-sub font-body mt-2 max-w-xl leading-relaxed">
            Browse our verified inventory of prescription medications and over-the-counter remedies. Filter by medical category for easy searching.
          </p>
        </div>

        {/* Search & Filter Control Bar */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Spaced Search Bar with pl-icon-left helper to prevent overlap */}
          <div className="relative w-full md:max-w-md shadow-sm rounded-xl overflow-hidden bg-transparent flex items-center">
            <span className="absolute left-4 text-text-mute">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by drug name or active chemical ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-icon-left py-4 focus:border-primary border-0 w-full rounded-2xl bg-transparent"
            />
          </div>

          {/* Mobile responsive selector dropdown (hidden on desktop) */}
          <div className="w-full md:w-auto md:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="focus:border-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Main Catalog View Grid */}
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Left Sidebar: Categories selection list */}
          <div className="hidden md:flex lg:flex flex-col gap-2 w-full md:w-64 shrink-0 glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold text-text-main tracking-wider uppercase font-headings mb-3 border-b border-border-color pb-2">
              Categories
            </h3>
            <div className="flex flex-col gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-semibold font-body transition-all duration-300 border-0 ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-text-sub hover:text-primary hover:bg-primary/5 bg-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right Segment: Medicine Products Grid */}
          <div className="grow w-full">
            {loading ? (
              /* SKELETAL INVENTORY GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="glass-panel rounded-3xl p-6 flex flex-col gap-4 animate-pulse">
                    <div className="w-full h-40 bg-border-color rounded-2xl"></div>
                    <div className="h-4 bg-border-color rounded w-3/4"></div>
                    <div className="h-3 bg-border-color rounded w-1/2"></div>
                    <div className="h-3 bg-border-color rounded w-full"></div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-4 bg-border-color rounded w-1/4"></div>
                      <div className="h-10 bg-border-color rounded-2xl w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* ERROR STATE VIEW */
              <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <h3 className="text-lg font-bold text-text-main font-headings">Error Loading Catalog</h3>
                <p className="text-sm text-text-sub font-body max-w-sm">{error}</p>
                <button type="button" onClick={handleResetFilters} className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs">
                  Reload Catalog
                </button>
              </div>
            ) : medicines.length === 0 ? (
              /* EMPTY CATALOG SEARCH RESULTS */
              <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <HeartPulse className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-main font-headings">No Medicines Found</h3>
                <p className="text-sm text-text-sub font-body max-w-sm leading-relaxed">
                  No medical products match your current keyword search or active category filters.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-primary px-6 py-3 rounded-xl text-xs font-semibold mt-2"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* MEDICINES PRODUCT DECK */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {medicines.map((med) => {
                  const isAdded = cartFeedback[med._id];
                  const isOutOfStock = med.stock === 0;

                  return (
                    <div 
                      key={med._id}
                      className="glass-panel rounded-3xl p-5 flex flex-col justify-between gap-4 hover:border-primary hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Product Image Frame */}
                      <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-bg-secondary/50 flex items-center justify-center border border-border-color">
                        {med.imageUrl ? (
                          <img 
                            src={med.imageUrl} 
                            alt={med.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <HeartPulse className="w-12 h-12 text-primary/20" />
                        )}

                        {/* Prescription Required Badge (Rx) */}
                        {med.isPrescriptionRequired && (
                          <span className="absolute top-3 left-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wider uppercase flex items-center gap-1 backdrop-blur-md">
                            <ShieldAlert className="w-3. h-3" /> Rx Required
                          </span>
                        )}
                        
                        {/* Out of Stock Ribbon */}
                        {isOutOfStock && (
                          <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-extrabold tracking-widest uppercase font-body">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Info Details Segment */}
                      <div className="grow flex flex-col justify-between gap-1.5">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-base text-text-main truncate group-hover:text-primary transition-colors font-headings">
                              {med.name}
                            </h3>
                            <span className="shrink-0 inline-block px-2 py-0.5 bg-bg-secondary border border-border-color text-text-sub text-[8px] font-bold uppercase rounded-md font-body tracking-wide">
                              {med.category}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-text-mute font-body font-semibold mt-0.5">
                            By {med.manufacturer}
                          </p>

                          <p className="text-xs text-text-sub font-body leading-relaxed line-clamp-2 mt-2">
                            {med.description}
                          </p>
                        </div>

                        {/* Active Ingredients list tags */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {med.activeIngredients.map((ing) => (
                            <span 
                              key={ing} 
                              className="text-[9px] font-bold text-text-sub bg-primary/5 px-2 py-0.5 rounded-md font-body"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer segment (Price + Action Button) */}
                      <div className="flex items-center justify-between pt-3 border-t border-border-color mt-1">
                        <div>
                          <p className="text-[9px] text-text-mute font-body tracking-wider uppercase font-semibold">Retail Price</p>
                          <p className="text-base font-extrabold text-text-main font-headings flex items-center mt-0.5">
                            <span className="text-xs text-primary font-bold mr-0.5">Rs</span>
                            {med.price}
                          </p>
                        </div>

                        {/* Add to Cart Action */}
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCart(med)}
                          className={`btn rounded-2xl py-3 px-5 text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 border-0 ${
                            isOutOfStock
                              ? 'bg-bg-secondary text-text-mute cursor-not-allowed'
                              : isAdded
                                ? 'bg-success text-white'
                                : 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 animate-scale-in" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Medicines;

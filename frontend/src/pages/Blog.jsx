import React, { useState, useEffect } from 'react';
import { Search, Clock, User, ArrowRight, X, AlertCircle, HeartPulse, Tag } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Nutrition',
  'Mental Health',
  'Exercise',
  'Cardiology',
  'General Wellness'
];

function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Blog filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('');

  // Detail Modal reader states
  const [readerModalOpen, setReaderModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Fetch articles dynamically from the backend
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (selectedTag) params.append('tag', selectedTag);
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`http://localhost:5000/api/blogs?${params.toString()}`);
        const resData = await response.json();

        if (resData.success) {
          setArticles(resData.data);
        } else {
          setError(resData.message || 'Failed to fetch health articles feed.');
        }
      } catch (err) {
        console.error('[Blog Page] Fetch error:', err.message);
        setError('Failed to connect to the server. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchArticles();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory, selectedTag]);

  // Click card trigger to open modal reader
  const handleReadArticleClick = (article) => {
    setSelectedArticle(article);
    setReaderModalOpen(true);
  };

  // Helper to click tags and filter feed instantly
  const handleTagClick = (tagVal, e) => {
    e.stopPropagation(); // Stop parent card click trigger
    setSelectedTag(tagVal);
    // Reset other filters
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTag('');
  };

  const handleCloseReader = () => {
    setReaderModalOpen(false);
    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-300 mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Page Header */}
        <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main font-headings">
              Health & Wellness <span className="text-primary">Blog</span>
            </h1>
            <p className="text-sm text-text-sub font-body mt-2 max-w-xl leading-relaxed">
              Explore professional articles, nutritional tips, and medical advice compiled by our clinical specialists.
            </p>
          </div>

          {/* Active Tag filter indicator */}
          {selectedTag && (
            <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-2.5 rounded-2xl flex items-center gap-2 self-center text-xs font-semibold font-body animate-scale-in">
              <Tag className="w-4 h-4" />
              Tag: {selectedTag}
              <button 
                type="button" 
                onClick={() => setSelectedTag('')}
                className="text-primary hover:text-text-main ml-1 bg-transparent border-0 cursor-pointer p-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Search & Category Filter Navigation Control Bar */}
        <div className="w-full flex flex-col gap-4">
          
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md shadow-sm rounded-xl overflow-hidden bg-transparent flex items-center">
            <span className="absolute left-4 text-text-mute">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by keywords, tags, or article titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-icon-left py-4 focus:border-primary border-0 w-full rounded-2xl bg-transparent"
            />
          </div>

          {/* Categories navigation selector buttons row */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedTag(''); // Clear tag filter when picking main category
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-body transition-all duration-300 border border-border-color ${
                  selectedCategory === cat
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/15'
                    : 'bg-bg-base/50 text-text-sub hover:text-primary hover:bg-primary/5 hover:border-primary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Main Feed Content Panel */}
        <div className="w-full">
          {loading ? (
            /* SKELETAL ARTICLES GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="glass-panel rounded-3xl p-5 flex flex-col gap-4 animate-pulse">
                  <div className="w-full h-44 bg-border-color rounded-2xl"></div>
                  <div className="h-5 bg-border-color rounded w-5/6"></div>
                  <div className="h-4 bg-border-color rounded w-2/3"></div>
                  <div className="h-3 bg-border-color rounded w-full mt-2"></div>
                  <div className="h-3 bg-border-color rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* ERROR STATE VIEW */
            <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-danger" />
              </div>
              <h3 className="text-lg font-bold text-text-main font-headings">Error Loading Blog</h3>
              <p className="text-sm text-text-sub font-body max-w-sm">{error}</p>
              <button type="button" onClick={handleResetFilters} className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs">
                Reload Directory
              </button>
            </div>
          ) : articles.length === 0 ? (
            /* EMPTY SEARCH RESULTS */
            <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <HeartPulse className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-main font-headings">No Articles Found</h3>
              <p className="text-sm text-text-sub font-body max-w-sm leading-relaxed">
                No health articles match your active filters, tag selections, or keyword searches.
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
            /* BLOG CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((article) => {
                return (
                  <div
                    key={article._id}
                    onClick={() => handleReadArticleClick(article)}
                    className="glass-panel rounded-3xl p-5 flex flex-col justify-between gap-4 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                  >
                    {/* Cover Image Frame */}
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-bg-secondary/50 flex items-center justify-center border border-border-color">
                      {article.imageUrl ? (
                        <img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <HeartPulse className="w-12 h-12 text-primary/20" />
                      )}
                      
                      {/* Category Badge overlay */}
                      <span className="absolute top-3 left-3 bg-primary/15 text-primary border border-primary/20 px-2.5 py-1 rounded-lg text-[9px] font-extrabold tracking-wider uppercase backdrop-blur-md">
                        {article.category}
                      </span>
                    </div>

                    {/* Info content */}
                    <div className="grow flex flex-col justify-between gap-3">
                      <div>
                        {/* Meta: Author + Date */}
                        <div className="flex items-center gap-2 text-[10px] text-text-mute font-body font-semibold">
                          <span>{article.author.name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-secondary" /> {article.readTime}
                          </span>
                        </div>

                        <h3 className="font-bold text-base text-text-main group-hover:text-primary transition-colors font-headings mt-2 line-clamp-2 leading-snug">
                          {article.title}
                        </h3>
                        
                        <p className="text-xs text-text-sub font-body leading-relaxed line-clamp-3 mt-2">
                          {article.content}
                        </p>
                      </div>

                      {/* Keyword tags list */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {article.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => handleTagClick(tag, e)}
                            className="text-[9px] font-bold text-text-sub bg-bg-secondary/60 hover:text-primary hover:bg-primary/5 border border-border-color px-2 py-0.5 rounded-md font-body transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Footer Call to Action link */}
                    <div className="flex items-center justify-between pt-3 border-t border-border-color mt-1">
                      <span className="text-xs font-bold text-primary group-hover:text-primary-hover flex items-center gap-1 font-body">
                        Read Full Article
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* READING MODAL READER OVERLAY */}
      {readerModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-2xl bg-bg-base border border-border-color rounded-3xl shadow-2xl relative max-h-[85vh] overflow-hidden flex flex-col animate-scale-in">
            
            {/* Scrollable Content Container */}
            <div className="w-full h-full overflow-y-auto p-8 pr-6 custom-scrollbar flex flex-col gap-6 relative">
              
              {/* Close trigger button */}
              <button
                type="button"
                onClick={handleCloseReader}
                className="absolute top-5 right-5 text-text-sub hover:text-text-main bg-bg-secondary/85 border border-border-color p-2 rounded-full transition-colors z-20 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
              {/* Reading header details */}
              <div className="flex flex-col gap-2.5">
                {/* Category indicator tag */}
                <span className="self-start inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg font-body tracking-wider">
                  {selectedArticle.category}
                </span>

                <h2 className="text-xl md:text-2xl font-extrabold text-text-main font-headings leading-tight mt-1">
                  {selectedArticle.title}
                </h2>

                {/* Author credentials by-line details bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-b border-border-color pb-3">
                  <div className="flex items-center gap-3">
                    {/* Author avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                      {selectedArticle.author.imageUrl ? (
                        <img 
                          src={selectedArticle.author.imageUrl} 
                          alt={selectedArticle.author.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-main font-body">{selectedArticle.author.name}</p>
                      <p className="text-[10px] text-text-mute font-body">{selectedArticle.author.title}</p>
                    </div>
                  </div>
                  
                  {/* Read time badge details */}
                  <div className="flex items-center gap-1.5 text-xs text-text-sub font-body font-semibold">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span>{selectedArticle.readTime}</span>
                  </div>
                </div>
              </div>

              {/* Big cover photo details */}
              {selectedArticle.imageUrl && (
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-border-color shrink-0">
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Main Long-Form Article Text Content */}
              <p className="text-sm text-text-sub font-body leading-relaxed text-left whitespace-pre-line">
                {selectedArticle.content}
              </p>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border-color">
                {selectedArticle.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="text-xs font-bold text-text-mute bg-bg-secondary border border-border-color px-3 py-1 rounded-xl font-body"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Blog;

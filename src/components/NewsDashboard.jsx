import React, { useState } from "react";
import { Search, RefreshCw, ExternalLink, Calendar, User } from "lucide-react";
import NewsChart from "./NewsChart";

export default function NewsDashboard({ articles, loading, error, refresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'source'

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex flex-col items-center">
        <p className="mb-4">Failed to load news: {error}</p>
        <button onClick={refresh} className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  // Filter and sort
  let filtered = articles.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (categoryFilter) {
    filtered = filtered.filter(a => a.category === categoryFilter);
  }

  if (sortBy === "source") {
    filtered.sort((a, b) => (a.source?.name || "").localeCompare(b.source?.name || ""));
  } else {
    filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  // Show 5 articles, but keep total in mind (pagination could be added, but prompt says "Show 5 articles (total 10)")
  const displayArticles = filtered.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-2xl font-bold">Latest Space & Tech News</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search news..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="date">Latest</option>
            <option value="source">Source</option>
          </select>
          <button 
            onClick={refresh} 
            disabled={loading}
            className="p-2 bg-card border border-border rounded-lg hover:bg-accent text-foreground disabled:opacity-50 transition-colors"
            title="Refresh News"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {categoryFilter && (
            <div className="flex items-center justify-between bg-primary/10 text-primary px-4 py-2 rounded-lg">
              <span>Filtering by category: <strong>{categoryFilter}</strong></span>
              <button onClick={() => setCategoryFilter(null)} className="text-sm underline">Clear Filter</button>
            </div>
          )}
          
          {loading && articles.length === 0 ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg bg-card animate-pulse">
                <div className="w-full sm:w-48 h-32 bg-muted rounded-md shrink-0"></div>
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-16 bg-muted rounded w-full mt-4"></div>
                </div>
              </div>
            ))
          ) : displayArticles.length > 0 ? (
            displayArticles.map((article, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow group">
                {article.urlToImage && (
                  <div className="w-full sm:w-48 h-32 shrink-0 rounded-md overflow-hidden bg-muted">
                    <img src={article.urlToImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                      {article.category || "News"}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight mb-2 text-card-foreground line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{article.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground max-w-[200px] truncate">
                      <User size={12} />
                      <span className="truncate">{article.author || article.source?.name || "Unknown Author"}</span>
                    </div>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      Read More <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-card rounded-lg border border-border text-muted-foreground">
              No articles found. Try adjusting your search.
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <NewsChart articles={articles} onCategoryClick={(cat) => setCategoryFilter(cat)} />
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const CACHE_KEY = "newsdata_dashboard_cache_v2";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const CATEGORIES = ["technology", "science", "top"];

export function useNewsData() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      // Check cache first
      if (!force) {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (Date.now() - cached.timestamp < CACHE_DURATION) {
            setArticles(cached.data);
            setLoading(false);
            return;
          }
        }
      }

      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) {
        throw new Error("Missing VITE_NEWS_API_KEY in .env");
      }

      // Fetch from NewsData.io for multiple categories
      let allArticles = [];

      for (const cat of CATEGORIES) {
        const res = await axios.get(
          `https://newsdata.io/api/1/news?apikey=${apiKey}&category=${cat}&language=en`
        );
        if (res.data && res.data.results) {
          const catArticles = res.data.results.map(a => ({
            title: a.title,
            description: a.description || "No description available.",
            urlToImage: a.image_url,
            url: a.link,
            publishedAt: a.pubDate,
            author: a.creator ? a.creator.join(", ") : null,
            source: { name: a.source_name || a.source_id },
            category: cat // manually tag the category
          })).filter(a => a.title);
          allArticles = [...allArticles, ...catArticles];
        }
      }

      // Sort by published date descending
      allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: allArticles
      }));

      setArticles(allArticles);
    } catch (err) {
      console.error("Failed to fetch news", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, refresh: () => fetchNews(true) };
}

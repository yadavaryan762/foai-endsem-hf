import React, { useState, useEffect } from "react";
import { Moon, Sun, Rocket, Users } from "lucide-react";
import { useISSData } from "./hooks/useISSData";
import { useNewsData } from "./hooks/useNewsData";
import ISSMap from "./components/ISSMap";
import ISSSpeedChart from "./components/ISSSpeedChart";
import NewsDashboard from "./components/NewsDashboard";
import Chatbot from "./components/Chatbot";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const issData = useISSData();
  const newsData = useNewsData();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const dashboardContext = {
    iss: {
      position: issData.position,
      trajectory: issData.trajectory,
      locationName: issData.locationName,
      astronauts: issData.astronauts
    },
    news: {
      articles: newsData.articles
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Rocket size={24} className="animate-pulse" />
            <span className="text-xl font-bold tracking-tight text-foreground">SpaceTracker</span>
          </div>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-muted hover:bg-muted/80 text-foreground transition-colors"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* ISS Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Live ISS Tracking</h2>
              <p className="text-muted-foreground mt-1">Real-time location, speed, and trajectory of the International Space Station.</p>
            </div>
            {/* Astronauts Card */}
            <div className="bg-card border border-border px-4 py-3 rounded-lg shadow-sm flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <Users size={20} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase">People in Space</div>
                <div className="text-lg font-bold">{issData.astronauts.total}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ISSMap position={issData.position} trajectory={issData.trajectory} />
              
              {/* Stats Bar */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-card border border-border rounded-lg text-center shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1">Latitude</div>
                  <div className="font-mono font-semibold">{issData.position?.lat?.toFixed(4) || "---"}°</div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg text-center shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1">Longitude</div>
                  <div className="font-mono font-semibold">{issData.position?.lng?.toFixed(4) || "---"}°</div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg text-center shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1">Current Speed</div>
                  <div className="font-mono font-semibold text-primary">
                    {issData.trajectory.length > 0 ? Math.round(issData.trajectory[issData.trajectory.length - 1].speed) : 0} km/h
                  </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg text-center shadow-sm">
                  <div className="text-xs text-muted-foreground mb-1">Nearest Place</div>
                  <div className="font-semibold text-sm truncate px-2" title={issData.locationName}>{issData.locationName}</div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <ISSSpeedChart data={issData.speedHistory} />
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* News Section */}
        <section>
          <NewsDashboard 
            articles={newsData.articles} 
            loading={newsData.loading} 
            error={newsData.error} 
            refresh={newsData.refresh} 
          />
        </section>

      </main>

      <Chatbot dashboardContext={dashboardContext} />
    </div>
  );
}

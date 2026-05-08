import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { calculateDistance, calculateSpeed } from "../lib/utils";

const ISS_URL = "http://api.open-notify.org/iss-now.json";
const ASTROS_URL = "http://api.open-notify.org/astros.json";
const GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse?format=json&zoom=10"; // free API

export function useISSData() {
  const [position, setPosition] = useState(null);
  const [trajectory, setTrajectory] = useState([]); // [{lat, lng, speed, timestamp}]
  const [speedHistory, setSpeedHistory] = useState([]); // [{time, speed}]
  const [locationName, setLocationName] = useState("Ocean/Unknown");
  const [astronauts, setAstronauts] = useState({ total: 0, names: [] });
  const [loading, setLoading] = useState(true);

  // Fetch astronauts once
  useEffect(() => {
    async function fetchAstros() {
      try {
        const res = await axios.get(ASTROS_URL);
        if (res.data.message === "success") {
          setAstronauts({
            total: res.data.number,
            names: res.data.people.map(p => p.name),
          });
        }
      } catch (err) {
        console.error("Failed to fetch astronauts", err);
      }
    }
    fetchAstros();
  }, []);

  const fetchGeocode = async (lat, lon) => {
    try {
      const res = await axios.get(`${GEOCODE_URL}&lat=${lat}&lon=${lon}`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      if (res.data && res.data.address) {
        const addr = res.data.address;
        setLocationName(
          addr.city || addr.town || addr.village || addr.state || addr.country || "Ocean/Unknown"
        );
      } else {
        setLocationName("Ocean/Unknown");
      }
    } catch (err) {
      console.error("Geocode error", err);
    }
  };

  const fetchPosition = useCallback(async () => {
    try {
      const res = await axios.get(ISS_URL);
      if (res.data.message === "success") {
        const timestamp = res.data.timestamp; // in seconds
        const lat = parseFloat(res.data.iss_position.latitude);
        const lng = parseFloat(res.data.iss_position.longitude);
        const newPos = { lat, lng, timestamp };

        setPosition((prev) => {
          let currentSpeed = 0;
          if (prev) {
            const dist = calculateDistance(prev.lat, prev.lng, lat, lng);
            const timeDiff = timestamp - prev.timestamp; // seconds
            currentSpeed = calculateSpeed(dist, timeDiff);
            
            // Handle edge case if same timestamp is returned or api glitches
            if (timeDiff <= 0) currentSpeed = trajectory.length > 0 ? trajectory[trajectory.length - 1].speed : 0;
          }

          const point = { lat, lng, speed: currentSpeed, timestamp };

          setTrajectory((prevTraj) => {
            const nextTraj = [...prevTraj, point];
            // keep last 15 positions
            return nextTraj.slice(-15);
          });

          setSpeedHistory((prevHist) => {
            if (currentSpeed === 0 && prevHist.length === 0) return prevHist;
            const date = new Date(timestamp * 1000);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const nextHist = [...prevHist, { time: timeStr, speed: Math.round(currentSpeed) }];
            // keep last 30 positions
            return nextHist.slice(-30);
          });

          return newPos;
        });

        // also update location
        await fetchGeocode(lat, lng);
      }
    } catch (err) {
      console.error("Failed to fetch ISS position", err);
    } finally {
      setLoading(false);
    }
  }, [trajectory]); // Note: using function updaters mostly, so trajectory in dep is mostly safe.

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [fetchPosition]);

  return {
    position,
    trajectory,
    speedHistory,
    locationName,
    astronauts,
    loading,
    refresh: fetchPosition
  };
}

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function NewsChart({ articles, onCategoryClick }) {
  if (!articles || articles.length === 0) {
    return <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg text-sm text-muted-foreground animate-pulse">Waiting for news data...</div>;
  }

  // Calculate distribution
  const counts = articles.reduce((acc, article) => {
    const cat = article.category || "general";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(counts).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: counts[key]
  }));

  return (
    <div className="h-[300px] w-full bg-card border border-border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2 text-card-foreground">News Distribution</h3>
      <p className="text-xs text-muted-foreground mb-2">Click a slice to filter articles</p>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            onClick={(data) => {
              if (onCategoryClick) onCategoryClick(data.name.toLowerCase());
            }}
            className="cursor-pointer outline-none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)', borderRadius: '8px' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

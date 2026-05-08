import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ISSSpeedChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center bg-muted rounded-lg text-sm text-muted-foreground animate-pulse">Waiting for speed data...</div>;
  }

  return (
    <div className="h-[300px] w-full bg-card border border-border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-card-foreground">ISS Speed History</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#8884d8" opacity={0.2} />
          <XAxis dataKey="time" stroke="#888" fontSize={12} tickMargin={10} />
          <YAxis stroke="#888" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `${v} km/h`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)', borderRadius: '8px' }}
            formatter={(value) => [`${value} km/h`, 'Speed']}
          />
          <Line type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

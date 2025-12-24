import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface ChartDataPoint {
  date: string;
  UserIQ: number | null;
  GPTIQ: number | null;
  ConversationIQ: number | null;
}

interface FuturisticTrendsChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative backdrop-blur-xl bg-black/80 border border-white/20 rounded-xl p-4 shadow-2xl"
        style={{
          boxShadow: "0 0 40px rgba(255,255,255,0.1), 0 0 80px rgba(99,102,241,0.1)",
        }}
      >
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-amber-500/20 blur-sm -z-10" />
        
        <p className="text-white/60 text-xs uppercase tracking-wider mb-3 font-medium">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ 
                  backgroundColor: entry.color,
                  boxShadow: `0 0 8px ${entry.color}80`,
                }}
              />
              <span className="text-white/80 text-sm flex-1">{entry.name}</span>
              <span className="font-bold text-white text-sm">{entry.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-6 pt-6">
      {payload?.map((entry: any, index: number) => (
        <div 
          key={index} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: entry.color,
              boxShadow: `0 0 10px ${entry.color}60`,
            }}
          />
          <span className="text-white/80 text-xs font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const FuturisticTrendsChart = ({ data }: FuturisticTrendsChartProps) => {
  return (
    <div className="relative w-full">
      {/* Ambient glow background */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/2 w-96 h-48 bg-amber-500/10 rounded-full blur-[80px] -translate-x-1/2" />
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            {/* Gradient for UserIQ line */}
            <linearGradient id="userIQGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            
            {/* Gradient for GPTIQ line */}
            <linearGradient id="gptIQGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            
            {/* Gradient for ConversationIQ line */}
            <linearGradient id="convIQGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Glow filters */}
            <filter id="userIQGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="gptIQGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="convIQGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.05)" 
            vertical={false}
          />
          
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          
          <YAxis 
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            domain={[0, 100]}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          
          {/* UserIQ Line with glow */}
          <Line 
            type="monotone" 
            dataKey="UserIQ" 
            stroke="url(#userIQGradient)" 
            strokeWidth={3} 
            dot={{ 
              r: 4, 
              strokeWidth: 2, 
              fill: "#0f172a",
              stroke: "#3b82f6",
            }}
            activeDot={{ 
              r: 8, 
              strokeWidth: 3,
              fill: "#3b82f6",
              stroke: "#fff",
            }}
            name="User IQ"
            filter="url(#userIQGlow)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
          
          {/* GPTIQ Line with glow */}
          <Line 
            type="monotone" 
            dataKey="GPTIQ" 
            stroke="url(#gptIQGradient)" 
            strokeWidth={3} 
            dot={{ 
              r: 4, 
              strokeWidth: 2, 
              fill: "#0f172a",
              stroke: "#10b981",
            }}
            activeDot={{ 
              r: 8, 
              strokeWidth: 3,
              fill: "#10b981",
              stroke: "#fff",
            }}
            name="GPT IQ"
            filter="url(#gptIQGlow)"
            animationDuration={1500}
            animationEasing="ease-out"
            animationBegin={200}
          />
          
          {/* ConversationIQ Line with glow */}
          <Line 
            type="monotone" 
            dataKey="ConversationIQ" 
            stroke="url(#convIQGradient)" 
            strokeWidth={3} 
            dot={{ 
              r: 4, 
              strokeWidth: 2, 
              fill: "#0f172a",
              stroke: "#f59e0b",
            }}
            activeDot={{ 
              r: 8, 
              strokeWidth: 3,
              fill: "#f59e0b",
              stroke: "#fff",
            }}
            name="Conversation IQ"
            filter="url(#convIQGlow)"
            animationDuration={1500}
            animationEasing="ease-out"
            animationBegin={400}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FuturisticTrendsChart;

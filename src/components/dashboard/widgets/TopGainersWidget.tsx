export function TopGainersWidget() {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex-shrink-0">Top gainers</h2>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full h-full bg-black rounded-2xl flex items-end p-4 relative overflow-hidden">
          <svg className="w-full h-full absolute inset-0 p-4" viewBox="0 0 200 80" preserveAspectRatio="none">
            <path 
              d="M 0,60 Q 30,40 50,45 T 100,35 T 150,25 T 200,20" 
              fill="none" 
              stroke="hsl(var(--success))" 
              strokeWidth="2"
            />
            <path 
              d="M 0,60 Q 30,40 50,45 T 100,35 T 150,25 T 200,20 L 200,80 L 0,80 Z" 
              fill="url(#greenGradient)" 
              opacity="0.3"
            />
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white/60 text-xs absolute bottom-3 left-3 z-10">15 April - 21 April</span>
        </div>
      </div>
    </div>
  );
}
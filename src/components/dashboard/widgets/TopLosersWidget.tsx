export function TopLosersWidget() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <h2 className="text-lg sm:text-xl font-bold mb-3 flex-shrink-0">Top losers</h2>
      <div className="flex justify-center items-center flex-1 min-h-0">
        <div className="w-full h-full max-h-32 bg-black rounded-2xl flex items-end p-3 relative">
          <svg className="w-full h-full absolute inset-0 p-3" viewBox="0 0 200 80" preserveAspectRatio="none">
            <path 
              d="M 0,20 Q 30,30 50,35 T 100,45 T 150,55 T 200,60" 
              fill="none" 
              stroke="hsl(var(--destructive))" 
              strokeWidth="2"
            />
            <path 
              d="M 0,20 Q 30,30 50,35 T 100,45 T 150,55 T 200,60 L 200,80 L 0,80 Z" 
              fill="url(#redGradient)" 
              opacity="0.3"
            />
            <defs>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-white/60 text-xs absolute bottom-2 left-2">15 April - 21 April</span>
        </div>
      </div>
    </div>
  );
}
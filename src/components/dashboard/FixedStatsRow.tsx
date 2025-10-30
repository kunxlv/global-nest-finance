export function FixedStatsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* NET WORTH */}
      <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/70">NET WORTH</span>
            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
              +11.9%
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">$ 37,457.4</p>
        </div>
      </div>

      {/* ASSETS */}
      <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/70">ASSETS</span>
            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
              +29.1%
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">$ 52,257.2</p>
        </div>
      </div>

      {/* DEBT */}
      <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/70">DEBT</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold">$ 14,799.8</p>
        </div>
      </div>

      {/* GO PRO Card */}
      <div className="bg-[#2a2a2a] rounded-3xl p-6 text-white flex flex-col items-center justify-center text-center">
        <p className="text-sm mb-4 text-white/90">
          Get more features<br />and strategies.
        </p>
        <button className="bg-white text-[#2a2a2a] px-6 py-2 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors">
          GO PRO
        </button>
      </div>
    </div>
  );
}

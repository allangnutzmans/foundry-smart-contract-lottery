import { TimeObject } from "@/hooks/useRaffleState";

export default function CountdownTimer({ timeLeft }: { timeLeft: TimeObject }) {
  return (
    <div className="flex space-x-[0.1em]">
      {/* Hours */}
      <div className="bg-purple-900/60 backdrop-blur-sm rounded-l-lg py-3 px-6 border border-purple-700/50">
        <div className="text-2xl font-bold text-white text-center">
          {timeLeft.hours.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-purple-300 text-center font-medium">Hour</div>
      </div>

      {/* Minutes */}
      <div className="bg-purple-900/60 backdrop-blur-sm py-3 px-6 border border-purple-700/50">
        <div className="text-2xl font-bold text-white text-center">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-purple-300 text-center font-medium">Min</div>
      </div>

      {/* Seconds */}
      <div className="bg-purple-900/60 backdrop-blur-sm rounded-r-lg py-3 px-6 border border-purple-700/50">
        <div className="text-2xl font-bold text-white text-center">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-purple-300 text-center font-medium">Sec</div>
      </div>
    </div>
  );
}

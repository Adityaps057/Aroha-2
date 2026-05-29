import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showA, setShowA] = useState(false);
  const [showFullName, setShowFullName] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show "A" after 500ms
    const aTimer = setTimeout(() => {
      setShowA(true);
    }, 500);

    // Show full "AROHA" after 2500ms
    const fullNameTimer = setTimeout(() => {
      setShowFullName(true);
    }, 2500);

    // Start fade out after 5000ms
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 5000);

    // Complete animation after 6000ms
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(aTimer);
      clearTimeout(fullNameTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50 transition-opacity duration-1000 overflow-hidden p-4 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 md:w-96 sm:h-72 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 md:w-96 sm:h-80 md:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="text-center relative z-10 w-full max-w-2xl px-4">
        {/* Animated Symbol */}
        <div
          className={`transition-all duration-1000 ease-out ${
            showA
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-50 rotate-180"
          }`}
        >
          {!showFullName ? (
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-7xl sm:text-8xl md:text-9xl shadow-2xl border border-white/20 transform hover:scale-110 transition-transform duration-700">
              🕉️
            </div>
          ) : (
            <div
              className={`transition-all duration-1500 ease-out ${
                showFullName
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-20 scale-90"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center text-4xl sm:text-5xl md:text-6xl border border-white/20 shadow-2xl">
                  🕉️
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    AROHA
                  </h1>
                  <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-white/90 tracking-[0.2em] sm:tracking-[0.3em] font-bold mt-1 sm:mt-2 animate-pulse">
                    HERITAGE EXPLORER
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-bounce shadow-lg"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "200ms" }}></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-indigo-400 rounded-full animate-bounce shadow-lg" style={{ animationDelay: "400ms" }}></div>
              </div>
              <p className="text-white/70 text-sm sm:text-base md:text-lg mt-4 sm:mt-6 font-light animate-pulse">
                Initializing...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

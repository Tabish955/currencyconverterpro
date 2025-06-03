
import { useState, useEffect } from "react";
import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { ArrowDownUp, Sparkles, TrendingUp, Globe, Zap, Star } from "lucide-react";

const Index = () => {
  // Parse URL parameters for deep linking
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');
    
    console.log('URL params:', { from, to, amount });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4 overflow-hidden relative">
      {/* Professional Live Background System */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary live gradient layers */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-blue-400/15 via-purple-400/15 to-pink-400/15 rounded-full blur-3xl transform -translate-y-1/4 translate-x-1/4 animate-live-float-1"></div>
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-purple-400/15 via-green-400/15 to-blue-400/15 rounded-full blur-3xl transform translate-y-1/4 -translate-x-1/4 animate-live-float-2"></div>
        <div className="absolute top-1/2 left-1/2 w-[35rem] h-[35rem] bg-gradient-to-r from-green-400/10 via-yellow-400/10 to-orange-400/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-live-float-3"></div>
        
        {/* Secondary enhancement layers */}
        <div className="absolute top-1/4 right-1/3 w-[25rem] h-[25rem] bg-gradient-to-l from-cyan-400/8 via-blue-500/8 to-indigo-500/8 rounded-full blur-3xl animate-live-pulse-1"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[30rem] h-[30rem] bg-gradient-to-r from-pink-400/6 via-purple-500/6 to-blue-500/6 rounded-full blur-3xl animate-live-pulse-2"></div>
        
        {/* Professional particle system */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-${2 + Math.floor(Math.random() * 4)} h-${2 + Math.floor(Math.random() * 4)} rounded-full opacity-60`}
            style={{
              background: `linear-gradient(${Math.random() * 360}deg, 
                rgba(${100 + Math.floor(Math.random() * 155)}, ${100 + Math.floor(Math.random() * 155)}, ${200 + Math.floor(Math.random() * 55)}, 0.7), 
                rgba(${150 + Math.floor(Math.random() * 105)}, ${100 + Math.floor(Math.random() * 155)}, ${200 + Math.floor(Math.random() * 55)}, 0.5))`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `live-particle-float-${(i % 4) + 1} ${15 + Math.random() * 20}s linear infinite, live-color-shift ${8 + Math.random() * 12}s ease-in-out infinite`,
              boxShadow: `0 0 ${10 + Math.random() * 20}px rgba(${100 + Math.floor(Math.random() * 155)}, ${100 + Math.floor(Math.random() * 155)}, ${200 + Math.floor(Math.random() * 55)}, 0.6)`
            }}
          />
        ))}
      </div>
      
      {/* Professional Live Effects Styles */}
      <style>
        {`
        @keyframes live-float-1 {
          0% { 
            transform: translateY(-25%) translateX(25%) rotate(0deg) scale(1);
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
          }
          25% { 
            transform: translateY(-35%) translateX(35%) rotate(90deg) scale(1.1);
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15), rgba(34, 197, 94, 0.15));
          }
          50% { 
            transform: translateY(-15%) translateX(15%) rotate(180deg) scale(0.9);
            background: linear-gradient(225deg, rgba(236, 72, 153, 0.15), rgba(34, 197, 94, 0.15), rgba(251, 191, 36, 0.15));
          }
          75% { 
            transform: translateY(-30%) translateX(30%) rotate(270deg) scale(1.05);
            background: linear-gradient(315deg, rgba(34, 197, 94, 0.15), rgba(251, 191, 36, 0.15), rgba(59, 130, 246, 0.15));
          }
          100% { 
            transform: translateY(-25%) translateX(25%) rotate(360deg) scale(1);
            background: linear-gradient(405deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
          }
        }
        
        @keyframes live-float-2 {
          0% { 
            transform: translateY(25%) translateX(-25%) rotate(0deg) scale(1);
            background: linear-gradient(-45deg, rgba(139, 92, 246, 0.15), rgba(34, 197, 94, 0.15), rgba(59, 130, 246, 0.15));
          }
          33% { 
            transform: translateY(35%) translateX(-35%) rotate(120deg) scale(1.15);
            background: linear-gradient(-75deg, rgba(34, 197, 94, 0.15), rgba(251, 191, 36, 0.15), rgba(236, 72, 153, 0.15));
          }
          66% { 
            transform: translateY(15%) translateX(-15%) rotate(240deg) scale(0.85);
            background: linear-gradient(-105deg, rgba(251, 191, 36, 0.15), rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15));
          }
          100% { 
            transform: translateY(25%) translateX(-25%) rotate(360deg) scale(1);
            background: linear-gradient(-135deg, rgba(139, 92, 246, 0.15), rgba(34, 197, 94, 0.15), rgba(59, 130, 246, 0.15));
          }
        }
        
        @keyframes live-float-3 {
          0% { 
            transform: translateX(-50%) translateY(-50%) rotate(0deg) scale(1);
            background: linear-gradient(90deg, rgba(34, 197, 94, 0.1), rgba(251, 191, 36, 0.1), rgba(249, 115, 22, 0.1));
          }
          50% { 
            transform: translateX(-50%) translateY(-50%) rotate(180deg) scale(1.2);
            background: linear-gradient(270deg, rgba(251, 191, 36, 0.1), rgba(249, 115, 22, 0.1), rgba(239, 68, 68, 0.1));
          }
          100% { 
            transform: translateX(-50%) translateY(-50%) rotate(360deg) scale(1);
            background: linear-gradient(450deg, rgba(34, 197, 94, 0.1), rgba(251, 191, 36, 0.1), rgba(249, 115, 22, 0.1));
          }
        }
        
        @keyframes live-pulse-1 {
          0% { 
            opacity: 0.8; 
            transform: scale(1) rotate(0deg);
            background: linear-gradient(45deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.08));
          }
          50% { 
            opacity: 1; 
            transform: scale(1.1) rotate(180deg);
            background: linear-gradient(225deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
          }
          100% { 
            opacity: 0.8; 
            transform: scale(1) rotate(360deg);
            background: linear-gradient(405deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.08));
          }
        }
        
        @keyframes live-pulse-2 {
          0% { 
            opacity: 0.6; 
            transform: scale(1) rotate(0deg);
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.06), rgba(139, 92, 246, 0.06), rgba(59, 130, 246, 0.06));
            border-radius: 50%;
          }
          25% { 
            opacity: 0.9; 
            transform: scale(1.05) rotate(90deg);
            background: linear-gradient(225deg, rgba(139, 92, 246, 0.06), rgba(59, 130, 246, 0.06), rgba(34, 197, 94, 0.06));
            border-radius: 40% 60% 60% 40%;
          }
          50% { 
            opacity: 1; 
            transform: scale(1.15) rotate(180deg);
            background: linear-gradient(315deg, rgba(59, 130, 246, 0.06), rgba(34, 197, 94, 0.06), rgba(251, 191, 36, 0.06));
            border-radius: 60% 40% 40% 60%;
          }
          75% { 
            opacity: 0.8; 
            transform: scale(1.05) rotate(270deg);
            background: linear-gradient(45deg, rgba(34, 197, 94, 0.06), rgba(251, 191, 36, 0.06), rgba(236, 72, 153, 0.06));
            border-radius: 40% 60% 60% 40%;
          }
          100% { 
            opacity: 0.6; 
            transform: scale(1) rotate(360deg);
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.06), rgba(139, 92, 246, 0.06), rgba(59, 130, 246, 0.06));
            border-radius: 50%;
          }
        }
        
        @keyframes live-particle-float-1 {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px) rotate(360deg) scale(1.5); opacity: 0; }
        }
        
        @keyframes live-particle-float-2 {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg) scale(0.8); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(-30px) rotate(-360deg) scale(1.2); opacity: 0; }
        }
        
        @keyframes live-particle-float-3 {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg) scale(0.3); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(80px) rotate(720deg) scale(1.8); opacity: 0; }
        }
        
        @keyframes live-particle-float-4 {
          0% { transform: translateY(100vh) translateX(0) rotate(0deg) scale(0.6); opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(-60px) rotate(-720deg) scale(1.4); opacity: 0; }
        }
        
        @keyframes live-color-shift {
          0% { filter: hue-rotate(0deg) brightness(1) saturate(1); }
          25% { filter: hue-rotate(90deg) brightness(1.2) saturate(1.3); }
          50% { filter: hue-rotate(180deg) brightness(0.9) saturate(0.8); }
          75% { filter: hue-rotate(270deg) brightness(1.1) saturate(1.1); }
          100% { filter: hue-rotate(360deg) brightness(1) saturate(1); }
        }
        
        .animate-live-float-1 { animation: live-float-1 20s ease-in-out infinite; }
        .animate-live-float-2 { animation: live-float-2 25s ease-in-out infinite; }
        .animate-live-float-3 { animation: live-float-3 15s linear infinite; }
        .animate-live-pulse-1 { animation: live-pulse-1 12s ease-in-out infinite; }
        .animate-live-pulse-2 { animation: live-pulse-2 18s ease-in-out infinite; }
        `}
      </style>
      
      <div className="w-full max-w-6xl animate-fade-in z-10 relative">
        {/* Professional Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Zap className="h-10 w-10 text-yellow-500 mr-4 animate-pulse" />
              <div className="absolute -inset-1 bg-yellow-400 rounded-full blur-sm opacity-30 animate-ping"></div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg animate-gradient bg-300% animate-pulse">
              Currency Converter Pro
            </h1>
            <div className="relative">
              <Star className="h-10 w-10 text-purple-500 ml-4 animate-spin" />
              <div className="absolute -inset-1 bg-purple-400 rounded-full blur-sm opacity-30 animate-ping"></div>
            </div>
          </div>
          <p className="text-xl text-gray-700 font-semibold mb-4">Real-time exchange rates for 170+ currencies worldwide</p>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-2 rounded-full shadow-md">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-green-700 font-bold text-sm">Live Updates</span>
            </div>
            <div className="flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 px-4 py-2 rounded-full shadow-md">
              <Sparkles className="h-4 w-4 text-blue-600 mr-2 animate-pulse" />
              <span className="text-blue-700 font-bold text-sm">Professional Grade</span>
            </div>
          </div>
        </div>
        
        {/* Balanced Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left side - Features (3/12) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-100/50">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                <Globe className="h-5 w-5 text-blue-600 mr-2" />
                Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  170+ Currencies
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Real-time Rates
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Smart Search
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                  Keyboard Shortcuts
                </li>
              </ul>
            </div>
          </div>
          
          {/* Center - Main Converter (6/12) */}
          <div className="lg:col-span-6">
            <Card className="overflow-hidden backdrop-blur-sm border-gray-200/50 shadow-2xl transition-all duration-500 rounded-2xl bg-white/95 hover:shadow-blue-200/50 transform hover:-translate-y-2 hover:scale-[1.02]">
              <CardContent className="p-8 md:p-10 relative overflow-hidden">
                {/* Professional decorative elements */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-live-pulse-1"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-green-500/5 to-blue-500/5 rounded-full blur-3xl animate-live-pulse-2"></div>
                
                {/* Professional corner elements */}
                <div className="absolute top-4 left-4 w-16 h-16 border-l-3 border-t-3 border-blue-300 rounded-tl-xl opacity-30"></div>
                <div className="absolute top-4 right-4 w-16 h-16 border-r-3 border-t-3 border-purple-300 rounded-tr-xl opacity-30"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border-l-3 border-b-3 border-green-300 rounded-bl-xl opacity-30"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-r-3 border-b-3 border-indigo-300 rounded-br-xl opacity-30"></div>
                
                <CurrencyConverter mode="fiat" />
              </CardContent>
            </Card>
          </div>
          
          {/* Right side - Status & Info (3/12) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-purple-100/50">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                Quick Tips
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">/</kbd>
                  <span>Quick search</span>
                </div>
                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                  <ArrowDownUp className="h-4 w-4 mr-2 text-green-600" />
                  <span>Click to swap</span>
                </div>
                <div className="flex items-center p-2 bg-purple-50 rounded-lg">
                  <RefreshCw className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Auto refresh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Professional Enhanced Footer */}
        <div className="mt-12 text-center space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-center flex-wrap gap-4">
            <div className="flex items-center bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-blue-100">
              <Globe className="h-5 w-5 text-indigo-600 mr-3" />
              <span className="text-indigo-800 font-bold">170+ Global Currencies</span>
            </div>
            <div className="flex items-center bg-gradient-to-r from-white/90 to-green-50/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-green-100">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-800 font-bold">Live Market Rates</span>
            </div>
            <div className="flex items-center bg-gradient-to-r from-white/90 to-purple-50/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-purple-100">
              <Zap className="h-5 w-5 text-purple-600 mr-3" />
              <span className="text-purple-800 font-bold">Instant Results</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-sm px-8 py-4 rounded-2xl inline-block shadow-lg border border-indigo-100">
            <p className="text-indigo-800 font-bold text-lg mb-2">
              Default: KWD ⇄ PKR Conversion
            </p>
            <p className="text-sm text-indigo-600">Professional-grade currency conversion with live effects</p>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;

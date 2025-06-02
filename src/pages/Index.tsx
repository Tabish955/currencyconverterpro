import { useState, useEffect } from "react";
import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { ArrowDownUp, Sparkles, TrendingUp, Globe } from "lucide-react";

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
      {/* Enhanced animated floating background elements with live color changes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 via-purple-300/20 to-pink-300/20 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/4 animate-float-slow animate-color-shift"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-300/20 via-green-300/20 to-blue-300/20 rounded-full blur-3xl transform translate-y-1/3 -translate-x-1/3 animate-float-medium animate-color-shift-reverse"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-300/15 via-yellow-300/15 to-orange-300/15 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-float-fast animate-color-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-l from-yellow-300/15 via-red-300/15 to-purple-300/15 rounded-full blur-3xl animate-pulse-gentle animate-color-wave"></div>
      
      {/* Additional live animated layers */}
      <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-floating-light animate-color-rotate"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-l from-pink-400/8 via-purple-400/8 to-blue-400/8 rounded-full blur-3xl animate-glow animate-color-morph"></div>
      
      {/* Enhanced live particle system */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`particle particle-live-${i + 1}`}
            style={{
              animation: `float-live-${i % 4 + 1} ${15 + i * 2}s ease-in-out infinite alternate, color-shift-particle ${8 + i}s ease-in-out infinite`
            }}
          ></div>
        ))}
      </div>
      
      {/* Enhanced styles with live effects */}
      <style>
        {`
        .fixed-dropdown {
          max-height: 70vh;
          overflow-y: auto;
          z-index: 999999 !important;
        }
        
        @media (max-width: 640px) {
          .fixed-dropdown {
            width: 95vw !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
          }
        }
        
        /* Live color changing animations */
        @keyframes color-shift {
          0% { 
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
            transform: translateY(0) rotate(0deg);
          }
          25% { 
            background: linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2), rgba(34, 197, 94, 0.2));
            transform: translateY(-10px) rotate(90deg);
          }
          50% { 
            background: linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(34, 197, 94, 0.2), rgba(251, 191, 36, 0.2));
            transform: translateY(-20px) rotate(180deg);
          }
          75% { 
            background: linear-gradient(45deg, rgba(34, 197, 94, 0.2), rgba(251, 191, 36, 0.2), rgba(239, 68, 68, 0.2));
            transform: translateY(-10px) rotate(270deg);
          }
          100% { 
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
            transform: translateY(0) rotate(360deg);
          }
        }
        
        @keyframes color-shift-reverse {
          0% { 
            background: linear-gradient(-45deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
          }
          25% { 
            background: linear-gradient(-45deg, rgba(34, 197, 94, 0.2), rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2));
          }
          50% { 
            background: linear-gradient(-45deg, rgba(251, 191, 36, 0.2), rgba(34, 197, 94, 0.2), rgba(236, 72, 153, 0.2));
          }
          75% { 
            background: linear-gradient(-45deg, rgba(239, 68, 68, 0.2), rgba(251, 191, 36, 0.2), rgba(34, 197, 94, 0.2));
          }
          100% { 
            background: linear-gradient(-45deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
          }
        }
        
        @keyframes color-pulse {
          0% { 
            background: linear-gradient(90deg, rgba(34, 197, 94, 0.15), rgba(251, 191, 36, 0.15), rgba(249, 115, 22, 0.15));
            opacity: 0.6;
          }
          50% { 
            background: linear-gradient(90deg, rgba(251, 191, 36, 0.15), rgba(249, 115, 22, 0.15), rgba(239, 68, 68, 0.15));
            opacity: 1;
          }
          100% { 
            background: linear-gradient(90deg, rgba(34, 197, 94, 0.15), rgba(251, 191, 36, 0.15), rgba(249, 115, 22, 0.15));
            opacity: 0.6;
          }
        }
        
        @keyframes color-wave {
          0% { 
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(239, 68, 68, 0.15), rgba(139, 92, 246, 0.15));
          }
          33% { 
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
          }
          66% { 
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15), rgba(34, 197, 94, 0.15));
          }
          100% { 
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(239, 68, 68, 0.15), rgba(139, 92, 246, 0.15));
          }
        }
        
        @keyframes color-rotate {
          0% { 
            background: linear-gradient(0deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
          }
          25% { 
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
          }
          50% { 
            background: linear-gradient(180deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
          }
          75% { 
            background: linear-gradient(270deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
          }
          100% { 
            background: linear-gradient(360deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
          }
        }
        
        @keyframes color-morph {
          0% { 
            background: linear-gradient(45deg, rgba(236, 72, 153, 0.08), rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08));
            border-radius: 50%;
          }
          25% { 
            background: linear-gradient(45deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08), rgba(34, 197, 94, 0.08));
            border-radius: 40% 60% 60% 40%;
          }
          50% { 
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.08), rgba(34, 197, 94, 0.08), rgba(251, 191, 36, 0.08));
            border-radius: 60% 40% 40% 60%;
          }
          75% { 
            background: linear-gradient(45deg, rgba(34, 197, 94, 0.08), rgba(251, 191, 36, 0.08), rgba(236, 72, 153, 0.08));
            border-radius: 40% 60% 60% 40%;
          }
          100% { 
            background: linear-gradient(45deg, rgba(236, 72, 153, 0.08), rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08));
            border-radius: 50%;
          }
        }
        
        .animate-color-shift { animation: color-shift 12s ease-in-out infinite; }
        .animate-color-shift-reverse { animation: color-shift-reverse 10s ease-in-out infinite; }
        .animate-color-pulse { animation: color-pulse 8s ease-in-out infinite; }
        .animate-color-wave { animation: color-wave 15s ease-in-out infinite; }
        .animate-color-rotate { animation: color-rotate 6s linear infinite; }
        .animate-color-morph { animation: color-morph 20s ease-in-out infinite; }
        
        /* Enhanced live particles */
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        
        ${[...Array(12)].map((_, i) => `
        .particle-live-${i + 1} {
          width: ${4 + Math.random() * 10}px; 
          height: ${4 + Math.random() * 10}px;
          top: ${Math.random() * 100}%; 
          left: ${Math.random() * 100}%;
          background: linear-gradient(${Math.random() * 360}deg, 
            rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6), 
            rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.4));
          box-shadow: 0 0 ${10 + Math.random() * 20}px rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8);
        }`).join('')}
        
        @keyframes float-live-1 {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-40px) translateX(30px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-20px) translateX(60px) rotate(180deg) scale(0.9); }
          75% { transform: translateY(-60px) translateX(30px) rotate(270deg) scale(1.2); }
          100% { transform: translateY(0) translateX(0) rotate(360deg) scale(1); }
        }
        
        @keyframes float-live-2 {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
          33% { transform: translateY(-30px) translateX(-40px) rotate(120deg) scale(1.1); }
          66% { transform: translateY(-60px) translateX(20px) rotate(240deg) scale(0.8); }
          100% { transform: translateY(0) translateX(0) rotate(360deg) scale(1); }
        }
        
        @keyframes float-live-3 {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-50px) translateX(-30px) rotate(180deg) scale(1.3); }
          100% { transform: translateY(0) translateX(0) rotate(360deg) scale(1); }
        }
        
        @keyframes float-live-4 {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-35px) translateX(45px) rotate(90deg) scale(0.9); }
          50% { transform: translateY(-70px) translateX(10px) rotate(180deg) scale(1.2); }
          75% { transform: translateY(-35px) translateX(-25px) rotate(270deg) scale(1.1); }
          100% { transform: translateY(0) translateX(0) rotate(360deg) scale(1); }
        }
        
        @keyframes color-shift-particle {
          0% { filter: hue-rotate(0deg) brightness(1); }
          25% { filter: hue-rotate(90deg) brightness(1.2); }
          50% { filter: hue-rotate(180deg) brightness(0.8); }
          75% { filter: hue-rotate(270deg) brightness(1.1); }
          100% { filter: hue-rotate(360deg) brightness(1); }
        }
        
        /* ... keep existing code (other animations) the same ... */
        `}
      </style>
      
      <div className="w-full max-w-5xl animate-fade-in z-10">
        {/* Enhanced header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-purple-500 mr-3 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
              Currency Converter
            </h1>
            <TrendingUp className="h-8 w-8 text-blue-500 ml-3 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 font-medium">Real-time exchange rates for 170+ currencies worldwide</p>
          <p className="text-sm text-purple-600 mt-2 animate-pulse">🔥 Now with live dynamic backgrounds!</p>
        </div>
        
        <Card className="overflow-hidden backdrop-blur-sm border-gray-200/50 shadow-2xl transition-all duration-500 rounded-2xl bg-white/98 hover:shadow-blue-200/50 transform hover:-translate-y-2 hover:scale-[1.01]">
          <CardContent className="p-8 md:p-10 relative overflow-hidden">
            {/* Enhanced decorative elements with live effects */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-full blur-3xl animate-color-shift"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-green-500/8 to-blue-500/8 rounded-full blur-3xl animate-color-pulse"></div>
            <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-gradient-to-tl from-yellow-500/5 to-red-500/5 rounded-full blur-3xl animate-color-wave"></div>
            
            {/* Add decorative corner elements with live colors */}
            <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-blue-200 rounded-tl-lg animate-color-rotate"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-purple-200 rounded-tr-lg animate-color-shift"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-green-200 rounded-bl-lg animate-color-pulse"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-indigo-200 rounded-br-lg animate-color-wave"></div>
            
            <CurrencyConverter mode="fiat" />
          </CardContent>
        </Card>
        
        {/* Enhanced footer information */}
        <div className="mt-8 text-center space-y-4 animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md animate-color-shift">
              <Globe className="h-4 w-4 text-indigo-600 mr-2" />
              <span className="text-indigo-700 font-semibold">170+ Currencies</span>
            </div>
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md animate-color-pulse">
              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700 font-semibold">Real-time Rates</span>
            </div>
          </div>
          
          <p className="text-indigo-700 font-medium bg-white/60 backdrop-blur-sm px-6 py-2 rounded-full inline-block shadow-sm animate-color-wave">
            Default: KWD to PKR conversion with live dynamic effects
          </p>
          
          <div className="text-gray-500 text-sm bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block shadow-sm">
            Keyboard shortcut: <kbd className="ml-1 px-2 py-1 bg-gray-100 rounded-md text-gray-700 border border-gray-300 font-mono text-xs">/</kbd> for Search
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;

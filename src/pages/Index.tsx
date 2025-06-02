
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
      {/* Enhanced animated floating background elements with improved gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-indigo-400/20 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/4 animate-float-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-300/20 to-pink-300/20 rounded-full blur-3xl transform translate-y-1/3 -translate-x-1/3 animate-float-medium"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-300/15 to-emerald-300/15 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-float-fast"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-l from-yellow-300/15 to-orange-300/15 rounded-full blur-3xl animate-pulse-gentle"></div>
      
      {/* Additional animated layers for professional effect */}
      <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-floating-light"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-l from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-glow"></div>
      
      {/* Improved animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
        <div className="particle particle-7"></div>
        <div className="particle particle-8"></div>
      </div>
      
      {/* Enhanced styles */}
      <style>
        {`
        .fixed-dropdown {
          max-height: 70vh;
          overflow-y: auto;
          z-index: 999999;
        }
        
        @media (max-width: 640px) {
          .fixed-dropdown {
            width: 95vw !important;
            left: 50%;
            transform: translateX(-50%);
          }
        }
        
        /* Enhanced particle animations */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, rgba(99, 102, 241, 0.4), rgba(168, 85, 247, 0.4));
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(168, 85, 247, 0.4);
          pointer-events: none;
        }
        
        .particle-1 {
          width: 8px; height: 8px;
          top: 20%; left: 10%;
          animation: float 25s ease-in-out infinite alternate;
        }
        
        .particle-2 {
          width: 12px; height: 12px;
          top: 30%; right: 15%;
          animation: float 20s ease-in-out infinite alternate-reverse;
        }
        
        .particle-3 {
          width: 7px; height: 7px;
          bottom: 20%; left: 20%;
          animation: float 15s ease-in-out infinite alternate;
        }
        
        .particle-4 {
          width: 10px; height: 10px;
          top: 60%; right: 25%;
          animation: float 22s ease-in-out infinite alternate-reverse;
        }
        
        .particle-5 {
          width: 6px; height: 6px;
          bottom: 35%; left: 35%;
          animation: float 18s ease-in-out infinite alternate;
        }
        
        .particle-6 {
          width: 14px; height: 14px;
          top: 40%; right: 10%;
          animation: float 30s ease-in-out infinite alternate-reverse;
        }
        
        .particle-7 {
          width: 9px; height: 9px;
          bottom: 15%; right: 30%;
          animation: float 24s ease-in-out infinite alternate;
        }
        
        .particle-8 {
          width: 5px; height: 5px;
          top: 75%; left: 22%;
          animation: float 27s ease-in-out infinite alternate-reverse;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-30px) translateX(15px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translateY(15px) translateX(-20px) scale(0.9);
            opacity: 0.7;
          }
        }
        
        @keyframes floating-light {
          0% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
          100% { opacity: 0.2; transform: scale(1); }
        }
        
        .animate-floating-light {
          animation: floating-light 6s ease-in-out infinite;
        }
        
        @keyframes glow {
          0% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.02); }
          100% { opacity: 0.15; transform: scale(1); }
        }
        
        .animate-glow {
          animation: glow 8s ease-in-out infinite;
        }
        
        @keyframes float-slow {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-15px) rotate(3deg);
          }
        }
        
        @keyframes float-medium {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-20px) rotate(-2deg);
          }
        }
        
        @keyframes float-fast {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-25px) rotate(5deg);
          }
        }
        
        @keyframes pulse-gentle {
          0% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
          100% { opacity: 0.2; transform: scale(1); }
        }
        
        .animate-float-slow {
          animation: float-slow 18s ease-in-out infinite alternate;
        }
        
        .animate-float-medium {
          animation: float-medium 15s ease-in-out infinite alternate;
        }
        
        .animate-float-fast {
          animation: float-fast 12s ease-in-out infinite alternate;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 10s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
        </div>
        
        <Card className="overflow-hidden backdrop-blur-sm border-gray-200/50 shadow-2xl transition-all duration-500 rounded-2xl bg-white/98 hover:shadow-blue-200/50 transform hover:-translate-y-2 hover:scale-[1.01]">
          <CardContent className="p-8 md:p-10 relative overflow-hidden">
            {/* Enhanced decorative elements */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-green-500/8 to-blue-500/8 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-gradient-to-tl from-yellow-500/5 to-red-500/5 rounded-full blur-3xl"></div>
            
            {/* Add decorative corner elements */}
            <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-blue-200 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-purple-200 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-green-200 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-indigo-200 rounded-br-lg"></div>
            
            <CurrencyConverter mode="fiat" />
          </CardContent>
        </Card>
        
        {/* Enhanced footer information */}
        <div className="mt-8 text-center space-y-4 animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Globe className="h-4 w-4 text-indigo-600 mr-2" />
              <span className="text-indigo-700 font-semibold">170+ Currencies</span>
            </div>
            <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700 font-semibold">Real-time Rates</span>
            </div>
          </div>
          
          <p className="text-indigo-700 font-medium bg-white/60 backdrop-blur-sm px-6 py-2 rounded-full inline-block shadow-sm">
            To ensure accuracy, click refresh once before using
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

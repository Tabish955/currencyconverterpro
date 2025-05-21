import { useState, useEffect } from "react";
import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bitcoin, ArrowDownUp } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("fiat");

  // Parse URL parameters for deep linking
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');
    
    // If we have from/to params, switch to appropriate tab
    if (from && to) {
      const isFromCrypto = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE'].includes(from);
      const isToCrypto = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE'].includes(to);
      
      if (isFromCrypto || isToCrypto) {
        setActiveTab("crypto");
      } else {
        setActiveTab("fiat");
      }
    }
  }, []);

  // Add keyboard shortcut listener for tab switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+1 for Fiat, Alt+2 for Crypto
      if (e.altKey) {
        if (e.key === '1') {
          setActiveTab('fiat');
        } else if (e.key === '2') {
          setActiveTab('crypto');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-4 overflow-hidden relative">
      {/* Enhanced animated floating background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/4 animate-float-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl transform translate-y-1/3 -translate-x-1/3 animate-float-medium"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-float-fast"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-l from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse-gentle"></div>
      
      {/* Additional animated layers for professional effect */}
      <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-blue-300/15 to-cyan-300/15 rounded-full blur-3xl animate-floating-light"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-l from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-glow"></div>
      
      {/* Animated particles */}
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
      
      {/* Add styles for fixed dropdowns */}
      <style>
        {`
        .fixed-dropdown {
          max-height: 70vh;
          overflow-y: auto;
          z-index: 9999;
        }
        
        @media (max-width: 640px) {
          .fixed-dropdown {
            width: 95vw !important;
            left: 50%;
            transform: translateX(-50%);
          }
        }
        
        /* Enhance particle animations */
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
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
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(10px) translateX(-15px);
          }
        }
        
        @keyframes floating-light {
          0% { opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { opacity: 0.3; }
        }
        
        .animate-floating-light {
          animation: floating-light 5s ease-in-out infinite;
        }
        
        @keyframes glow {
          0% { opacity: 0.2; }
          50% { opacity: 0.3; }
          100% { opacity: 0.2; }
        }
        
        .animate-glow {
          animation: glow 7s ease-in-out infinite;
        }
        
        @keyframes float-slow {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-10px) rotate(3deg);
          }
        }
        
        @keyframes float-medium {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-15px) rotate(-2deg);
          }
        }
        
        @keyframes float-fast {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        @keyframes pulse-gentle {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite alternate;
        }
        
        .animate-float-medium {
          animation: float-medium 12s ease-in-out infinite alternate;
        }
        
        .animate-float-fast {
          animation: float-fast 10s ease-in-out infinite alternate;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 8s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}
      </style>
      
      <div className="w-full max-w-4xl animate-fade-in z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          Currency Converter
        </h1>
        
        <Tabs defaultValue="fiat" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-2 w-64">
              <TabsTrigger value="fiat" className="flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4" />
                <span>Fiat</span>
                <kbd className="hidden md:inline-flex ml-1 text-[10px] font-mono bg-black/10 px-1 rounded">Alt+1</kbd>
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                <span>Crypto</span>
                <kbd className="hidden md:inline-flex ml-1 text-[10px] font-mono bg-black/10 px-1 rounded">Alt+2</kbd>
              </TabsTrigger>
            </TabsList>
          </div>

          <Card className="overflow-hidden backdrop-blur-sm border-gray-200 shadow-2xl transition-all duration-300 rounded-xl bg-white/95 hover:shadow-blue-200/50 transform hover:-translate-y-1">
            <CardContent className="p-6 md:p-8 relative overflow-hidden">
              {/* Enhanced decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-tl from-yellow-500/5 to-red-500/5 rounded-full blur-2xl"></div>
              
              <TabsContent value="fiat" className="mt-0">
                <CurrencyConverter mode="fiat" />
              </TabsContent>
              
              <TabsContent value="crypto" className="mt-0">
                <CurrencyConverter mode="crypto" />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
        
        <div className="mt-6 text-center text-sm animate-fade-in" style={{
        animationDelay: '0.3s'
      }}>
          <p className="text-indigo-700 font-medium">To ensure accuracy click refresh once before using</p>
          <p className="text-blue-600 mt-1">
            {activeTab === "fiat" ? 
              "Supports 170+ currencies worldwide" : 
              "Supports major cryptocurrencies and fiat currencies"}
          </p>
          <div className="text-gray-500 text-xs mt-2">
            Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-300">Alt+1</kbd> for Fiat, 
            <kbd className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-300">Alt+2</kbd> for Crypto,
            <kbd className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 border border-gray-300">/</kbd> for Search
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>;
};

export default Index;

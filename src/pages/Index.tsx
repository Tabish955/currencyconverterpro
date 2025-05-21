
import { useState } from "react";
import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bitcoin, ArrowDownUp } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("fiat");

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
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                <span>Crypto</span>
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
        </div>
      </div>
      <Toaster position="top-center" />
    </div>;
};

export default Index;

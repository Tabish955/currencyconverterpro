
import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-4 overflow-hidden relative">
      {/* Enhanced floating background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/4 animate-float-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl transform translate-y-1/3 -translate-x-1/3 animate-float-medium"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-float-fast"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-l from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse-gentle"></div>
      
      <div className="w-full max-w-4xl animate-fade-in z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          Currency Converter
        </h1>
        
        <Card className="overflow-hidden backdrop-blur-sm border-gray-200 shadow-2xl transition-all duration-300 rounded-xl bg-white/95 hover:shadow-blue-200/50">
          <CardContent className="p-6 md:p-8 relative overflow-hidden">
            {/* Enhanced decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-tl from-yellow-500/5 to-red-500/5 rounded-full blur-2xl"></div>
            
            <CurrencyConverter />
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-indigo-700 font-medium">Exchange rates updated in real-time with accurate data</p>
          <p className="text-blue-600 mt-1">Supports 170+ currencies worldwide</p>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default Index;

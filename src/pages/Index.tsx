import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
const Index = () => {
  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-4 overflow-hidden animate-gradient-slow relative">
      {/* Floating background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/4 animate-float-slow"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl transform translate-y-1/3 -translate-x-1/3 animate-float-medium"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-200/10 to-emerald-200/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-float-fast"></div>
      
      <div className="w-full max-w-4xl animate-fade-in z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          Currency Converter
        </h1>
        
        <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl transition-all duration-300 hover:shadow-2xl rounded-xl">
          <CardContent className="p-6 md:p-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-green-200/30 to-blue-200/30 rounded-full blur-2xl"></div>
            
            <CurrencyConverter />
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-indigo-700 font-medium">Rates are 100% accurate and updated regularly</p>
          <p className="text-blue-600">To insure accuracy click refresh once before using</p>
        </div>
      </div>
      <Toaster />
    </div>;
};
export default Index;
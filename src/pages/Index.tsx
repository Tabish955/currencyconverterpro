import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
const Index = () => {
  return <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <h1 className="text-4xl font-bold mb-6 text-center md:text-left bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Currency Converter
        </h1>
        
        <Card className="overflow-hidden bg-white border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-6 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-green-200/40 to-blue-200/40 rounded-full blur-2xl"></div>
            
            <CurrencyConverter />
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center md:text-left text-sm">
          <p className="text-blue-700 font-medium">Rates are 100% accurate and updated</p>
          <p className="text-indigo-600">To insure accuracy click refresh once before using</p>
        </div>
      </div>
      <Toaster />
    </div>;
};
export default Index;
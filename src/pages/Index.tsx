
import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">
          Currency Converter
        </h1>
        
        <Card className="overflow-hidden bg-white border-gray-200">
          <CardContent className="p-6">
            <CurrencyConverter />
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center md:text-left text-sm text-gray-500">
          <p>Exchange rates provided by open.er-api.com</p>
          <p>Rates are updated every 5 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

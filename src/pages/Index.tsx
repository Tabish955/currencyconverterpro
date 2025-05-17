
import CurrencyConverter from "../components/CurrencyConverter/CurrencyConverter";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Currency Converter</h1>
      <CurrencyConverter />
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Exchange rates provided by exchangerate.host</p>
        <p>Rates are updated every 15 minutes</p>
      </div>
    </div>
  );
};

export default Index;

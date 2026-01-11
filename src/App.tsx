import { MapView } from "./components/MapView";
import { DrawToolbar } from "./components/DrawToolbar";
import { ExportPanel } from "./components/ExportPanel";
import { Map } from "lucide-react";

function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md px-6 py-4 z-10">
        <div className="flex items-center space-x-3">
          <Map className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              OpenStreetMap 
            </h1>
            <p className="text-sm text-gray-600">
              Draw and manage geometrical features with spatial constraints
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <MapView />
        <DrawToolbar />
        <ExportPanel />
      </main>
    </div>
  );
}

export default App;

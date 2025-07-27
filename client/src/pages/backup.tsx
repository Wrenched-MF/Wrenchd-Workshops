import { useQuery } from "@tanstack/react-query";
import { Database, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Backup() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log("Exporting data...");
  };

  if (isLoading) {
    return <div>Loading backup information...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Backup & Export</h2>
        <p className="text-gray-600">Manage your workshop data and create backups</p>
      </div>

      {/* Current Data Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-gray-600" />
            <span>Current Data Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.customersCount || 0}</p>
              <p className="text-sm text-gray-600">Customers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stats?.vehiclesCount || 0}</p>
              <p className="text-sm text-gray-600">Vehicles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats?.inventoryCount || 0}</p>
              <p className="text-sm text-gray-600">Inventory</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats?.jobsCount || 0}</p>
              <p className="text-sm text-gray-600">Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600">Receipts</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <Check className="w-4 h-4" />
            <span>Total: {(stats?.customersCount || 0) + (stats?.vehiclesCount || 0) + (stats?.inventoryCount || 0) + (stats?.jobsCount || 0)} records stored locally in your browser</span>
          </div>
        </CardContent>
      </Card>

      {/* Export Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-gray-600" />
            <span>Export Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">Download all your workshop data as a backup file</p>

          {/* What gets exported */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-green-900 mb-2">What gets exported:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• All customer information and contact details</li>
              <li>• Vehicle records and specifications</li>
              <li>• Complete inventory with stock levels</li>
              <li>• Job history with parts and labor details</li>
              <li>• Generated receipts and quotes</li>
            </ul>
          </div>

          {/* Export Button */}
          <div className="text-center">
            <Button 
              onClick={handleExportData}
              className="bg-wrench-green hover:bg-wrench-dark px-8 py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
            <p className="text-sm text-gray-500 mt-2">Data will be exported as a JSON file</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

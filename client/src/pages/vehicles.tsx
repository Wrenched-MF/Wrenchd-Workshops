import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmptyState from "@/components/ui/empty-state";
import VehicleForm from "@/components/forms/vehicle-form";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { VehicleWithCustomer } from "@shared/schema";

export default function Vehicles() {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery<VehicleWithCustomer[]>({
    queryKey: ["/api/vehicles"],
  });

  const createVehicleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      setShowAddForm(false);
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
  });

  if (isLoading) {
    return <div>Loading vehicles...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicles</h2>
          <p className="text-gray-600">Manage customer vehicles</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-wrench-green hover:bg-wrench-dark">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
            </DialogHeader>
            <VehicleForm 
              onSubmit={(data) => createVehicleMutation.mutate(data)}
              isSubmitting={createVehicleMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle List */}
      {vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="w-8 h-8 text-gray-400" />}
          title="No vehicles registered"
          description="Start by adding your first vehicle to begin tracking customer cars."
          action={{
            label: "Add Your First Vehicle",
            onClick: () => setShowAddForm(true)
          }}
        />
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Owner:</strong> {vehicle.customer.name}</p>
                      {vehicle.color && <p><strong>Color:</strong> {vehicle.color}</p>}
                      {vehicle.licensePlate && <p><strong>License Plate:</strong> {vehicle.licensePlate}</p>}
                      {vehicle.mileage && <p><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} miles</p>}
                    </div>
                    <div>
                      {vehicle.vin && <p><strong>VIN:</strong> {vehicle.vin}</p>}
                      {vehicle.engineSize && <p><strong>Engine:</strong> {vehicle.engineSize}</p>}
                      {vehicle.fuelType && <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>}
                      {vehicle.transmission && <p><strong>Transmission:</strong> {vehicle.transmission}</p>}
                    </div>
                  </div>
                  {vehicle.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{vehicle.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

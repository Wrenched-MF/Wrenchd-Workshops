import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Truck, ShoppingCart, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EmptyState from "@/components/ui/empty-state";
import SupplierForm from "@/components/forms/supplier-form";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Supplier } from "@shared/schema";

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const createSupplierMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/suppliers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setShowAddForm(false);
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contactName && supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return <div>Loading suppliers...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Suppliers</h2>
          <p className="text-gray-600">Manage suppliers, orders, and returns</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-wrench-green hover:bg-wrench-dark">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm 
              onSubmit={(data) => createSupplierMutation.mutate(data)}
              isSubmitting={createSupplierMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders (0)</TabsTrigger>
          <TabsTrigger value="returns">Returns (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Suppliers List */}
          {filteredSuppliers.length === 0 ? (
            <EmptyState
              icon={<Truck className="w-8 h-8 text-gray-400" />}
              title="No suppliers found"
              description={searchTerm ? "No suppliers match your search criteria." : "Start by adding your first supplier to manage your parts procurement."}
              action={{
                label: "Add Your First Supplier",
                onClick: () => setShowAddForm(true)
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{supplier.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        {supplier.contactName && <p><strong>Contact:</strong> {supplier.contactName}</p>}
                        {supplier.phone && <p><strong>Phone:</strong> {supplier.phone}</p>}
                        {supplier.email && <p><strong>Email:</strong> {supplier.email}</p>}
                        {supplier.address && <p><strong>Address:</strong> {supplier.address}</p>}
                        {supplier.website && (
                          <p><strong>Website:</strong> <a href={supplier.website} className="text-wrench-green hover:text-wrench-dark" target="_blank" rel="noopener noreferrer">{supplier.website}</a></p>
                        )}
                        {supplier.notes && <p><strong>Notes:</strong> {supplier.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" title="Create Order">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteSupplierMutation.mutate(supplier.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <EmptyState
            icon={<ShoppingCart className="w-8 h-8 text-gray-400" />}
            title="No purchase orders yet"
            description="Purchase orders will appear here when you create them from supplier pages."
          />
        </TabsContent>

        <TabsContent value="returns">
          <EmptyState
            icon={<Truck className="w-8 h-8 text-gray-400" />}
            title="No returns yet"
            description="Return orders will appear here when you process returns to suppliers."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

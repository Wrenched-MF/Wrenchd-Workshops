import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Package, AlertTriangle, PoundSterling, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/ui/stats-card";
import EmptyState from "@/components/ui/empty-state";
import InventoryForm from "@/components/forms/inventory-form";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { InventoryItem } from "@shared/schema";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const createItemMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      setShowAddForm(false);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/inventory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      setShowEditForm(false);
      setEditingItem(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
    },
  });

  // Calculate stats
  const totalItems = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = items.reduce((sum, item) => {
    const cost = parseFloat(item.costPrice || '0');
    const qty = item.quantity || 0;
    return sum + (cost * qty);
  }, 0);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.partNumber && item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "in_stock" && (item.quantity || 0) > (item.lowStockThreshold || 5)) ||
                        (stockFilter === "low_stock" && (item.quantity || 0) <= (item.lowStockThreshold || 5)) ||
                        (stockFilter === "out_of_stock" && (item.quantity || 0) === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory</h2>
          <p className="text-gray-600">Manage your parts and supplies</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-wrench-green hover:bg-wrench-dark">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <InventoryForm 
              onSubmit={(data) => createItemMutation.mutate(data)}
              isSubmitting={createItemMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Items"
          value={totalItems}
          icon={<Package />}
        />
        <StatsCard
          title="Low Stock"
          value={lowStockItems.length}
          icon={<AlertTriangle />}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          valueColor="text-red-600"
        />
        <StatsCard
          title="Total Units"
          value={totalUnits}
          icon={<Box />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="Total Value"
          value={`£${totalValue.toFixed(2)}`}
          icon={<PoundSterling />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search items by name, description, or part number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category || ""}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Stock Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Items */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-gray-400" />}
          title="No inventory items found"
          description={searchTerm || categoryFilter !== "all" || stockFilter !== "all" 
            ? "No items match your search criteria." 
            : "Start by adding your first inventory item to track your parts and supplies."}
          action={{
            label: "Add Your First Item",
            onClick: () => setShowAddForm(true)
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isLowStock = item.trackStock && (item.quantity || 0) <= (item.lowStockThreshold || 5);
            const totalItemValue = parseFloat(item.costPrice || '0') * (item.quantity || 0);

            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          {item.partNumber && (
                            <Badge variant="outline" className="text-xs font-mono">
                              #{item.partNumber}
                            </Badge>
                          )}
                        </div>
                        {item.category && (
                          <p className="text-gray-600 mb-2">{item.category}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm">
                          {item.trackStock && (
                            <span>Quantity: <strong className={item.quantity === 0 ? 'text-red-600' : 'text-gray-900'}>{item.quantity} units</strong></span>
                          )}
                          {item.costPrice && (
                            <span>Cost: <strong>£{parseFloat(item.costPrice).toFixed(2)}</strong></span>
                          )}
                          {item.retailPrice && (
                            <span>Price: <strong>£{parseFloat(item.retailPrice).toFixed(2)}</strong></span>
                          )}
                          <span>Total Value: <strong>£{totalItemValue.toFixed(2)}</strong></span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {isLowStock && (
                          <Badge variant="destructive">Low Stock</Badge>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setShowEditForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {/* Low Stock Alert */}
                    {isLowStock && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-800 text-sm">
                            Low stock alert: {item.quantity} units remaining (threshold: {item.lowStockThreshold})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a new inventory item to track parts and supplies.
            </DialogDescription>
          </DialogHeader>
          <InventoryForm 
            onSubmit={createItemMutation.mutate}
            isSubmitting={createItemMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the details for this inventory item.
            </DialogDescription>
          </DialogHeader>
          <InventoryForm 
            onSubmit={(data) => updateItemMutation.mutate({ id: editingItem.id, data })}
            isSubmitting={updateItemMutation.isPending}
            initialData={editingItem}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

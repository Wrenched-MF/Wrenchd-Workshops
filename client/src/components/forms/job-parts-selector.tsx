import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventoryItemSchema, type InventoryItem, type InsertInventoryItem } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface JobPart {
  inventoryItemId: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface JobPartsSelectorProps {
  parts: JobPart[];
  onPartsChange: (parts: JobPart[]) => void;
  onTotalChange: (total: number) => void;
}

export default function JobPartsSelector({ parts, onPartsChange, onTotalChange }: JobPartsSelectorProps) {
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const createItemMutation = useMutation({
    mutationFn: (data: InsertInventoryItem) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setShowCreateForm(false);
    },
  });

  const form = useForm<InsertInventoryItem>({
    resolver: zodResolver(insertInventoryItemSchema),
    defaultValues: {
      name: "",
      description: "",
      partNumber: "",
      category: "",
      costPrice: "0",
      retailPrice: "0",
      quantity: 1,
      lowStockThreshold: 5,
      trackStock: true,
    },
  });

  // Filter and search items
  const filteredItems = useMemo(() => {
    let items = inventoryItems.filter(item => 
      (item.quantity || 0) > 0 && !parts.some(part => part.inventoryItemId === item.id)
    );

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(search) ||
        (item.partNumber && item.partNumber.toLowerCase().includes(search)) ||
        (item.description && item.description.toLowerCase().includes(search))
      );
    }

    return items;
  }, [inventoryItems, parts, searchTerm]);

  const addPart = () => {
    const selectedItem = inventoryItems.find(item => item.id === selectedPartId);
    if (!selectedItem) return;

    const unitPrice = parseFloat(selectedItem.retailPrice || "0");
    const totalPrice = unitPrice * quantity;

    const newPart: JobPart = {
      inventoryItemId: selectedItem.id,
      partName: selectedItem.name,
      partNumber: selectedItem.partNumber || undefined,
      quantity,
      unitPrice,
      totalPrice,
    };

    const updatedParts = [...parts, newPart];
    onPartsChange(updatedParts);
    
    // Calculate new total
    const newTotal = updatedParts.reduce((sum, part) => sum + part.totalPrice, 0);
    onTotalChange(newTotal);

    // Reset form
    setSelectedPartId("");
    setQuantity(1);
  };

  const removePart = (index: number) => {
    const updatedParts = parts.filter((_, i) => i !== index);
    onPartsChange(updatedParts);
    
    // Calculate new total
    const newTotal = updatedParts.reduce((sum, part) => sum + part.totalPrice, 0);
    onTotalChange(newTotal);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedParts = [...parts];
    updatedParts[index].quantity = newQuantity;
    updatedParts[index].totalPrice = updatedParts[index].unitPrice * newQuantity;
    
    onPartsChange(updatedParts);
    
    // Calculate new total
    const newTotal = updatedParts.reduce((sum, part) => sum + part.totalPrice, 0);
    onTotalChange(newTotal);
  };

  const handleCreateItem = (data: InsertInventoryItem) => {
    // Pre-fill search term as name if it looks like a part name
    if (searchTerm && !data.name) {
      data.name = searchTerm;
    }
    createItemMutation.mutate(data);
  };

  const selectedItem = inventoryItems.find(item => item.id === selectedPartId);
  const canAddPart = selectedPartId && quantity > 0 && selectedItem;
  const hasSearchResults = filteredItems.length > 0;
  const showCreateOption = searchTerm.trim() && !hasSearchResults;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Parts Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Add Part Form */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search parts by name or part number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedPartId(""); // Clear selection when searching
              }}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    searchTerm 
                      ? hasSearchResults 
                        ? `${filteredItems.length} parts found - select one`
                        : "No parts found"
                      : "Search or select part from inventory..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500">
                          {item.partNumber && `${item.partNumber} • `}
                          Stock: {item.quantity} • £{item.retailPrice}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          
          <Input
            type="number"
            placeholder="Qty"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
          
          <Button 
            onClick={addPart} 
            disabled={!canAddPart}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Part
          </Button>
        </div>

        {/* Create New Part Option */}
        {showCreateOption && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Part "{searchTerm}" not found
                </p>
                <p className="text-xs text-blue-700">
                  Create a new inventory item with this name
                </p>
              </div>
              <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Create Part
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Part</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateItem)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Name *</FormLabel>
                            <FormControl>
                              <Input {...field} defaultValue={searchTerm} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="partNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Number</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ""} className="h-20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="retailPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Retail Price (£) *</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Initial Quantity *</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={createItemMutation.isPending} className="flex-1">
                          {createItemMutation.isPending ? "Creating..." : "Create Part"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCreateForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
        </div>

        {/* Selected Part Preview */}
        {selectedItem && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{selectedItem.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedItem.partNumber && `Part #: ${selectedItem.partNumber} • `}
                  Unit Price: £{selectedItem.retailPrice}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Qty: {quantity}</p>
                <p className="font-semibold">
                  Total: £{(parseFloat(selectedItem.retailPrice || "0") * quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Parts List */}
        {parts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Selected Parts</h4>
            {parts.map((part, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-md">
                <div className="flex-1">
                  <p className="font-medium">{part.partName}</p>
                  <p className="text-sm text-gray-600">
                    {part.partNumber && `${part.partNumber} • `}
                    £{part.unitPrice.toFixed(2)} each
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(index, part.quantity - 1)}
                      disabled={part.quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{part.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(index, part.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  
                  <Badge variant="secondary">
                    £{part.totalPrice.toFixed(2)}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePart(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Parts Total */}
            <div className="flex justify-end p-3 bg-gray-50 rounded-md">
              <div className="text-right">
                <p className="text-sm text-gray-600">Parts Total</p>
                <p className="text-lg font-semibold">
                  £{parts.reduce((sum, part) => sum + part.totalPrice, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {parts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No parts added yet</p>
            <p className="text-sm">Select parts from your inventory above</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
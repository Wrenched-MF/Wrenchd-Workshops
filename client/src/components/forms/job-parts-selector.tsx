import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, X, Package, Search, Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventoryItemSchema, type InventoryItem, type InsertInventoryItem } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
    setSearchTerm("");
    setShowSuggestions(false);
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

  const handleSelectPart = (item: InventoryItem) => {
    setSelectedPartId(item.id);
    setSearchTerm(item.name);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredItems.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSelectPart(filteredItems[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSelectedPartId("");
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = inventoryItems.find(item => item.id === selectedPartId);
  const canAddPart = selectedPartId && quantity > 0 && selectedItem;
  const hasSearchResults = filteredItems.length > 0;
  const showCreateOption = searchTerm.trim() && !hasSearchResults && !showSuggestions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Parts Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dynamic Search and Add Part Form */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          {/* Dynamic Search Input with Suggestions */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={searchInputRef}
              placeholder="Type to search parts by name or part number..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
            
            {/* Dynamic Suggestions Dropdown */}
            {showSuggestions && (searchTerm.trim() || filteredItems.length > 0) && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
              >
                {filteredItems.length > 0 ? (
                  <div className="py-1">
                    {filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50",
                          selectedSuggestionIndex === index && "bg-blue-50 border-l-2 border-l-blue-500"
                        )}
                        onClick={() => handleSelectPart(item)}
                      >
                        {/* Part Image */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden border">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={cn(
                            "w-full h-full flex items-center justify-center",
                            item.imageUrl && "hidden"
                          )}>
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                        
                        {/* Part Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {item.partNumber && (
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {item.partNumber}
                              </span>
                            )}
                            <span>Stock: {item.quantity}</span>
                            <span className="font-semibold text-green-600">£{item.retailPrice}</span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-400 truncate mt-1">{item.description}</p>
                          )}
                        </div>
                        
                        {/* Selection Indicator */}
                        {selectedPartId === item.id && (
                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : searchTerm.trim() && (
                  <div className="px-3 py-8 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No parts found</p>
                    <p className="text-xs">Try a different search term</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <div className="text-sm text-gray-600">
                {selectedItem ? (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{selectedItem.name}</span>
                  </div>
                ) : (
                  <div className="p-2 text-center text-gray-400 border border-dashed border-gray-300 rounded">
                    {searchTerm ? "Select from suggestions above" : "Start typing to search parts"}
                  </div>
                )}
              </div>
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
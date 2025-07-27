import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { InsertPurchaseOrder, Supplier, InventoryItem } from "@shared/schema";

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  orderNumber: z.string().min(1, "Order number is required"),
  status: z.string().default("pending"),
  orderDate: z.string().optional(),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    inventoryItemId: z.string().optional(),
    itemName: z.string().min(1, "Item name is required"),
    itemDescription: z.string().optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
    totalPrice: z.number().min(0),
  })).min(1, "At least one item is required"),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  suppliers: Supplier[];
  inventoryItems: InventoryItem[];
  initialData?: Partial<InsertPurchaseOrder>;
}

export default function PurchaseOrderForm({ 
  onSubmit, 
  isSubmitting = false, 
  suppliers = [],
  inventoryItems = [],
  initialData 
}: PurchaseOrderFormProps) {
  const [orderItems, setOrderItems] = useState([
    { inventoryItemId: "", itemName: "", itemDescription: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: "",
      orderNumber: `PO-${Date.now()}`,
      status: "pending",
      orderDate: new Date().toISOString(),
      expectedDelivery: "",
      notes: "",
      items: orderItems,
      ...initialData,
    },
  });

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.2; // 20% VAT
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const updateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = quantity;
    newItems[index].unitPrice = unitPrice;
    newItems[index].totalPrice = quantity * unitPrice;
    setOrderItems(newItems);
    form.setValue("items", newItems);
  };

  const addItem = () => {
    const newItems = [...orderItems, { 
      inventoryItemId: "", 
      itemName: "", 
      itemDescription: "", 
      quantity: 1, 
      unitPrice: 0, 
      totalPrice: 0 
    }];
    setOrderItems(newItems);
    form.setValue("items", newItems);
  };

  const removeItem = (index: number) => {
    if (orderItems.length > 1) {
      const newItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newItems);
      form.setValue("items", newItems);
    }
  };

  const handleInventoryItemSelect = (index: number, itemId: string) => {
    const inventoryItem = inventoryItems.find(item => item.id === itemId);
    if (inventoryItem) {
      const newItems = [...orderItems];
      newItems[index].inventoryItemId = itemId;
      newItems[index].itemName = inventoryItem.name;
      newItems[index].itemDescription = inventoryItem.description || "";
      newItems[index].unitPrice = parseFloat(inventoryItem.costPrice || "0");
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
      setOrderItems(newItems);
      form.setValue("items", newItems);
    }
  };

  const handleSubmit = (data: PurchaseOrderFormData) => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = calculateTotal();

    const formattedData = {
      ...data,
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString(),
      items: orderItems,
    };

    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number *</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Order Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {orderItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {orderItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Select from Inventory</label>
                    <Select onValueChange={(value) => handleInventoryItemSelect(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inventory item (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((invItem) => (
                          <SelectItem key={invItem.id} value={invItem.id}>
                            {invItem.name} - £{invItem.costPrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Item Name *</label>
                    <Input
                      value={item.itemName}
                      onChange={(e) => {
                        const newItems = [...orderItems];
                        newItems[index].itemName = e.target.value;
                        setOrderItems(newItems);
                        form.setValue("items", newItems);
                      }}
                      placeholder="Enter item name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={item.itemDescription}
                      onChange={(e) => {
                        const newItems = [...orderItems];
                        newItems[index].itemDescription = e.target.value;
                        setOrderItems(newItems);
                        form.setValue("items", newItems);
                      }}
                      placeholder="Enter description"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Quantity *</label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemTotal(index, parseInt(e.target.value) || 1, item.unitPrice)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Unit Price (£) *</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItemTotal(index, item.quantity, parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Total Price (£)</label>
                    <Input
                      value={item.totalPrice.toFixed(2)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Order Totals */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>£{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (20%):</span>
                    <span>£{calculateTax(calculateSubtotal()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>£{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about this purchase order"
                  className="h-20"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-6">
          <Button type="submit" disabled={isSubmitting} className="bg-wrench-green hover:bg-wrench-dark">
            {isSubmitting ? "Creating..." : "Create Purchase Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
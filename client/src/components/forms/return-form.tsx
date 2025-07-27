import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InsertReturn, Supplier, PurchaseOrderWithDetails, InventoryItem } from "@shared/schema";

const returnSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  purchaseOrderId: z.string().optional(),
  returnNumber: z.string().min(1, "Return number is required"),
  status: z.string().default("pending"),
  reason: z.string().min(1, "Reason for return is required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    inventoryItemId: z.string().optional(),
    itemName: z.string().min(1, "Item name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
    totalPrice: z.number().min(0),
    condition: z.string().min(1, "Condition is required"),
  })).min(1, "At least one item is required"),
});

type ReturnFormData = z.infer<typeof returnSchema>;

interface ReturnFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrderWithDetails[];
  inventoryItems: InventoryItem[];
  initialData?: Partial<InsertReturn>;
}

export default function ReturnForm({ 
  onSubmit, 
  isSubmitting = false, 
  suppliers = [],
  purchaseOrders = [],
  inventoryItems = [],
  initialData 
}: ReturnFormProps) {
  const [returnItems, setReturnItems] = useState([
    { inventoryItemId: "", itemName: "", quantity: 1, unitPrice: 0, totalPrice: 0, condition: "new" }
  ]);

  const form = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      supplierId: "",
      purchaseOrderId: "",
      returnNumber: `RTN-${Date.now()}`,
      status: "pending",
      reason: "",
      notes: "",
      items: returnItems,
      ...initialData,
    },
  });

  const selectedSupplierId = form.watch("supplierId");
  const filteredPurchaseOrders = purchaseOrders.filter(po => po.supplierId === selectedSupplierId);

  const calculateRefundAmount = () => {
    return returnItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const updateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const newItems = [...returnItems];
    newItems[index].quantity = quantity;
    newItems[index].unitPrice = unitPrice;
    newItems[index].totalPrice = quantity * unitPrice;
    setReturnItems(newItems);
    form.setValue("items", newItems);
  };

  const addItem = () => {
    const newItems = [...returnItems, { 
      inventoryItemId: "", 
      itemName: "", 
      quantity: 1, 
      unitPrice: 0, 
      totalPrice: 0,
      condition: "new"
    }];
    setReturnItems(newItems);
    form.setValue("items", newItems);
  };

  const removeItem = (index: number) => {
    if (returnItems.length > 1) {
      const newItems = returnItems.filter((_, i) => i !== index);
      setReturnItems(newItems);
      form.setValue("items", newItems);
    }
  };

  const handleInventoryItemSelect = (index: number, itemId: string) => {
    const inventoryItem = inventoryItems.find(item => item.id === itemId);
    if (inventoryItem) {
      const newItems = [...returnItems];
      newItems[index].inventoryItemId = itemId;
      newItems[index].itemName = inventoryItem.name;
      newItems[index].unitPrice = parseFloat(inventoryItem.costPrice || "0");
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
      setReturnItems(newItems);
      form.setValue("items", newItems);
    }
  };

  const handleSubmit = (data: ReturnFormData) => {
    const refundAmount = calculateRefundAmount();

    const formattedData = {
      ...data,
      refundAmount: refundAmount.toString(),
      items: returnItems,
    };

    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Return Information</CardTitle>
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
                name="purchaseOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Purchase Order</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Purchase Order (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredPurchaseOrders.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.orderNumber} - £{po.total}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="returnNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Number *</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Return *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain why these items are being returned"
                      className="h-20"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Return Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Return Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {returnItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {returnItems.length > 1 && (
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

                  <div>
                    <label className="text-sm font-medium">Condition *</label>
                    <Select 
                      value={item.condition}
                      onValueChange={(value) => {
                        const newItems = [...returnItems];
                        newItems[index].condition = value;
                        setReturnItems(newItems);
                        form.setValue("items", newItems);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Item Name *</label>
                    <Input
                      value={item.itemName}
                      onChange={(e) => {
                        const newItems = [...returnItems];
                        newItems[index].itemName = e.target.value;
                        setReturnItems(newItems);
                        form.setValue("items", newItems);
                      }}
                      placeholder="Enter item name"
                    />
                  </div>

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

            {/* Return Total */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Refund Amount:</span>
                    <span>£{calculateRefundAmount().toFixed(2)}</span>
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
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about this return"
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
          <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
            {isSubmitting ? "Creating..." : "Create Return"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
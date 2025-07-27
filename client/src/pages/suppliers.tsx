import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Truck, ShoppingCart, Edit, Trash, FileText, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EmptyState from "@/components/ui/empty-state";
import SupplierForm from "@/components/forms/supplier-form";
import PurchaseOrderForm from "@/components/forms/purchase-order-form";
import ReturnForm from "@/components/forms/return-form";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Supplier, PurchaseOrderWithDetails, ReturnWithDetails, InventoryItem } from "@shared/schema";

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPurchaseOrderForm, setShowPurchaseOrderForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: purchaseOrders = [] } = useQuery<PurchaseOrderWithDetails[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: returns = [] } = useQuery<ReturnWithDetails[]>({
    queryKey: ["/api/returns"],
  });

  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
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

  const createPurchaseOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/purchase-orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      setShowPurchaseOrderForm(false);
    },
  });

  const createReturnMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/returns", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      setShowReturnForm(false);
    },
  });

  const updatePurchaseOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/purchase-orders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
  });

  const updateReturnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/returns/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
  });

  const generatePDF = async (type: string, id: string) => {
    try {
      const response = await apiRequest("POST", "/api/generate-pdf", { type, id });
      if (response.success) {
        // Simple PDF generation using jsPDF
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        const data = response.data;
        doc.setFontSize(20);
        doc.text(data.title, 20, 20);
        
        doc.setFontSize(12);
        let yPosition = 40;
        
        if (type === 'purchase-order') {
          doc.text(`Supplier: ${data.supplier}`, 20, yPosition);
          yPosition += 10;
          doc.text(`Order Date: ${new Date(data.orderDate).toLocaleDateString()}`, 20, yPosition);
          yPosition += 10;
          if (data.expectedDelivery) {
            doc.text(`Expected Delivery: ${new Date(data.expectedDelivery).toLocaleDateString()}`, 20, yPosition);
            yPosition += 10;
          }
          
          yPosition += 10;
          doc.text('Items:', 20, yPosition);
          yPosition += 10;
          
          data.items.forEach((item: any) => {
            doc.text(`• ${item.itemName} - Qty: ${item.quantity} - £${item.totalPrice}`, 30, yPosition);
            yPosition += 8;
          });
          
          yPosition += 10;
          doc.text(`Subtotal: £${data.subtotal}`, 20, yPosition);
          yPosition += 8;
          doc.text(`Tax: £${data.tax}`, 20, yPosition);
          yPosition += 8;
          doc.setFont(undefined, 'bold');
          doc.text(`Total: £${data.total}`, 20, yPosition);
        } else {
          doc.text(`Supplier: ${data.supplier}`, 20, yPosition);
          yPosition += 10;
          doc.text(`Return Date: ${new Date(data.returnDate).toLocaleDateString()}`, 20, yPosition);
          yPosition += 10;
          doc.text(`Reason: ${data.reason}`, 20, yPosition);
          yPosition += 20;
          
          doc.text('Items:', 20, yPosition);
          yPosition += 10;
          
          data.items.forEach((item: any) => {
            doc.text(`• ${item.itemName} - Qty: ${item.quantity} - £${item.totalPrice}`, 30, yPosition);
            yPosition += 8;
          });
          
          yPosition += 10;
          doc.setFont(undefined, 'bold');
          doc.text(`Refund Amount: £${data.refundAmount}`, 20, yPosition);
        }
        
        if (data.notes) {
          yPosition += 20;
          doc.setFont(undefined, 'normal');
          doc.text(`Notes: ${data.notes}`, 20, yPosition);
        }
        
        doc.save(`${data.title.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

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
          <TabsTrigger value="orders">Purchase Orders ({purchaseOrders.length})</TabsTrigger>
          <TabsTrigger value="returns">Returns ({returns.length})</TabsTrigger>
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

        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Purchase Orders</h3>
            <Dialog open={showPurchaseOrderForm} onOpenChange={setShowPurchaseOrderForm}>
              <DialogTrigger asChild>
                <Button className="bg-wrench-green hover:bg-wrench-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Purchase Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                </DialogHeader>
                <PurchaseOrderForm
                  onSubmit={(data) => createPurchaseOrderMutation.mutate(data)}
                  isSubmitting={createPurchaseOrderMutation.isPending}
                  suppliers={suppliers}
                  inventoryItems={inventoryItems}
                />
              </DialogContent>
            </Dialog>
          </div>

          {purchaseOrders.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="w-8 h-8 text-gray-400" />}
              title="No purchase orders yet"
              description="Create your first purchase order to start ordering from suppliers."
              action={{
                label: "Create Purchase Order",
                onClick: () => setShowPurchaseOrderForm(true)
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.supplier.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.status === 'approved' ? 'default' :
                              order.status === 'delivered' ? 'secondary' :
                              order.status === 'cancelled' ? 'destructive' : 'outline'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'Not set'}
                        </TableCell>
                        <TableCell>£{order.total}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePurchaseOrderMutation.mutate({ 
                                  id: order.id, 
                                  data: { status: 'approved' } 
                                })}
                              >
                                Approve
                              </Button>
                            )}
                            {order.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => generatePDF('purchase-order', order.id)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="returns" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Returns</h3>
            <Dialog open={showReturnForm} onOpenChange={setShowReturnForm}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Create Return
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Return</DialogTitle>
                </DialogHeader>
                <ReturnForm
                  onSubmit={(data) => createReturnMutation.mutate(data)}
                  isSubmitting={createReturnMutation.isPending}
                  suppliers={suppliers}
                  purchaseOrders={purchaseOrders}
                  inventoryItems={inventoryItems}
                />
              </DialogContent>
            </Dialog>
          </div>

          {returns.length === 0 ? (
            <EmptyState
              icon={<RotateCcw className="w-8 h-8 text-gray-400" />}
              title="No returns yet"
              description="Return orders will appear here when you process returns to suppliers."
              action={{
                label: "Create Return",
                onClick: () => setShowReturnForm(true)
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Refund Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returns.map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-medium">{returnItem.returnNumber}</TableCell>
                        <TableCell>{returnItem.supplier.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              returnItem.status === 'approved' ? 'default' :
                              returnItem.status === 'completed' ? 'secondary' :
                              returnItem.status === 'processed' ? 'outline' : 'outline'
                            }
                          >
                            {returnItem.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(returnItem.returnDate).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{returnItem.reason}</TableCell>
                        <TableCell>£{returnItem.refundAmount}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {returnItem.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReturnMutation.mutate({ 
                                  id: returnItem.id, 
                                  data: { status: 'approved' } 
                                })}
                              >
                                Approve
                              </Button>
                            )}
                            {returnItem.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => generatePDF('return', returnItem.id)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

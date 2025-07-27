import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import EmptyState from "@/components/ui/empty-state";
import CustomerForm from "@/components/forms/customer-form";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Customer } from "@shared/schema";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/customers", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setShowAddForm(false);
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/customers/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    },
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  if (isLoading) {
    return <div>Loading customers...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customers</h2>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-wrench-green hover:bg-wrench-dark">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Add a new customer to your database with their contact information.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm 
              onSubmit={(data) => createCustomerMutation.mutate(data)}
              isSubmitting={createCustomerMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-gray-400" />}
          title="No customers found"
          description={searchTerm ? "No customers match your search criteria." : "Start by adding your first customer to begin managing your client database."}
          action={{
            label: "Add Your First Customer",
            onClick: () => setShowAddForm(true)
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{customer.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {customer.email && <p><strong>Email:</strong> {customer.email}</p>}
                    {customer.phone && <p><strong>Phone:</strong> {customer.phone}</p>}
                    {customer.address && <p><strong>Address:</strong> {customer.address}</p>}
                    {customer.notes && <p><strong>Notes:</strong> {customer.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteCustomerMutation.mutate(customer.id)}
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

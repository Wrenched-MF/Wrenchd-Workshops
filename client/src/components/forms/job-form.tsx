import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertJobSchema, type InsertJob, type Customer, type Vehicle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import JobPartsSelector from "./job-parts-selector";

interface JobPart {
  inventoryItemId: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface JobFormProps {
  onSubmit: (data: InsertJob & { jobParts: JobPart[] }) => void;
  isSubmitting?: boolean;
  initialData?: Partial<InsertJob>;
}

export default function JobForm({ onSubmit, isSubmitting, initialData }: JobFormProps) {
  const [selectedParts, setSelectedParts] = useState<JobPart[]>([]);
  
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<InsertJob>({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      title: "",
      description: "",
      status: "scheduled",
      scheduledDate: null,
      completedDate: null,
      laborHours: "0",
      laborRate: "50.00",
      partsTotal: "0",
      laborTotal: "0",
      totalAmount: "0",
      notes: "",
      photos: [],
      ...initialData,
    },
  });

  const selectedCustomerId = form.watch("customerId");

  const { data: customerVehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/customers", selectedCustomerId, "vehicles"],
    enabled: !!selectedCustomerId,
  });

  const calculateTotals = () => {
    const laborHours = parseFloat(form.getValues("laborHours") || "0");
    const laborRate = parseFloat(form.getValues("laborRate") || "0");
    const partsTotal = parseFloat(form.getValues("partsTotal") || "0");
    
    const laborTotal = laborHours * laborRate;
    const totalAmount = laborTotal + partsTotal;
    
    form.setValue("laborTotal", laborTotal.toFixed(2));
    form.setValue("totalAmount", totalAmount.toFixed(2));
  };

  const handlePartsChange = (parts: JobPart[]) => {
    setSelectedParts(parts);
    const partsTotal = parts.reduce((sum, part) => sum + part.totalPrice, 0);
    form.setValue("partsTotal", partsTotal.toFixed(2));
    calculateTotals();
  };

  const handlePartsTotalChange = (total: number) => {
    form.setValue("partsTotal", total.toFixed(2));
    calculateTotals();
  };

  const handleSubmit = (data: InsertJob) => {
    // Ensure dates are properly formatted - they should already be Date objects from the form
    const formattedData = {
      ...data,
      scheduledDate: data.scheduledDate || null,
      completedDate: data.completedDate || null,
      jobParts: selectedParts,
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
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
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!selectedCustomerId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customerVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Brake Pad Replacement, Oil Change" {...field} />
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
                <Textarea 
                  placeholder="Detailed description of the work to be performed"
                  className="h-20"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Scheduling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Date</FormLabel>
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
                      onSelect={(date) => field.onChange(date)}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parts Selection */}
        <div className="border-t pt-4">
          <JobPartsSelector
            parts={selectedParts}
            onPartsChange={handlePartsChange}
            onTotalChange={handlePartsTotalChange}
          />
        </div>

        {/* Pricing */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="laborHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labor Hours</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.25" 
                      placeholder="0.0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e);
                        setTimeout(calculateTotals, 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="laborRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labor Rate (£/hour)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="50.00"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e);
                        setTimeout(calculateTotals, 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partsTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parts Total (£)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      {...field}
                      value={field.value || ""}
                      readOnly
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Calculated from selected parts above
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="laborTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Labor Total (£)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} readOnly className="bg-gray-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount (£)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} readOnly className="bg-gray-50 font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional notes about this job"
                  className="h-16"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="bg-wrench-green hover:bg-wrench-dark">
            {isSubmitting ? "Creating..." : "Create Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

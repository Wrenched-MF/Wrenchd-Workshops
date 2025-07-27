import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertServiceBaySchema, type ServiceBay, type InsertServiceBay } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const serviceBayFormSchema = z.object({
  name: z.string().min(1, "Bay name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

type ServiceBayFormData = z.infer<typeof serviceBayFormSchema>;

interface ServiceBayFormProps {
  bay?: ServiceBay;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceBayForm({ bay, onSuccess, onCancel }: ServiceBayFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ServiceBayFormData>({
    resolver: zodResolver(serviceBayFormSchema),
    defaultValues: {
      name: bay?.name || "",
      description: bay?.description || "",
      color: bay?.color || "#3B82F6",
      isActive: bay?.isActive ?? true,
      sortOrder: bay?.sortOrder || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertServiceBay) => {
      console.log("Creating service bay with data:", data);
      const response = await apiRequest("/api/service-bays", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bays"] });
      toast({ title: "Service bay created successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Service bay creation error:", error);
      toast({ 
        title: "Failed to create service bay", 
        description: error?.message || "Please check your input and try again",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertServiceBay>) => {
      console.log("Updating service bay with data:", data);
      const response = await apiRequest(`/api/service-bays/${bay!.id}`, "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bays"] });
      toast({ title: "Service bay updated successfully" });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Service bay update error:", error);
      toast({ 
        title: "Failed to update service bay", 
        description: error?.message || "Please check your input and try again",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: ServiceBayFormData) => {
    console.log("Submitting service bay data:", data);
    const submitData = {
      ...data,
      description: data.description || null,
      color: data.color || "#3B82F6",
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder || 0,
    };
    
    if (bay) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">Please fix the following errors:</p>
          <ul className="text-sm text-red-600 mt-1">
            {Object.entries(form.formState.errors).map(([key, error]) => (
              <li key={key}>• {(error as any)?.message}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <Label htmlFor="name">Bay Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="e.g., Bay 1 - Services"
          className="mt-1"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Describe what type of work is done in this bay"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="color">Bay Color</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id="color"
            type="color"
            {...form.register("color")}
            className="w-12 h-10 p-1 rounded border"
          />
          <Input
            {...form.register("color")}
            placeholder="#3B82F6"
            className="flex-1"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">Color used to identify this bay in the diary</p>
      </div>

      <div>
        <Label htmlFor="sortOrder">Sort Order</Label>
        <Input
          id="sortOrder"
          type="number"
          {...form.register("sortOrder", { valueAsNumber: true })}
          placeholder="0"
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">Order in which bays appear (lower numbers first)</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          {...form.register("isActive")}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isActive">Active (bay available for scheduling)</Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Saving..." : bay ? "Update Bay" : "Create Bay"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
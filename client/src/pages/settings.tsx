import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Settings as SettingsIcon, FileText, CreditCard, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSettingsSchema, type InsertBusinessSettings, type BusinessSettings } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const { data: businessSettings, isLoading } = useQuery<BusinessSettings>({
    queryKey: ["/api/settings/business"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: InsertBusinessSettings) => 
      apiRequest("PUT", "/api/settings/business", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/business"] });
      toast({
        title: "Settings updated",
        description: "Your business settings have been saved successfully.",
      });
    },
  });

  const form = useForm<InsertBusinessSettings>({
    resolver: zodResolver(insertBusinessSettingsSchema),
    defaultValues: {
      businessName: businessSettings?.businessName || "",
      businessEmail: businessSettings?.businessEmail || "",
      businessPhone: businessSettings?.businessPhone || "",
      businessAddress: businessSettings?.businessAddress || "",
      currency: businessSettings?.currency || "GBP",
      logoUrl: businessSettings?.logoUrl || "",
    },
  });

  // Update form when data loads
  if (businessSettings && !form.formState.isDirty) {
    form.reset({
      businessName: businessSettings.businessName || "",
      businessEmail: businessSettings.businessEmail || "",
      businessPhone: businessSettings.businessPhone || "",
      businessAddress: businessSettings.businessAddress || "",
      currency: businessSettings.currency || "GBP",
      logoUrl: businessSettings.logoUrl || "",
    });
  }

  const onSubmit = (data: InsertBusinessSettings) => {
    updateSettingsMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <SettingsIcon className="w-6 h-6 text-wrench-green" />
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        </div>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="business" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="business" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">User Management</span>
              </TabsTrigger>
              <TabsTrigger value="app" className="flex items-center space-x-2">
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">App Settings</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="ceo" className="flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">CEO Panel</span>
              </TabsTrigger>
            </TabsList>

            {/* Business Information Tab */}
            <TabsContent value="business" className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="businessPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter business phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="businessEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter business email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GBP">British Pound (£)</SelectItem>
                              <SelectItem value="USD">US Dollar ($)</SelectItem>
                              <SelectItem value="EUR">Euro (€)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter business address" 
                            className="h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-6">
                    <Button 
                      type="submit" 
                      disabled={updateSettingsMutation.isPending}
                      className="bg-wrench-green hover:bg-wrench-dark"
                    >
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Document Templates</h3>
                <Button className="bg-wrench-green hover:bg-wrench-dark">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>

              {/* Template List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Default Receipt Template</h4>
                      <p className="text-sm text-gray-500">Standard receipt layout for completed work</p>
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">Default</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>

                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Custom Template
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Other tabs with placeholder content */}
            <TabsContent value="app">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">App Settings</h3>
                <p className="text-gray-500">Application settings will be available here.</p>
              </div>
            </TabsContent>

            <TabsContent value="billing">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing</h3>
                <p className="text-gray-500">Billing settings will be available here.</p>
              </div>
            </TabsContent>

            <TabsContent value="ceo">
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">CEO Panel</h3>
                <p className="text-gray-500">Advanced management features will be available here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
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
      businessName: "",
      businessEmail: "",
      businessPhone: "",
      businessAddress: "",
      currency: "GBP",
      logoUrl: "",
      pdfTemplate: "default",
      headerColor: "#000000",
      accentColor: "#22c55e",
    },
  });

  // Update form when data loads using useEffect to prevent infinite renders
  useEffect(() => {
    if (businessSettings) {
      form.reset({
        businessName: businessSettings.businessName || "",
        businessEmail: businessSettings.businessEmail || "",
        businessPhone: businessSettings.businessPhone || "",
        businessAddress: businessSettings.businessAddress || "",
        currency: businessSettings.currency || "GBP",
        logoUrl: businessSettings.logoUrl || "",
        pdfTemplate: businessSettings.pdfTemplate || "default",
        headerColor: businessSettings.headerColor || "#000000",
        accentColor: businessSettings.accentColor || "#22c55e",
      });
    }
  }, [businessSettings, form]);

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
                            <Input {...field} value={field.value || ""} />
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
                            <Input placeholder="Enter business phone" {...field} value={field.value || ""} />
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
                            <Input type="email" placeholder="Enter business email" {...field} value={field.value || ""} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value || "GBP"}>
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
                            value={field.value || ""}
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Templates</h3>
                  <p className="text-gray-500 mb-6">Customize the design and layout of your PDF documents including purchase orders, returns, quotes, and receipts.</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Template Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pdfTemplate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PDF Template Style</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "default"}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select template style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="default">Default WRENCH'D</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="minimal">Minimal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="headerColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Header Text Color</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value || "#000000"}
                                  className="w-16 h-10 p-1 border rounded"
                                />
                                <Input
                                  type="text"
                                  {...field}
                                  value={field.value || "#000000"}
                                  placeholder="#000000"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="accentColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Color (Auto Repairs Text)</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="color"
                                  {...field}
                                  value={field.value || "#22c55e"}
                                  className="w-16 h-10 p-1 border rounded"
                                />
                                <Input
                                  type="text"
                                  {...field}
                                  value={field.value || "#22c55e"}
                                  placeholder="#22c55e"
                                  className="flex-1"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Template Preview */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-3">Template Preview</h4>
                      <div className="bg-white border rounded p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div 
                              className="text-lg font-bold"
                              style={{ color: form.watch('headerColor') || '#000000' }}
                            >
                              WRENCH'D
                            </div>
                            <div 
                              className="text-sm font-semibold"
                              style={{ color: form.watch('accentColor') || '#22c55e' }}
                            >
                              AUTO REPAIRS
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-600">
                            <div>Mobile Mechanic Services</div>
                            <div>Phone: 07123 456789</div>
                            <div>Email: info@wrenchd.com</div>
                          </div>
                        </div>
                        <div className="border-t pt-2">
                          <div className="text-sm font-semibold">Purchase Order #PO-12345</div>
                          <div className="text-xs text-gray-500">Template: {form.watch('pdfTemplate') || 'default'}</div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateSettingsMutation.isPending}
                      className="w-full"
                    >
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Template Settings"}
                    </Button>
                  </form>
                </Form>
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

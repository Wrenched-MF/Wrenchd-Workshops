import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Settings as SettingsIcon, FileText, CreditCard, Crown, Upload, X, ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessSettingsSchema, type InsertBusinessSettings, type BusinessSettings } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TemplateEditorModal from "@/components/template-editor-modal";

export default function Settings() {
  const { toast } = useToast();
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: businessSettings, isLoading } = useQuery<BusinessSettings>({
    queryKey: ["/api/settings/business"],
  });

  const { data: customTemplates, isLoading: templatesLoading } = useQuery<any[]>({
    queryKey: ["/api/templates"],
  });

  const activateTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/templates/${templateId}/activate`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to activate template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template activated",
        description: "This template is now being used for your documents.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted",
        description: "The custom template has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    },
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
      logoPosition: "left",
      fontSize: 12,
      headerFontSize: 20,
      showLogo: true,
      footerText: "",
      headerLayout: "standard",
    },
  });

  // Update form when data loads using useEffect to prevent infinite renders
  useEffect(() => {
    if (businessSettings) {
      setUploadedLogo(businessSettings.logoUrl || null);
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
        logoPosition: businessSettings.logoPosition || "left",
        fontSize: businessSettings.fontSize || 12,
        headerFontSize: businessSettings.headerFontSize || 20,
        showLogo: businessSettings.showLogo !== false,
        footerText: businessSettings.footerText || "",
        headerLayout: businessSettings.headerLayout || "standard",
      });
    }
  }, [businessSettings, form]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Logo file size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedLogo(dataUrl);
        form.setValue('logoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setUploadedLogo(null);
    form.setValue('logoUrl', '');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Document Templates</h3>
                    <p className="text-gray-500 mb-6">Customize the design and layout of your PDF documents including purchase orders, returns, quotes, and receipts.</p>
                  </div>
                  <Button onClick={() => setIsTemplateEditorOpen(true)} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create Template</span>
                  </Button>
                </div>

                {/* Default Template Card */}
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">Default Receipt Template</h4>
                          <p className="text-sm text-gray-500">Standard receipt layout for completed work</p>
                          <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full mt-1">
                            Default
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <SettingsIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Templates by Category */}
                {customTemplates && Array.isArray(customTemplates) && customTemplates.length > 0 && (
                  <div className="space-y-6">
                    {/* Group templates by type */}
                    {['receipt', 'quote', 'purchase_order', 'return'].map((templateType) => {
                      const templatesOfType = (customTemplates || []).filter((t: any) => t.templateType === templateType);
                      if (templatesOfType.length === 0) return null;
                      
                      return (
                        <div key={templateType}>
                          <h4 className="text-md font-medium text-gray-900 mb-3 capitalize">
                            {templateType.replace('_', ' ')} Templates
                          </h4>
                          <div className="space-y-3">
                            {templatesOfType.map((template: any) => (
                              <Card key={template.id} className="border border-gray-200">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <FileText className="w-6 h-6 text-blue-500" />
                                      <div>
                                        <h5 className="font-medium text-gray-900">{template.templateName}</h5>
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                          template.isActive 
                                            ? 'text-green-700 bg-green-100' 
                                            : 'text-gray-600 bg-gray-100'
                                        }`}>
                                          {template.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {!template.isActive && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => activateTemplateMutation.mutate(template.id)}
                                          disabled={activateTemplateMutation.isPending}
                                        >
                                          Activate
                                        </Button>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => deleteTemplateMutation.mutate(template.id)}
                                        disabled={deleteTemplateMutation.isPending}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Create Custom Template Button */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Plus className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Create Custom Template</h4>
                  <p className="text-gray-500 mb-4">Design your own template with custom colors, layout, and branding</p>
                  <Button onClick={() => setIsTemplateEditorOpen(true)}>
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
      
      {/* Template Editor Modal */}
      <TemplateEditorModal
        open={isTemplateEditorOpen}
        onClose={() => setIsTemplateEditorOpen(false)}
        onSave={async (templateData) => {
          try {
            const response = await fetch('/api/templates', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(templateData),
            });
            
            if (response.ok) {
              toast({
                title: "Template saved",
                description: "Your custom template has been created successfully.",
              });
              setIsTemplateEditorOpen(false);
              // Refetch templates to update the list
              queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
            } else {
              toast({
                title: "Error",
                description: "Failed to save template. Please try again.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error('Error saving template:', error);
            toast({
              title: "Error",
              description: "Failed to save template. Please try again.",
              variant: "destructive",
            });
          }
        }}
        initialData={{
          companyName: businessSettings?.businessName || "WRENCH'D Auto Repairs",
          email: businessSettings?.businessEmail || "wrenchdmechanics@hotmail.com",
          phone: businessSettings?.businessPhone || "Contact: wrenchdmechanics@hotmail.com",
          address: businessSettings?.businessAddress || "Professional Mobile Mechanics\nServing Your Area",
          logoUrl: businessSettings?.logoUrl || "",
          primaryColor: businessSettings?.headerColor || "#16a34a",
          secondaryColor: businessSettings?.accentColor || "#000000",
          footerText: businessSettings?.footerText || "Professional Mobile Mechanic Services - Quality Work Guaranteed",
        }}
      />
    </div>
  );
}

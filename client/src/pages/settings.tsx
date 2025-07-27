import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Settings as SettingsIcon, FileText, CreditCard, Crown, Upload, X, ImageIcon } from "lucide-react";
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

export default function Settings() {
  const { toast } = useToast();
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Templates</h3>
                  <p className="text-gray-500 mb-6">Customize the design and layout of your PDF documents including purchase orders, returns, quotes, and receipts.</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {/* Logo Upload Section */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Company Logo</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="showLogo"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Show Logo on PDFs</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {form.watch('logoUrl') || uploadedLogo ? (
                              <div className="relative">
                                <img 
                                  src={uploadedLogo || form.watch('logoUrl')} 
                                  alt="Company logo" 
                                  className="w-full h-32 object-contain rounded-lg bg-gray-50"
                                />
                                <button
                                  type="button"
                                  onClick={removeLogo}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                                <div className="mt-2">
                                  <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Logo
                                  </button>
                                  <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                  />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="logoPosition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo Position</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "left"}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select logo position" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="left">Left Side</SelectItem>
                                  <SelectItem value="center">Center</SelectItem>
                                  <SelectItem value="right">Right Side</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Template and Layout Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Template Style</h4>
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
                          name="headerLayout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Header Layout</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "standard"}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select header layout" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="centered">Centered</SelectItem>
                                  <SelectItem value="split">Split Layout</SelectItem>
                                  <SelectItem value="compact">Compact</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Color Customization */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Colors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    {/* Typography Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Typography</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="headerFontSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Header Font Size: {field.value}px</FormLabel>
                              <FormControl>
                                <Slider
                                  value={[field.value || 20]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  max={30}
                                  min={14}
                                  step={1}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fontSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Body Font Size: {field.value}px</FormLabel>
                              <FormControl>
                                <Slider
                                  value={[field.value || 12]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  max={16}
                                  min={8}
                                  step={1}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Footer Customization */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Footer</h4>
                      <FormField
                        control={form.control}
                        name="footerText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Footer Text</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter custom footer text (optional)"
                                className="h-20"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Enhanced Template Preview */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Live Preview</h4>
                      <div className="border rounded-lg p-6 bg-gray-50">
                        <div className="bg-white border rounded-lg p-6 space-y-4">
                          {/* Header Section */}
                          <div className={`flex items-start ${
                            form.watch('headerLayout') === 'centered' ? 'justify-center text-center' :
                            form.watch('headerLayout') === 'split' ? 'justify-between' :
                            'justify-start'
                          }`}>
                            {form.watch('showLogo') && (form.watch('logoUrl') || uploadedLogo) && (
                              <div className={`${
                                form.watch('logoPosition') === 'center' ? 'mx-auto' :
                                form.watch('logoPosition') === 'right' ? 'ml-auto' :
                                'mr-4'
                              }`}>
                                <img 
                                  src={uploadedLogo || form.watch('logoUrl')} 
                                  alt="Logo preview" 
                                  className="h-12 w-auto object-contain"
                                />
                              </div>
                            )}
                            
                            <div className={form.watch('headerLayout') === 'centered' ? 'text-center' : ''}>
                              <div 
                                className="font-bold"
                                style={{ 
                                  color: form.watch('headerColor') || '#000000',
                                  fontSize: `${form.watch('headerFontSize') || 20}px`
                                }}
                              >
                                WRENCH'D
                              </div>
                              <div 
                                className="font-semibold"
                                style={{ 
                                  color: form.watch('accentColor') || '#22c55e',
                                  fontSize: `${(form.watch('headerFontSize') || 20) * 0.7}px`
                                }}
                              >
                                AUTO REPAIRS
                              </div>
                            </div>

                            {form.watch('headerLayout') !== 'centered' && (
                              <div className="text-right text-xs text-gray-600 ml-auto">
                                <div>Mobile Mechanic Services</div>
                                <div>Phone: 07123 456789</div>
                                <div>Email: info@wrenchd.com</div>
                                <div>Website: www.wrenchd.co.uk</div>
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="border-t border-gray-300"></div>

                          {/* Document Content */}
                          <div className="space-y-3">
                            <div 
                              className="font-semibold"
                              style={{ fontSize: `${(form.watch('fontSize') || 12) + 4}px` }}
                            >
                              Purchase Order #PO-12345
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <div className="font-medium">To:</div>
                                <div>Spartan Motor Factors</div>
                                <div>Barry, Wales</div>
                              </div>
                              <div className="text-right">
                                <div>Date: {new Date().toLocaleDateString()}</div>
                                <div>Template: {form.watch('pdfTemplate') || 'default'}</div>
                                <div>Layout: {form.watch('headerLayout') || 'standard'}</div>
                              </div>
                            </div>

                            {/* Sample Table */}
                            <div className="mt-4">
                              <div className="bg-gray-100 px-3 py-2 text-xs font-medium border">
                                Item Description | Qty | Unit Price | Total
                              </div>
                              <div 
                                className="px-3 py-2 border border-t-0"
                                style={{ fontSize: `${form.watch('fontSize') || 12}px` }}
                              >
                                Oil Filter | 2 | £8.00 | £16.00
                              </div>
                            </div>
                          </div>

                          {/* Footer Preview */}
                          {form.watch('footerText') && (
                            <div className="border-t pt-3 mt-4">
                              <div 
                                className="text-xs text-gray-600"
                                style={{ fontSize: `${(form.watch('fontSize') || 12) - 2}px` }}
                              >
                                {form.watch('footerText')}
                              </div>
                            </div>
                          )}

                          <div className="border-t pt-2 mt-4">
                            <div className="text-xs text-gray-500">
                              Thank you for choosing WRENCH'D for your automotive needs!
                            </div>
                          </div>
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

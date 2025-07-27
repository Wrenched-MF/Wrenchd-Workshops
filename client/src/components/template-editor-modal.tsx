import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const templateSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  templateType: z.enum(["receipt", "quote", "purchase-order", "return"]),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  logoUrl: z.string().optional(),
  headerText: z.string().optional(),
  footerText: z.string().min(1, "Footer text is required"),
  termsConditions: z.string().optional(),
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  showCompanyLogo: z.boolean().default(true),
  showCompanyDetails: z.boolean().default(true),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TemplateFormData) => void;
  initialData?: Partial<TemplateFormData>;
}

export default function TemplateEditorModal({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}: TemplateEditorModalProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);

  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateName: "",
      templateType: "receipt",
      companyName: "WRENCH'D Auto Repairs",
      email: "wrenchdmechanics@hotmail.com",
      phone: "Contact: wrenchdmechanics@hotmail.com",
      address: "Professional Mobile Mechanics\nServing Your Area",
      headerText: "",
      footerText: "Professional Mobile Mechanic Services - Quality Work Guaranteed",
      termsConditions: "All work guaranteed for 30 days. Payment due upon completion.",
      primaryColor: "#16a34a",
      secondaryColor: "#000000",
      showCompanyLogo: true,
      showCompanyDetails: true,
      ...initialData,
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setLogoPreview(dataUrl);
        form.setValue("logoUrl", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log("Preview template with data:", form.getValues());
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality
    console.log("Download PDF with template:", form.getValues());
  };

  const onSubmit = (data: TemplateFormData) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create Custom Template
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="styling">Styling</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="templateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Custom Template" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="templateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select template type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="receipt">Receipt</SelectItem>
                            <SelectItem value="quote">Quote</SelectItem>
                            <SelectItem value="purchase-order">Purchase Order</SelectItem>
                            <SelectItem value="return">Return</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Company Tab */}
              <TabsContent value="company" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Logo URL</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("logo-upload")?.click()}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Logo</span>
                      </Button>
                      {logoPreview && (
                        <div className="w-10 h-10 border rounded overflow-hidden">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <Input
                      value={form.watch("logoUrl") || ""}
                      placeholder="/assets/logo_123456789.png"
                      readOnly
                      className="text-xs text-gray-500"
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Professional Mobile Mechanics&#10;Serving Your Area"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <FormField
                  control={form.control}
                  name="headerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional header message" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="footerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Footer Text</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Professional Mobile Mechanic Services - Quality Work Guaranteed"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="termsConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="All work guaranteed for 30 days. Payment due upon completion."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Styling Tab */}
              <TabsContent value="styling" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: field.value }}
                          />
                          <FormControl>
                            <Input {...field} placeholder="#16a34a" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: field.value }}
                          />
                          <FormControl>
                            <Input {...field} placeholder="#000000" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showCompanyLogo"
                      checked={form.watch("showCompanyLogo")}
                      onChange={(e) => form.setValue("showCompanyLogo", e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="showCompanyLogo" className="text-sm font-medium">
                      Show Company Logo
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showCompanyDetails"
                      checked={form.watch("showCompanyDetails")}
                      onChange={(e) => form.setValue("showCompanyDetails", e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="showCompanyDetails" className="text-sm font-medium">
                      Show Company Details
                    </label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button type="button" variant="outline" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Template
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
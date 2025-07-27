import { useQuery, useMutation } from "@tanstack/react-query";
import { Briefcase, ShoppingCart, RotateCcw, Search, Receipt as ReceiptIcon, Download, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/ui/stats-card";
import EmptyState from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import type { Receipt, JobWithDetails, QuoteWithDetails } from "@shared/schema";

export default function Receipts() {
  const { toast } = useToast();
  
  const { data: receiptsData, isLoading: receiptsLoading } = useQuery({
    queryKey: ["/api/receipts"],
  });
  
  const receipts = receiptsData?.receipts || [];
  const pdfDocuments = receiptsData?.pdfDocuments || [];

  const deleteQuoteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/quotes/${id}`),
    onSuccess: (_, deletedId) => {
      // Optimistically remove from cache
      queryClient.setQueryData(["/api/receipts"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pdfDocuments: oldData.pdfDocuments.filter((doc: any) => doc.id !== deletedId)
        };
      });
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      
      toast({
        title: "Quote deleted",
        description: "Quote has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error("Delete quote error:", error);
      toast({
        title: "Error",
        description: "Failed to delete quote.",
        variant: "destructive",
      });
    },
  });

  const deleteReceiptMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/receipts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      toast({
        title: "Receipt deleted",
        description: "Receipt has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete receipt.",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePDF = async (type: string, id: string) => {
    const { generatePDF } = await import('@/utils/pdfGenerator');
    await generatePDF(type, id);
  };

  const handlePreviewPDF = async (type: string, id: string) => {
    const { previewPDF } = await import('@/utils/pdfGenerator');
    await previewPDF(type, id);
  };

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<JobWithDetails[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: quotes = [], isLoading: quotesLoading } = useQuery<QuoteWithDetails[]>({
    queryKey: ["/api/quotes"],
  });

  const completedJobs = jobs.filter(job => job.status === 'completed');
  const totalValue = completedJobs.reduce((sum, job) => sum + parseFloat(job.totalAmount || '0'), 0);

  if (receiptsLoading || jobsLoading || quotesLoading) {
    return <div>Loading receipts...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Receipts</h2>
        <p className="text-gray-600">Generate and manage receipts for jobs, purchases, and returns</p>
      </div>

      {/* Receipt Type Tabs */}
      <Tabs defaultValue="job-receipts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="job-receipts" className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4" />
            <span>Job Receipts ({completedJobs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="purchase-receipts" className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Orders ({pdfDocuments.filter(doc => doc.type === 'purchase-order').length})</span>
          </TabsTrigger>
          <TabsTrigger value="return-receipts" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Returns ({pdfDocuments.filter(doc => doc.type === 'return').length})</span>
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Quotes ({pdfDocuments.filter(doc => doc.type === 'quote').length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="job-receipts" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Jobs"
              value={jobs.length}
              icon={<Briefcase />}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <StatsCard
              title="Completed"
              value={completedJobs.length}
              icon={<Briefcase />}
            />
            <StatsCard
              title="Quotes"
              value={quotes.length}
              icon={<ReceiptIcon />}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
            <StatsCard
              title="Total Value"
              value={`£${totalValue.toFixed(2)}`}
              icon={<Briefcase />}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search jobs, customers, or vehicles..."
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="completed">Completed Jobs</SelectItem>
                <SelectItem value="quotes">Quotes</SelectItem>
                <SelectItem value="invoices">Invoices</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          {completedJobs.length === 0 ? (
            <EmptyState
              icon={<ReceiptIcon className="w-8 h-8 text-gray-400" />}
              title="No completed jobs or quotes available yet"
              description="Complete your first job to generate receipts and build your business records."
            />
          ) : (
            <div className="space-y-4">
              {completedJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <p className="text-gray-600 mb-2">{job.customer.name} - {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {job.completedDate && (
                          <span>Completed: {new Date(job.completedDate).toLocaleDateString()}</span>
                        )}
                        <span>Parts: {job.parts.length}</span>
                        {job.laborHours && <span>Labor: {job.laborHours}h</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        £{parseFloat(job.totalAmount || '0').toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <button className="text-wrench-green hover:text-wrench-dark text-sm font-medium">
                          View Receipt
                        </button>
                        <span className="text-gray-300">|</span>
                        <button className="text-wrench-green hover:text-wrench-dark text-sm font-medium">
                          Email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchase-receipts">
          <EmptyState
            icon={<ShoppingCart className="w-8 h-8 text-gray-400" />}
            title="No purchase receipts yet"
            description="Purchase receipts will appear here when you order parts from suppliers."
          />
        </TabsContent>

        <TabsContent value="return-receipts">
          <EmptyState
            icon={<RotateCcw className="w-8 h-8 text-gray-400" />}
            title="No return receipts yet"
            description="Return receipts will appear here when you process returns to suppliers."
          />
        </TabsContent>

        <TabsContent value="purchase-receipts" className="space-y-6">
          {pdfDocuments.filter(doc => doc.type === 'purchase-order').length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="w-8 h-8 text-gray-400" />}
              title="No purchase order documents"
              description="Approved purchase orders will appear here for download."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Purchase Order Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pdfDocuments
                      .filter(doc => doc.type === 'purchase-order')
                      .map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{doc.supplier}</TableCell>
                          <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                          <TableCell>£{doc.amount}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePreviewPDF('purchase-order', doc.id)}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleGeneratePDF('purchase-order', doc.id)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </Button>
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

        <TabsContent value="return-receipts" className="space-y-6">
          {pdfDocuments.filter(doc => doc.type === 'return').length === 0 ? (
            <EmptyState
              icon={<RotateCcw className="w-8 h-8 text-gray-400" />}
              title="No return documents"
              description="Approved returns will appear here for download."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Return Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Refund Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pdfDocuments
                      .filter(doc => doc.type === 'return')
                      .map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{doc.supplier}</TableCell>
                          <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                          <TableCell>£{doc.amount}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePreviewPDF('return', doc.id)}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleGeneratePDF('return', doc.id)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </Button>
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

        <TabsContent value="quotes" className="space-y-6">
          {pdfDocuments.filter(doc => doc.type === 'quote').length === 0 ? (
            <EmptyState
              icon={<FileText className="w-8 h-8 text-gray-400" />}
              title="No quote documents"
              description="Generated quotes will appear here for download."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Quote Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pdfDocuments
                      .filter(doc => doc.type === 'quote')
                      .map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>{doc.customer}</TableCell>
                          <TableCell>{new Date(doc.date).toLocaleDateString()}</TableCell>
                          <TableCell>£{doc.amount}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePreviewPDF('quote', doc.id)}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleGeneratePDF('quote', doc.id)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteQuoteMutation.mutate(doc.id)}
                                disabled={deleteQuoteMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
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

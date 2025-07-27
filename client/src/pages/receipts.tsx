import { useQuery } from "@tanstack/react-query";
import { Briefcase, ShoppingCart, RotateCcw, Search, Receipt as ReceiptIcon, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/ui/stats-card";
import EmptyState from "@/components/ui/empty-state";
import type { Receipt, JobWithDetails, QuoteWithDetails } from "@shared/schema";

export default function Receipts() {
  const { data: receiptsData, isLoading: receiptsLoading } = useQuery({
    queryKey: ["/api/receipts"],
  });
  
  const receipts = receiptsData?.receipts || [];
  const pdfDocuments = receiptsData?.pdfDocuments || [];

  const generatePDF = async (type: string, id: string) => {
    try {
      const response = await apiRequest("POST", "/api/generate-pdf", { type, id }) as any;
      if (response.success) {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        
        const data = response.data;
        
        const generatePDFContent = () => {
          // Company details header
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('WRENCH\'D AUTO REPAIRS', 140, 15);
          doc.text('Mobile Mechanic Services', 140, 20);
          doc.text('Phone: 07123 456789', 140, 25);
          doc.text('Email: info@wrenchd.com', 140, 30);
          
          // Horizontal line
          doc.setLineWidth(0.5);
          doc.line(15, 40, 195, 40);
          
          // Document title
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text(data.title, 15, 55);
          
          let yPosition = 70;
          
          if (type === 'purchase-order') {
            // Order details section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Order Details:', 15, yPosition);
            yPosition += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.text(`Supplier: ${data.supplier}`, 15, yPosition);
            doc.text(`Order Date: ${new Date(data.orderDate).toLocaleDateString()}`, 110, yPosition);
            yPosition += 6;
            
            if (data.expectedDelivery) {
              doc.text(`Expected Delivery: ${new Date(data.expectedDelivery).toLocaleDateString()}`, 15, yPosition);
              yPosition += 6;
            }
            
            yPosition += 10;
            
            // Items table header
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(240, 240, 240);
            doc.rect(15, yPosition, 180, 8, 'F');
            doc.text('Item', 20, yPosition + 5);
            doc.text('Qty', 120, yPosition + 5);
            doc.text('Unit Price', 140, yPosition + 5);
            doc.text('Total', 170, yPosition + 5);
            yPosition += 10;
            
            // Items
            doc.setFont('helvetica', 'normal');
            data.items.forEach((item: any) => {
              doc.text(item.itemName, 20, yPosition);
              doc.text(item.quantity.toString(), 125, yPosition);
              doc.text(`£${item.unitPrice}`, 145, yPosition);
              doc.text(`£${item.totalPrice}`, 175, yPosition);
              yPosition += 6;
            });
            
            // Totals section
            yPosition += 10;
            doc.line(140, yPosition, 195, yPosition);
            yPosition += 5;
            doc.text(`Subtotal: £${data.subtotal}`, 140, yPosition);
            yPosition += 6;
            doc.text(`Tax: £${data.tax}`, 140, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'bold');
            doc.text(`Total: £${data.total}`, 140, yPosition);
            
          } else {
            // Return details section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Return Details:', 15, yPosition);
            yPosition += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.text(`Supplier: ${data.supplier}`, 15, yPosition);
            doc.text(`Return Date: ${new Date(data.returnDate).toLocaleDateString()}`, 110, yPosition);
            yPosition += 6;
            doc.text(`Reason: ${data.reason || 'Not specified'}`, 15, yPosition);
            yPosition += 10;
            
            // Items table header
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(240, 240, 240);
            doc.rect(15, yPosition, 180, 8, 'F');
            doc.text('Item', 20, yPosition + 5);
            doc.text('Qty', 120, yPosition + 5);
            doc.text('Condition', 140, yPosition + 5);
            doc.text('Total', 170, yPosition + 5);
            yPosition += 10;
            
            // Items
            doc.setFont('helvetica', 'normal');
            data.items.forEach((item: any) => {
              doc.text(item.itemName, 20, yPosition);
              doc.text(item.quantity.toString(), 125, yPosition);
              doc.text(item.condition, 145, yPosition);
              doc.text(`£${item.totalPrice}`, 175, yPosition);
              yPosition += 6;
            });
            
            // Refund amount
            yPosition += 10;
            doc.line(140, yPosition, 195, yPosition);
            yPosition += 5;
            doc.setFont('helvetica', 'bold');
            doc.text(`Refund Amount: £${data.refundAmount}`, 140, yPosition);
          }
          
          // Notes section
          if (data.notes) {
            yPosition += 15;
            doc.setFont('helvetica', 'bold');
            doc.text('Notes:', 15, yPosition);
            yPosition += 6;
            doc.setFont('helvetica', 'normal');
            const splitNotes = doc.splitTextToSize(data.notes || '', 180);
            doc.text(splitNotes, 15, yPosition);
          }
          
          // Footer
          const footerY = 280;
          doc.setLineWidth(0.5);
          doc.line(15, footerY, 195, footerY);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text('WRENCH\'D AUTO REPAIRS - Mobile Mechanic Services', 15, footerY + 5);
          doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 15, footerY + 10);
          
          doc.save(`WRENCHD_${data.title.replace(/\s+/g, '_')}.pdf`);
        };
        
        generatePDFContent();
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => generatePDF('purchase-order', doc.id)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
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
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => generatePDF('return', doc.id)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
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

import { useQuery } from "@tanstack/react-query";
import { Briefcase, ShoppingCart, RotateCcw, Search, Receipt as ReceiptIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/ui/stats-card";
import EmptyState from "@/components/ui/empty-state";
import type { Receipt, JobWithDetails, QuoteWithDetails } from "@shared/schema";

export default function Receipts() {
  const { data: receipts = [], isLoading: receiptsLoading } = useQuery<Receipt[]>({
    queryKey: ["/api/receipts"],
  });

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
            <span>Purchase Receipts (0)</span>
          </TabsTrigger>
          <TabsTrigger value="return-receipts" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Return Receipts (0)</span>
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
      </Tabs>
    </div>
  );
}

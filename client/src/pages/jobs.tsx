import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calendar, Wrench, Check, PoundSterling, Briefcase, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import StatsCard from "@/components/ui/stats-card";
import EmptyState from "@/components/ui/empty-state";
import JobForm from "@/components/forms/job-form";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { JobWithDetails } from "@shared/schema";

export default function Jobs() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobWithDetails | null>(null);

  const { data: jobs = [], isLoading } = useQuery<JobWithDetails[]>({
    queryKey: ["/api/jobs"],
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating job with data:", data);
      const response = await apiRequest("POST", "/api/jobs", data);
      console.log("Job creation response:", response);
      return response;
    },
    onSuccess: () => {
      console.log("Job created successfully");
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-bays"] }); // Refresh calendar data
      setShowAddForm(false);
    },
    onError: (error: any) => {
      console.error("Job creation failed:", error);
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/jobs/${id}`, data),
    onSuccess: (updatedJob: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-bays"] }); // Refresh calendar data
      
      // Auto-generate receipt PDF when job is completed
      if (updatedJob && updatedJob.status === 'completed') {
        generateReceiptPdf(updatedJob.id);
      }
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
  });

  const generateQuotePdfMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest("POST", `/api/jobs/${jobId}/quote-pdf`),
    onSuccess: (response: any) => {
      // Download the PDF
      if (response && response.pdfUrl) {
        window.open(response.pdfUrl, '_blank');
      }
    },
  });

  const generateReceiptPdf = async (jobId: string) => {
    try {
      const response: any = await apiRequest("POST", `/api/jobs/${jobId}/receipt-pdf`);
      if (response && response.pdfUrl) {
        window.open(response.pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to generate receipt PDF:', error);
    }
  };

  const handleEditJob = (job: JobWithDetails) => {
    setEditingJob(job);
    setShowEditForm(true);
  };

  const updateJobDetails = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setShowEditForm(false);
      setEditingJob(null);
    },
  });

  // Calculate stats
  const scheduledJobs = jobs.filter(job => job.status === 'scheduled').length;
  const inProgressJobs = jobs.filter(job => job.status === 'in_progress').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const totalJobValue = jobs.reduce((sum, job) => sum + parseFloat(job.totalAmount || '0'), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'in_progress':
        return <Wrench className="w-5 h-5 text-orange-600" />;
      case 'completed':
        return <Check className="w-5 h-5 text-green-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`;
  };

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Jobs</h2>
          <p className="text-gray-600">Manage your service jobs and workflow</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-wrench-green hover:bg-wrench-dark">
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new service job for a customer's vehicle.
              </DialogDescription>
            </DialogHeader>
            <JobForm 
              onSubmit={(data) => createJobMutation.mutate(data)}
              isSubmitting={createJobMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Job Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Scheduled"
          value={scheduledJobs}
          icon={<Calendar />}
          valueColor="text-blue-600"
        />
        <StatsCard
          title="In Progress"
          value={inProgressJobs}
          icon={<Wrench />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          valueColor="text-orange-600"
        />
        <StatsCard
          title="Completed"
          value={completedJobs}
          icon={<Check />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          valueColor="text-green-600"
        />
        <StatsCard
          title="Total Value"
          value={`£${totalJobValue.toFixed(2)}`}
          icon={<PoundSterling />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8 text-gray-400" />}
          title="No jobs scheduled yet"
          description="Start by creating your first job to begin tracking your mobile mechanic work."
          action={{
            label: "Create Your First Job",
            onClick: () => setShowAddForm(true)
          }}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    job.status === 'completed' ? 'bg-green-100' :
                    job.status === 'in_progress' ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    {getStatusIcon(job.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                        {job.jobNumber && (
                          <p className="text-sm font-mono text-blue-600 mb-1">{job.jobNumber}</p>
                        )}
                        <p className="text-gray-600 mb-2">{job.customer.name} - {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}</p>
                        {job.description && (
                          <p className="text-sm text-gray-500 mb-3">{job.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {job.scheduledDate && (
                            <span>Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}</span>
                          )}
                          {job.laborHours && (
                            <span>Labor: {job.laborHours}h</span>
                          )}
                          <span>Parts: {job.parts.length}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          £{parseFloat(job.totalAmount || '0').toFixed(2)}
                        </p>
                        <span className={getStatusBadge(job.status)}>
                          {job.status.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 mt-4">
                      {job.status === 'scheduled' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateJobMutation.mutate({ 
                            id: job.id, 
                            data: { status: 'in_progress' } 
                          })}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Wrench className="w-4 h-4 mr-1" />
                          Start Job
                        </Button>
                      )}
                      {job.status === 'in_progress' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => updateJobMutation.mutate({ 
                              id: job.id, 
                              data: { status: 'completed', completedDate: new Date().toISOString() } 
                            })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Complete Job
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => generateQuotePdfMutation.mutate(job.id)}
                            disabled={generateQuotePdfMutation.isPending}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            {generateQuotePdfMutation.isPending ? "Generating..." : "Quote PDF"}
                          </Button>
                        </>
                      )}
                      {job.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateReceiptPdf(job.id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          Receipt PDF
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteJobMutation.mutate(job.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Job Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update job details, add more parts, or modify pricing.
            </DialogDescription>
          </DialogHeader>
          {editingJob && (
            <JobForm 
              onSubmit={(data) => updateJobDetails.mutate({ id: editingJob.id, data })}
              isSubmitting={updateJobDetails.isPending}
              initialData={{
                customerId: editingJob.customerId,
                vehicleId: editingJob.vehicleId,
                title: editingJob.title,
                description: editingJob.description,
                status: editingJob.status,
                scheduledDate: editingJob.scheduledDate,
                completedDate: editingJob.completedDate,
                laborHours: editingJob.laborHours,
                laborRate: editingJob.laborRate,
                partsTotal: editingJob.partsTotal,
                laborTotal: editingJob.laborTotal,
                totalAmount: editingJob.totalAmount,
                notes: editingJob.notes,
              }}
              initialParts={editingJob.parts?.map(part => ({
                inventoryItemId: part.inventoryItemId || '',
                partName: part.partName,
                partNumber: part.partNumber || undefined,
                quantity: part.quantity,
                unitPrice: parseFloat(part.unitPrice || '0'),
                totalPrice: parseFloat(part.totalPrice || '0')
              })) || []}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

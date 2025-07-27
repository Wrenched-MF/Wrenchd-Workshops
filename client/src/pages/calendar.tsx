import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Settings, Edit, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ServiceBay, JobWithDetails } from "@shared/schema";
import ServiceBayForm from "@/components/forms/service-bay-form";

// Time slots for the diary (8 AM to 6 PM in 30-minute intervals)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) break; // Stop at 6 PM
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

interface JobCardProps {
  job: JobWithDetails;
  onEdit: (job: JobWithDetails) => void;
  onMove: (job: JobWithDetails, newBayId: string | null, newTime: string) => void;
}

function JobCard({ job, onEdit, onMove }: JobCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartHandler = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("application/json", JSON.stringify({
      jobId: job.id,
      currentBayId: job.serviceBayId,
      currentTime: job.scheduledStartTime
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  const dragEndHandler = () => {
    setIsDragging(false);
  };

  const getJobColor = () => {
    switch (job.status) {
      case 'scheduled': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'in_progress': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div
      draggable
      onDragStart={dragStartHandler}
      onDragEnd={dragEndHandler}
      onClick={() => onEdit(job)}
      className={`p-2 mb-1 rounded border cursor-move hover:shadow-md transition-all duration-200 ${getJobColor()} ${
        isDragging ? 'opacity-50 transform rotate-2' : ''
      }`}
    >
      <div className="font-medium text-xs mb-1">{job.customer.name}</div>
      <div className="text-xs text-gray-600 mb-1">
        {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
      </div>
      <div className="text-xs font-medium">{job.title}</div>
      {job.scheduledStartTime && job.scheduledEndTime && (
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {job.scheduledStartTime} - {job.scheduledEndTime}
        </div>
      )}
    </div>
  );
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isServiceBayDialogOpen, setIsServiceBayDialogOpen] = useState(false);
  const [selectedBayForEdit, setSelectedBayForEdit] = useState<ServiceBay | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: serviceBays = [] } = useQuery<ServiceBay[]>({
    queryKey: ["/api/service-bays"],
  });

  const { data: jobs = [] } = useQuery<JobWithDetails[]>({
    queryKey: ["/api/jobs"],
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: string; updates: any }) => {
      const response = await apiRequest(`/api/jobs/${jobId}`, "PUT", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job moved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to move job", variant: "destructive" });
    },
  });

  const deleteServiceBayMutation = useMutation({
    mutationFn: (bayId: string) => apiRequest(`/api/service-bays/${bayId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-bays"] });
      toast({ title: "Service bay deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete service bay", variant: "destructive" });
    },
  });

  // Filter jobs for selected date
  const todaysJobs = jobs.filter(job => {
    if (!job.scheduledDate) return false;
    const jobDate = new Date(job.scheduledDate);
    return jobDate.toDateString() === selectedDate.toDateString();
  });

  // Get jobs for specific bay and time slot
  const getJobsForSlot = (bayId: string | null, timeSlot: string) => {
    return todaysJobs.filter(job => 
      job.serviceBayId === bayId && job.scheduledStartTime === timeSlot
    );
  };

  // Handle job drop
  const handleDrop = (e: React.DragEvent, bayId: string | null, timeSlot: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.jobId && (data.currentBayId !== bayId || data.currentTime !== timeSlot)) {
        updateJobMutation.mutate({
          jobId: data.jobId,
          updates: {
            serviceBayId: bayId,
            scheduledStartTime: timeSlot,
            scheduledEndTime: calculateEndTime(timeSlot, 1), // Default 1 hour duration
            scheduledDate: selectedDate.toISOString().split('T')[0], // Just the date part
          }
        });
      }
    } catch (error) {
      toast({ title: "Error moving job", variant: "destructive" });
    }
  };

  // Helper function to calculate end time
  const calculateEndTime = (startTime: string, durationHours: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + durationHours;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Workshop Diary</h2>
          <p className="text-gray-600">Interactive scheduling with service bays and time slots</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium text-gray-900 min-w-48 text-center">
              {formatDate(selectedDate)}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isServiceBayDialogOpen} onOpenChange={setIsServiceBayDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedBayForEdit(undefined)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Bay
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedBayForEdit ? 'Edit Service Bay' : 'Add Service Bay'}
                </DialogTitle>
              </DialogHeader>
              <ServiceBayForm
                bay={selectedBayForEdit}
                onSuccess={() => {
                  setIsServiceBayDialogOpen(false);
                  setSelectedBayForEdit(undefined);
                }}
                onCancel={() => {
                  setIsServiceBayDialogOpen(false);
                  setSelectedBayForEdit(undefined);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Diary Grid */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header Row */}
          <div className="border-b bg-gray-50 flex">
            <div className="w-24 border-r p-3 font-medium text-sm">Time</div>
            <div className="w-32 border-r p-3 font-medium text-sm">Unassigned</div>
            {serviceBays.map((bay) => (
              <div key={bay.id} className="flex-1 border-r last:border-r-0 p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: bay.color || "#3B82F6" }}
                    />
                    {bay.name}
                  </div>
                  {bay.description && (
                    <div className="text-xs text-gray-500 mt-1">{bay.description}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedBayForEdit(bay);
                      setIsServiceBayDialogOpen(true);
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteServiceBayMutation.mutate(bay.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="flex-1 overflow-y-auto">
            {TIME_SLOTS.map((timeSlot) => (
              <div key={timeSlot} className="border-b flex min-h-16">
                {/* Time Column */}
                <div className="w-24 border-r p-2 text-sm font-medium text-gray-600 flex items-start">
                  {timeSlot}
                </div>
                
                {/* Unassigned Column */}
                <div 
                  className="w-32 border-r p-2 min-h-16"
                  onDrop={(e) => handleDrop(e, null, timeSlot)}
                  onDragOver={handleDragOver}
                >
                  {getJobsForSlot(null, timeSlot).map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onEdit={() => {}} 
                      onMove={() => {}}
                    />
                  ))}
                </div>

                {/* Service Bay Columns */}
                {serviceBays.map((bay) => (
                  <div 
                    key={bay.id}
                    className="flex-1 border-r last:border-r-0 p-2 min-h-16"
                    onDrop={(e) => handleDrop(e, bay.id, timeSlot)}
                    onDragOver={handleDragOver}
                    style={{ backgroundColor: `${bay.color}10` }}
                  >
                    {getJobsForSlot(bay.id, timeSlot).map((job) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        onEdit={() => {}} 
                        onMove={() => {}}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

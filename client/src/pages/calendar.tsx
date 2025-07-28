import { useState, useEffect, useRef } from "react";
import React from "react";
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
  onDelete: (jobId: string) => void;
}

function JobCard({ job, onEdit, onMove, onDelete }: JobCardProps) {
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
      className={`p-2 mb-1 rounded border cursor-move hover:shadow-md transition-all duration-200 group ${getJobColor()} ${
        isDragging ? 'opacity-50 transform rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1" onClick={() => onEdit(job)}>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(job.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

type ViewMode = 'day' | 'week' | 'month';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
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
      console.log("Updating job with data:", { jobId, updates });
      const response = await apiRequest(`/api/jobs/${jobId}`, "PUT", updates);
      const result = await response.json();
      console.log("Job update response:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-bays"] });
      toast({ title: "Job moved successfully" });
    },
    onError: (error) => {
      console.error("Job update failed:", error);
      toast({ title: "Failed to move job", variant: "destructive" });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest(`/api/jobs/${jobId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-bays"] });
      toast({ title: "Job deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete job", variant: "destructive" });
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

  // Get date range based on view mode
  const getDateRange = () => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    
    if (viewMode === 'day') {
      // Just today
      return { start, end };
    } else if (viewMode === 'week') {
      // Start of week (Monday) to end of week (Sunday)
      const dayOfWeek = start.getDay();
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start
      start.setDate(diff);
      end.setDate(diff + 6);
      return { start, end };
    } else if (viewMode === 'month') {
      // Start of month to end of month
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // Last day of current month
      return { start, end };
    }
    return { start, end };
  };

  // Filter jobs for selected date range
  const { start: rangeStart, end: rangeEnd } = getDateRange();
  const filteredJobs = jobs.filter(job => {
    if (!job.scheduledDate) return false;
    const jobDate = new Date(job.scheduledDate);
    jobDate.setHours(0, 0, 0, 0);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);
    return jobDate >= rangeStart && jobDate <= rangeEnd;
  });

  // Get jobs for specific bay and time slot (for day view)
  const getJobsForSlot = (bayId: string | null, timeSlot: string, date?: Date) => {
    const targetDate = date || selectedDate;
    return filteredJobs.filter(job => {
      if (!job.scheduledDate) return false;
      const jobDate = new Date(job.scheduledDate);
      const isSameDate = jobDate.toDateString() === targetDate.toDateString();
      return isSameDate && job.serviceBayId === bayId && job.scheduledStartTime === timeSlot;
    });
  };

  // Handle job drop
  const handleDrop = (e: React.DragEvent, bayId: string | null, timeSlot: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.jobId && (data.currentBayId !== bayId || data.currentTime !== timeSlot)) {
        console.log("Dropping job:", data.jobId, "to bay:", bayId, "at time:", timeSlot);
        
        // Format the date properly as an ISO string
        const scheduledDate = new Date(selectedDate);
        scheduledDate.setHours(0, 0, 0, 0); // Reset to start of day
        
        updateJobMutation.mutate({
          jobId: data.jobId,
          updates: {
            serviceBayId: bayId,
            scheduledStartTime: timeSlot,
            scheduledDate: scheduledDate.toISOString(), // Full ISO string
          }
        });
      }
    } catch (error) {
      console.error("Error dropping job:", error);
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
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (viewMode === 'week') {
      const { start, end } = getDateRange();
      return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (viewMode === 'month') {
      return date.toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
    return date.toLocaleDateString('en-GB');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
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
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button 
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="rounded-none border-r"
            >
              Day
            </Button>
            <Button 
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-none border-r"
            >
              Week
            </Button>
            <Button 
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-none"
            >
              Month
            </Button>
          </div>
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

          {/* Content based on view mode */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'day' && (
              <>
                {TIME_SLOTS.map((timeSlot) => (
                  <div key={timeSlot} className="border-b flex min-h-16">
                    {/* Time Column */}
                    <div className="w-24 border-r p-2 text-sm font-medium text-gray-600 flex items-start">
                      {timeSlot}
                    </div>

                    {/* Service Bay Columns */}
                    {serviceBays.map((bay) => (
                      <div 
                        key={bay.id}
                        className="flex-1 border-r last:border-r-0 p-2 min-h-16"
                        onDrop={(e) => handleDrop(e, bay.id, timeSlot)}
                        onDragOver={handleDragOver}
                      >
                        {getJobsForSlot(bay.id, timeSlot).map((job) => (
                          <JobCard 
                            key={job.id} 
                            job={job} 
                            onEdit={() => {}} 
                            onMove={() => {}}
                            onDelete={(jobId) => deleteJobMutation.mutate(jobId)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {viewMode === 'week' && (
              <div className="grid grid-cols-8 gap-0 min-h-full">
                {/* Days header */}
                <div className="border-r p-2 text-sm font-medium text-gray-600">Bay/Day</div>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(getDateRange().start);
                  date.setDate(date.getDate() + i);
                  return (
                    <div key={i} className="border-r last:border-r-0 p-2 text-center text-sm font-medium text-gray-600">
                      <div>{date.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                      <div className="text-xs">{date.getDate()}</div>
                    </div>
                  );
                })}
                
                {/* Service bay rows */}
                {serviceBays.map((bay) => (
                  <React.Fragment key={bay.id}>
                    <div className="border-r border-b p-2 text-sm font-medium flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: bay.color || "#3B82F6" }}
                      />
                      {bay.name}
                    </div>
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(getDateRange().start);
                      date.setDate(date.getDate() + i);
                      const dayJobs = filteredJobs.filter(job => {
                        if (!job.scheduledDate) return false;
                        const jobDate = new Date(job.scheduledDate);
                        return jobDate.toDateString() === date.toDateString() && job.serviceBayId === bay.id;
                      });
                      
                      return (
                        <div 
                          key={i} 
                          className="border-r last:border-r-0 border-b p-1 min-h-20"
                          onDrop={(e) => handleDrop(e, bay.id, "09:00")}
                          onDragOver={handleDragOver}
                        >
                          {dayJobs.map((job) => (
                            <JobCard 
                              key={job.id} 
                              job={job} 
                              onEdit={() => {}} 
                              onMove={() => {}}
                              onDelete={(jobId) => deleteJobMutation.mutate(jobId)}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            )}

            {viewMode === 'month' && (
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2">
                  {/* Month days header */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Month calendar */}
                  {Array.from({ length: 42 }, (_, i) => {
                    const { start } = getDateRange();
                    const firstDayOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
                    const startOfCalendar = new Date(firstDayOfMonth);
                    const dayOfWeek = firstDayOfMonth.getDay();
                    startOfCalendar.setDate(firstDayOfMonth.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                    
                    const currentDate = new Date(startOfCalendar);
                    currentDate.setDate(startOfCalendar.getDate() + i);
                    
                    const isCurrentMonth = currentDate.getMonth() === start.getMonth();
                    const isToday = currentDate.toDateString() === new Date().toDateString();
                    
                    const dayJobs = filteredJobs.filter(job => {
                      if (!job.scheduledDate) return false;
                      const jobDate = new Date(job.scheduledDate);
                      return jobDate.toDateString() === currentDate.toDateString();
                    });
                    
                    return (
                      <div 
                        key={i} 
                        className={`border rounded p-2 min-h-24 ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                        } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="text-sm font-medium mb-1">{currentDate.getDate()}</div>
                        <div className="space-y-1">
                          {dayJobs.slice(0, 3).map((job) => (
                            <div 
                              key={job.id} 
                              className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                            >
                              {job.customer.name}
                            </div>
                          ))}
                          {dayJobs.length > 3 && (
                            <div className="text-xs text-gray-500">+{dayJobs.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

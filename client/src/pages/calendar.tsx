import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Calendar() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Calendar</h2>
          <p className="text-gray-600">Schedule and view your mobile mechanic appointments</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">Today</Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium text-gray-900">January 2025</span>
            <Button variant="ghost" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Select defaultValue="month">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Coming Soon</h3>
          <p className="text-gray-500">Full calendar functionality will be available in the next update.</p>
        </div>
      </div>
    </div>
  );
}

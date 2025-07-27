import { useQuery } from "@tanstack/react-query";
import { BarChart, PoundSterling, Clock, TrendingUp, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsCard from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Reports() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports</h2>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select defaultValue="jobs">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jobs">Jobs</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <BarChart className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Performance - Last 30 Days</h3>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Jobs"
          value={stats?.jobsCount || 0}
          icon={<TrendingUp />}
        />
        <StatsCard
          title="Total Revenue"
          value={`£${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={<PoundSterling />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Labor Hours"
          value="0.0h"
          icon={<Clock />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatsCard
          title="Avg Job Value"
          value={stats?.jobsCount > 0 ? `£${(stats.totalRevenue / stats.jobsCount).toFixed(2)}` : '£0.00'}
          icon={<TrendingUp />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Revenue by Job Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenue by Job Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">£{stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">£0.00</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">£0.00</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">£0.00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span>Top Customers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No customer data available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

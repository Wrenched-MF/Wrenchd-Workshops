import { useQuery } from "@tanstack/react-query";
import { 
  Briefcase, PoundSterling, AlertTriangle, Users, 
  Check, Clock, Calendar, ShoppingCart
} from "lucide-react";
import StatsCard from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your mobile mechanic business</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Jobs"
          value={stats?.todayJobsCount || 0}
          icon={<Briefcase />}
        />
        <StatsCard
          title="Total Revenue"
          value={`£${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={<PoundSterling />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          icon={<AlertTriangle />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          valueColor="text-orange-600"
        />
        <StatsCard
          title="Total Customers"
          value={stats?.customersCount || 0}
          icon={<Users />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Recent Jobs</CardTitle>
            <Button variant="ghost" size="sm" className="text-wrench-green hover:text-wrench-dark">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentJobs?.length > 0 ? (
                stats.recentJobs.slice(0, 3).map((job: any) => (
                  <div key={job.id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      job.status === 'completed' ? 'bg-green-100' :
                      job.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {job.status === 'completed' ? <Check className="w-5 h-5 text-green-600" /> :
                       job.status === 'in_progress' ? <Clock className="w-5 h-5 text-blue-600" /> :
                       <Calendar className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.customer?.name} - {job.vehicle?.make} {job.vehicle?.model}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">£{parseFloat(job.totalAmount || '0').toFixed(2)}</p>
                      <p className="text-xs text-gray-500 capitalize">{job.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent jobs</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Inventory Alerts</CardTitle>
            <Button variant="ghost" size="sm" className="text-wrench-green hover:text-wrench-dark">
              View Inventory
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.lowStockItems?.length > 0 ? (
                stats.lowStockItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-red-600">
                        Low Stock: {item.quantity} units remaining
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-wrench-green hover:bg-wrench-dark text-white"
                    >
                      Reorder
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">All items are well stocked</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

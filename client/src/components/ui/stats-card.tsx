import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  iconBgColor = "bg-blue-100", 
  iconColor = "text-blue-600",
  valueColor = "text-gray-900"
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <div className={`text-xl ${iconColor}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

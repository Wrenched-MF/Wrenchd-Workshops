import { Wrench, User } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-wrench-green text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
            <Wrench className="w-3 h-3" />
          </div>
          <span className="font-semibold">WRENCH'D</span>
          <span className="text-green-100">Workshop Manager</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-green-100">Welcome, Luke Preece</span>
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

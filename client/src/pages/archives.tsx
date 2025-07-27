import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  Cloud, 
  Calendar, 
  Package, 
  Download,
  Users,
  TrendingUp,
  Settings,
  AlertCircle
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ArchivesPage() {
  const { toast } = useToast();
  const [selectedArchiveType, setSelectedArchiveType] = useState("monthly");

  const { data: archives, isLoading } = useQuery({
    queryKey: ["/api/receipt-archives"],
  });

  const createArchiveMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/receipt-archives/auto-create", "POST", data),
    onSuccess: () => {
      toast({
        title: "Archive created",
        description: "Receipt archive created and backup scheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/receipt-archives"] });
    },
    onError: () => {
      toast({
        title: "Archive failed",
        description: "Failed to create receipt archive. Please try again.",
        variant: "destructive",
      });
    },
  });

  const backupArchiveMutation = useMutation({
    mutationFn: (archiveId: string) => apiRequest(`/api/receipt-archives/${archiveId}/backup`, "POST"),
    onSuccess: () => {
      toast({
        title: "Backup completed",
        description: "Archive has been backed up to cloud storage successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/receipt-archives"] });
    },
    onError: () => {
      toast({
        title: "Backup failed",
        description: "Failed to backup archive. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateArchive = () => {
    createArchiveMutation.mutate({
      type: selectedArchiveType,
      date: new Date()
    });
  };

  const handleBackupArchive = (archiveId: string) => {
    backupArchiveMutation.mutate(archiveId);
  };

  const archivesList = archives?.archives || [];
  const activeArchives = archivesList.filter((a: any) => a.status === "active");
  const backedUpArchives = archivesList.filter((a: any) => a.status === "backed_up");

  // Calculate statistics
  const totalReceipts = archivesList.reduce((sum: number, archive: any) => sum + (archive.receiptCount || 0), 0);
  const totalValue = archivesList.reduce((sum: number, archive: any) => sum + parseFloat(archive.totalValue || '0'), 0);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Receipt Archives</h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleCreateArchive}
            disabled={createArchiveMutation.isPending}
            className="bg-wrench-orange hover:bg-wrench-orange/90"
          >
            <Archive className="w-4 h-4 mr-2" />
            {createArchiveMutation.isPending ? "Creating..." : "Create Archive"}
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archives</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivesList.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeArchives.length} active, {backedUpArchives.length} backed up
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Receipts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReceipts}</div>
            <p className="text-xs text-muted-foreground">
              Total receipts archived
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archive Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total value archived
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cloud Storage</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backedUpArchives.length}</div>
            <p className="text-xs text-muted-foreground">
              Archives in cloud storage
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Archives</TabsTrigger>
          <TabsTrigger value="backed-up">Cloud Backups</TabsTrigger>
          <TabsTrigger value="settings">Archive Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Archive className="w-5 h-5" />
                <span>Active Archives</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-orange"></div>
                </div>
              ) : activeArchives.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active archives</h3>
                  <p className="text-gray-600 mb-4">Create your first archive to organize and backup receipts.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeArchives.map((archive: any) => (
                    <div key={archive.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{archive.archiveName}</h3>
                            <span className="px-2 py-1 text-xs rounded border border-green-600 text-green-600">
                              {archive.archiveType}
                            </span>
                            <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                              {archive.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(archive.startDate).toLocaleDateString()} - {new Date(archive.endDate).toLocaleDateString()}
                            </p>
                            <p>
                              <Package className="w-4 h-4 inline mr-1" />
                              {archive.receiptCount} receipts • £{parseFloat(archive.totalValue || '0').toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBackupArchive(archive.id)}
                            disabled={backupArchiveMutation.isPending}
                          >
                            <Cloud className="w-4 h-4 mr-1" />
                            Backup
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backed-up" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="w-5 h-5" />
                <span>Cloud Backups</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backedUpArchives.length === 0 ? (
                <div className="text-center py-8">
                  <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cloud backups</h3>
                  <p className="text-gray-600">Archives will appear here after being backed up to cloud storage.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backedUpArchives.map((archive: any) => (
                    <div key={archive.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{archive.archiveName}</h3>
                            <span className="px-2 py-1 text-xs rounded border border-blue-600 text-blue-600">
                              backed up
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Backed up: {new Date(archive.backupDate).toLocaleDateString()}
                            </p>
                            <p>
                              <Package className="w-4 h-4 inline mr-1" />
                              {archive.receiptCount} receipts • £{parseFloat(archive.totalValue || '0').toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Path: {archive.backupPath}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Archive Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="archive-type">Default Archive Type</Label>
                  <Select value={selectedArchiveType} onValueChange={setSelectedArchiveType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select archive type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Archive</SelectItem>
                      <SelectItem value="yearly">Yearly Archive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Automatic Archiving</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mt-2">
                    Set up automatic monthly or yearly archiving to keep your receipt database organized. 
                    Archives older than 30 days will be automatically backed up to cloud storage.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Cloud Storage Options</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Automatic backup after 30 days</p>
                    <p>• Encrypted storage with secure access</p>
                    <p>• Easy restore from cloud backups</p>
                    <p>• Compliance with data retention policies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
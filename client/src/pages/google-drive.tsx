import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, 
  CheckCircle, 
  AlertCircle, 
  Upload,
  ExternalLink,
  FileText,
  Calendar
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GoogleDrivePage() {
  const { toast } = useToast();
  const [authCode, setAuthCode] = useState("");

  const { data: driveStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/google-drive/status"],
  });

  const { data: driveFiles } = useQuery({
    queryKey: ["/api/google-drive/files"],
    enabled: driveStatus?.configured,
  });

  const { data: receipts } = useQuery({
    queryKey: ["/api/receipts"],
  });

  const authMutation = useMutation({
    mutationFn: (code: string) => apiRequest("POST", "/api/google-drive/auth-callback", { code }),
    onSuccess: () => {
      toast({
        title: "Authentication successful",
        description: "Google Drive integration is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/google-drive/status"] });
    },
    onError: () => {
      toast({
        title: "Authentication failed",
        description: "Please check your authorization code and try again.",
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (receiptId: string) => apiRequest("POST", "/api/google-drive/upload-receipt", { receiptId }),
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Receipt has been uploaded to Google Drive.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/google-drive/files"] });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload receipt to Google Drive.",
        variant: "destructive",
      });
    },
  });

  const handleGetAuthUrl = async () => {
    try {
      const response = await apiRequest("GET", "/api/google-drive/auth-url");
      window.open(response.authUrl, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get Google Drive authorization URL.",
        variant: "destructive",
      });
    }
  };

  const handleAuthenticate = () => {
    if (!authCode.trim()) {
      toast({
        title: "Code required",
        description: "Please enter the authorization code from Google.",
        variant: "destructive",
      });
      return;
    }
    authMutation.mutate(authCode);
  };

  const handleUploadReceipt = (receiptId: string) => {
    uploadMutation.mutate(receiptId);
  };

  const receiptsList = receipts?.receipts || [];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Google Drive Integration</h2>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="w-5 h-5" />
            <span>Drive Connection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wrench-orange"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {driveStatus?.configured ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">
                    {driveStatus?.configured ? 'Connected to Google Drive' : 'Not connected to Google Drive'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Target folder: <a 
                      href={driveStatus?.folderUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center"
                    >
                      Receipts Folder <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </p>
                </div>
              </div>
              
              {!driveStatus?.configured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Setup Required</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Connect your Google Drive to automatically backup all receipts to your specified folder.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={handleGetAuthUrl} variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get Authorization Code
                    </Button>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter authorization code here"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <Button 
                        onClick={handleAuthenticate}
                        disabled={authMutation.isPending}
                        className="bg-wrench-orange hover:bg-wrench-orange/90"
                      >
                        {authMutation.isPending ? "Connecting..." : "Connect"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="receipts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receipts">Upload Receipts</TabsTrigger>
          <TabsTrigger value="files">Drive Files</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Receipt Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!driveStatus?.configured ? (
                <div className="text-center py-8">
                  <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Google Drive</h3>
                  <p className="text-gray-600">Connect your Google Drive account to upload receipts automatically.</p>
                </div>
              ) : receiptsList.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts available</h3>
                  <p className="text-gray-600">Complete some jobs to generate receipts for upload.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receiptsList.map((receipt: any) => (
                    <div key={receipt.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{receipt.receiptNumber}</h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(receipt.createdAt).toLocaleDateString()}
                            </p>
                            <p>Amount: £{receipt.totalAmount}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleUploadReceipt(receipt.id)}
                          disabled={uploadMutation.isPending}
                          className="bg-wrench-orange hover:bg-wrench-orange/90"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {uploadMutation.isPending ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Drive Files</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!driveStatus?.configured ? (
                <div className="text-center py-8">
                  <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Google Drive</h3>
                  <p className="text-gray-600">Connect your Google Drive account to view uploaded files.</p>
                </div>
              ) : driveFiles?.files?.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
                  <p className="text-gray-600">Upload some receipts to see them listed here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {driveFiles?.files?.map((file: any) => (
                    <div key={file.id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <h3 className="font-medium">{file.name}</h3>
                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(file.createdTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
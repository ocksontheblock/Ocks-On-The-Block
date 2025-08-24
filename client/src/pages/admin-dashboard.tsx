import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import HamburgerMenu from "@/components/hamburger-menu";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  MapPin, 
  Camera,
  Trophy,
  AlertCircle,
  BarChart3
} from "lucide-react";

interface Submission {
  id: number;
  participantId: number;
  participantUsername: string;
  ockId: number;
  ockName: string;
  locationId: number;
  locationAddress: string;
  photoUrl: string;
  figurineRarity: 'common' | 'rare' | 'elite' | 'legendary';
  gpsCoordinates?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
  points: number;
}

interface AdminStats {
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  totalPointsAwarded: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Check if user is admin (this would be implemented in the backend)
  const isAdmin = user?.email === 'admin@ocksontheblock.com' || user?.username === 'admin';

  // Fetch submissions
  const { data: submissions = [], isLoading: submissionsLoading, refetch } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
    enabled: isAuthenticated && isAdmin,
  });

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && isAdmin,
  });

  // Approve submission mutation
  const approveSubmissionMutation = useMutation({
    mutationFn: ({ submissionId, points }: { submissionId: number; points: number }) =>
      apiRequest("POST", `/api/admin/submissions/${submissionId}/approve`, { points }),
    onSuccess: () => {
      toast({
        title: "Submission Approved",
        description: "Points have been awarded to the participant.",
      });
      refetch();
      setSelectedSubmission(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve submission.",
        variant: "destructive",
      });
    },
  });

  // Reject submission mutation
  const rejectSubmissionMutation = useMutation({
    mutationFn: ({ submissionId, reason }: { submissionId: number; reason: string }) =>
      apiRequest("POST", `/api/admin/submissions/${submissionId}/reject`, { reason }),
    onSuccess: () => {
      toast({
        title: "Submission Rejected",
        description: "Participant has been notified of the rejection.",
      });
      refetch();
      setSelectedSubmission(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject submission.",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/login"}
              className="w-full bg-ock-orange hover:bg-ock-orange/90"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full bg-ock-orange hover:bg-ock-orange/90"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRarityPoints = (rarity: string) => {
    const points = {
      'common': 10,
      'rare': 25,
      'elite': 50,
      'legendary': 100
    };
    return points[rarity as keyof typeof points] || 10;
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const recentSubmissions = submissions.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <HamburgerMenu />
      
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-anton text-4xl md:text-5xl text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Review and verify scavenger hunt submissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center p-6">
                <BarChart3 className="h-8 w-8 text-ock-orange" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats?.totalSubmissions || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats?.pendingSubmissions || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">{stats?.approvedSubmissions || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold">{stats?.rejectedSubmissions || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center p-6">
                <Trophy className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Points</p>
                  <p className="text-2xl font-bold">{stats?.totalPointsAwarded || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Review ({pendingSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="recent">Recent Submissions</TabsTrigger>
              <TabsTrigger value="all">All Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span>Pending Review</span>
                  </CardTitle>
                  <CardDescription>
                    Submissions waiting for verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingSubmissions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No pending submissions to review
                    </p>
                  ) : (
                    <SubmissionTable 
                      submissions={pendingSubmissions} 
                      onViewSubmission={setSelectedSubmission}
                      onShowPhoto={(submission) => {
                        setSelectedSubmission(submission);
                        setShowPhotoModal(true);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>
                    Latest submissions from all participants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubmissionTable 
                    submissions={recentSubmissions} 
                    onViewSubmission={setSelectedSubmission}
                    onShowPhoto={(submission) => {
                      setSelectedSubmission(submission);
                      setShowPhotoModal(true);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Submissions</CardTitle>
                  <CardDescription>
                    Complete history of all submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubmissionTable 
                    submissions={submissions} 
                    onViewSubmission={setSelectedSubmission}
                    onShowPhoto={(submission) => {
                      setSelectedSubmission(submission);
                      setShowPhotoModal(true);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Submission Review Dialog */}
      {selectedSubmission && !showPhotoModal && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
              <DialogDescription>
                Submission ID: {selectedSubmission.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Participant</h4>
                  <p className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {selectedSubmission.participantUsername}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ock Found</h4>
                  <p>{selectedSubmission.ockName}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedSubmission.locationAddress}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Figurine Rarity</h4>
                  <Badge className="capitalize">
                    {selectedSubmission.figurineRarity} ({getRarityPoints(selectedSubmission.figurineRarity)} points)
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Submitted Photo</h4>
                <img 
                  src={selectedSubmission.photoUrl} 
                  alt="Hunt submission" 
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>

              {selectedSubmission.gpsCoordinates && (
                <div>
                  <h4 className="font-semibold mb-2">GPS Coordinates</h4>
                  <p className="text-sm text-gray-600">{selectedSubmission.gpsCoordinates}</p>
                </div>
              )}

              {selectedSubmission.status === 'pending' && (
                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={() => approveSubmissionMutation.mutate({ 
                      submissionId: selectedSubmission.id, 
                      points: getRarityPoints(selectedSubmission.figurineRarity) 
                    })}
                    disabled={approveSubmissionMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    data-testid="button-approve"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {approveSubmissionMutation.isPending ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    onClick={() => rejectSubmissionMutation.mutate({ 
                      submissionId: selectedSubmission.id, 
                      reason: "Does not meet requirements" 
                    })}
                    disabled={rejectSubmissionMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                    data-testid="button-reject"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {rejectSubmissionMutation.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Photo Modal */}
      {showPhotoModal && selectedSubmission && (
        <Dialog open={showPhotoModal} onOpenChange={() => setShowPhotoModal(false)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Submission Photo</DialogTitle>
              <DialogDescription>
                Full size photo from {selectedSubmission.participantUsername}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={selectedSubmission.photoUrl} 
                alt="Hunt submission" 
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}

// Submission Table Component
interface SubmissionTableProps {
  submissions: Submission[];
  onViewSubmission: (submission: Submission) => void;
  onShowPhoto: (submission: Submission) => void;
}

function SubmissionTable({ submissions, onViewSubmission, onShowPhoto }: SubmissionTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Participant</TableHead>
          <TableHead>Ock</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Rarity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell className="font-medium">
              {submission.participantUsername}
            </TableCell>
            <TableCell>{submission.ockName}</TableCell>
            <TableCell className="max-w-xs truncate">
              {submission.locationAddress}
            </TableCell>
            <TableCell>
              <Badge className="capitalize">
                {submission.figurineRarity}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={`${getStatusColor(submission.status)} text-white capitalize`}>
                {getStatusIcon(submission.status)}
                <span className="ml-1">{submission.status}</span>
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(submission.submittedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  onClick={() => onShowPhoto(submission)}
                  size="sm"
                  variant="outline"
                  data-testid={`button-photo-${submission.id}`}
                >
                  <Camera className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => onViewSubmission(submission)}
                  size="sm"
                  variant="outline"
                  data-testid={`button-review-${submission.id}`}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
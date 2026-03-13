import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Film,
  HelpCircle,
  Loader2,
  Plus,
  QrCode,
  Save,
  Shield,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Genre, PremiumPlan } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import {
  useAddVideo,
  useAllUserProfiles,
  useDeleteVideo,
  useListAllVideos,
  useListHelpDeskRequests,
  usePaymentSettings,
  usePendingPremiumRequests,
  useUpdatePaymentSettings,
  useVerifyPremiumRequest,
} from "../hooks/useQueries";

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { data: requests, isLoading } = usePendingPremiumRequests();
  const { mutateAsync: verifyRequest, isPending } = useVerifyPremiumRequest();
  const { data: paymentSettings, isLoading: isLoadingSettings } =
    usePaymentSettings();
  const { mutateAsync: updateSettings, isPending: isSavingSettings } =
    useUpdatePaymentSettings();
  const { data: allUsers, isLoading: isLoadingUsers } = useAllUserProfiles();
  const { data: allVideos, isLoading: isLoadingVideos } = useListAllVideos();
  const { mutateAsync: addVideo, isPending: isAddingVideo } = useAddVideo();
  const { mutateAsync: deleteVideo, isPending: isDeletingVideo } =
    useDeleteVideo();
  const { data: helpDeskRequests, isLoading: isLoadingHelpDesk } =
    useListHelpDeskRequests();

  const [upiId, setUpiId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Video form state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoGenre, setVideoGenre] = useState<Genre>(Genre.Romance);
  const [isPremiumOnly, setIsPremiumOnly] = useState(false);

  useEffect(() => {
    if (paymentSettings) {
      setUpiId(paymentSettings.upiId);
      setQrCodeUrl(paymentSettings.qrCodeUrl);
    }
  }, [paymentSettings]);

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            You need admin privileges to view this page.
          </p>
        </div>
      </main>
    );
  }

  const handleVerify = async (requestId: bigint, approve: boolean) => {
    try {
      await verifyRequest({ requestId, approve });
      toast.success(
        approve ? "Premium request approved!" : "Premium request rejected.",
      );
    } catch {
      toast.error("Failed to process request.");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        upiId: upiId.trim(),
        qrCodeUrl: qrCodeUrl.trim(),
      });
      toast.success("Payment settings updated!");
    } catch {
      toast.error("Failed to save settings.");
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVideo({
        title: videoTitle.trim(),
        description: videoDescription.trim(),
        videoUrl: videoUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim(),
        genre: videoGenre,
        durationSeconds: BigInt(0),
        isPremiumOnly,
      });
      toast.success("Video added successfully!");
      setVideoTitle("");
      setVideoDescription("");
      setVideoUrl("");
      setThumbnailUrl("");
      setVideoGenre(Genre.Romance);
      setIsPremiumOnly(false);
    } catch {
      toast.error("Failed to add video.");
    }
  };

  const handleDeleteVideo = async (videoId: bigint) => {
    try {
      await deleteVideo(videoId);
      toast.success("Video deleted.");
    } catch {
      toast.error("Failed to delete video.");
    }
  };

  return (
    <main className="min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-crimson/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-crimson" />
            </div>
            <h1 className="font-display font-bold text-2xl">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage users, videos, premium payment requests and payment settings.
          </p>
        </motion.div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6 bg-secondary flex-wrap h-auto gap-1">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-crimson data-[state=active]:text-white"
              data-ocid="admin.users_tab"
            >
              <Users className="w-4 h-4 mr-2" />
              All Users
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-crimson data-[state=active]:text-white"
              data-ocid="admin.requests_tab"
            >
              <Clock className="w-4 h-4 mr-2" />
              Payment Requests
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="data-[state=active]:bg-crimson data-[state=active]:text-white"
              data-ocid="admin.videos_tab"
            >
              <Film className="w-4 h-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="helpdesk"
              className="data-[state=active]:bg-crimson data-[state=active]:text-white"
              data-ocid="admin.helpdesk_tab"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Desk
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-crimson data-[state=active]:text-white"
              data-ocid="admin.settings_tab"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Settings
            </TabsTrigger>
          </TabsList>

          {/* ALL USERS TAB */}
          <TabsContent value="users">
            {isLoadingUsers ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="admin.users_loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !allUsers || allUsers.length === 0 ? (
              <div
                className="text-center py-20"
                data-ocid="admin.users_empty_state"
              >
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-display font-semibold text-lg mb-1">
                  No Users Yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  No one has registered yet.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {allUsers.length} registered user
                    {allUsers.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Table data-ocid="admin.users_table">
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">#</TableHead>
                      <TableHead className="text-muted-foreground">
                        Name
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Mobile Number
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Premium
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Premium Expiry
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user, i) => (
                      <TableRow
                        key={user.principal.toString()}
                        className="border-border"
                        data-ocid={`admin.users_row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.mobileNumber}
                        </TableCell>
                        <TableCell>
                          {user.isPremium ? (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs">
                              Premium
                            </Badge>
                          ) : (
                            <Badge className="bg-secondary text-muted-foreground border border-border text-xs">
                              Free
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {user.premiumExpiresAt
                            ? new Date(
                                Number(user.premiumExpiresAt) / 1_000_000,
                              ).toLocaleDateString("en-IN")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* PENDING REQUESTS TAB */}
          <TabsContent value="requests">
            {isLoading ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="admin.loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !requests || requests.length === 0 ? (
              <div className="text-center py-20" data-ocid="admin.empty_state">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-display font-semibold text-lg mb-1">
                  No Pending Requests
                </h3>
                <p className="text-muted-foreground text-sm">
                  All premium requests have been processed.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {requests.length} pending request
                    {requests.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Table data-ocid="admin.requests_table">
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">#</TableHead>
                      <TableHead className="text-muted-foreground">
                        User
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Plan
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        UTR / Txn ID
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Submitted
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req, i) => (
                      <TableRow
                        key={req.id.toString()}
                        className="border-border"
                        data-ocid={`admin.requests_row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {req.userId.toString().slice(0, 12)}...
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${
                              req.plan === PremiumPlan.Yearly
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                : "bg-crimson/10 text-crimson border border-crimson/30"
                            }`}
                          >
                            {req.plan === PremiumPlan.Yearly
                              ? "Yearly"
                              : "Monthly"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {req.utrId}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(
                            Number(req.submittedAt) / 1_000_000,
                          ).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isPending}
                              onClick={() => handleVerify(req.id, true)}
                              className="border-green-500/40 text-green-400 hover:bg-green-500/10 h-7 px-2 text-xs gap-1"
                              data-ocid={`admin.approve_button.${i + 1}`}
                            >
                              <CheckCircle className="w-3 h-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isPending}
                              onClick={() => handleVerify(req.id, false)}
                              className="border-crimson/40 text-crimson hover:bg-crimson/10 h-7 px-2 text-xs gap-1"
                              data-ocid={`admin.reject_button.${i + 1}`}
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* VIDEOS TAB */}
          <TabsContent value="videos">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Video Form */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-crimson/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-crimson" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-base">
                      Add New Video
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Paste a hosted video URL (YouTube, Google Drive, Vimeo).
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddVideo} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Title *
                    </Label>
                    <Input
                      placeholder="e.g. Midnight Chase"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      required
                      data-ocid="admin.video_title_input"
                      className="bg-secondary border-border focus:border-crimson"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Description
                    </Label>
                    <Input
                      placeholder="Short description of the video"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      data-ocid="admin.video_desc_input"
                      className="bg-secondary border-border focus:border-crimson"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Video URL *
                    </Label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      required
                      data-ocid="admin.video_url_input"
                      className="bg-secondary border-border focus:border-crimson"
                    />
                    <p className="text-xs text-muted-foreground">
                      YouTube, Google Drive, or Vimeo link.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Thumbnail URL
                    </Label>
                    <Input
                      placeholder="https://imgbb.com/your-thumbnail.jpg"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      data-ocid="admin.video_thumbnail_input"
                      className="bg-secondary border-border focus:border-crimson"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use imgbb.com or postimages.org to host your thumbnail.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Genre *
                    </Label>
                    <Select
                      value={videoGenre}
                      onValueChange={(v) => setVideoGenre(v as Genre)}
                    >
                      <SelectTrigger
                        className="bg-secondary border-border"
                        data-ocid="admin.video_genre_select"
                      >
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value={Genre.Romance}>Romance</SelectItem>
                        <SelectItem value={Genre.Thriller}>Thriller</SelectItem>
                        <SelectItem value={Genre.Action}>Action</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPremiumOnly"
                      checked={isPremiumOnly}
                      onChange={(e) => setIsPremiumOnly(e.target.checked)}
                      data-ocid="admin.video_premium_checkbox"
                      className="w-4 h-4 accent-crimson"
                    />
                    <Label
                      htmlFor="isPremiumOnly"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      Premium only video
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isAddingVideo}
                    className="bg-crimson hover:bg-crimson/90 text-white w-full"
                    data-ocid="admin.add_video_button"
                  >
                    {isAddingVideo ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {isAddingVideo ? "Adding..." : "Add Video"}
                  </Button>
                </form>
              </div>

              {/* Video List */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">
                    {allVideos
                      ? `${allVideos.length} video${allVideos.length !== 1 ? "s" : ""}`
                      : "Loading..."}
                  </span>
                </div>

                {isLoadingVideos ? (
                  <div
                    className="flex items-center justify-center py-16"
                    data-ocid="admin.videos_loading_state"
                  >
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !allVideos || allVideos.length === 0 ? (
                  <div
                    className="text-center py-16 bg-card border border-border rounded-xl"
                    data-ocid="admin.videos_empty_state"
                  >
                    <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-display font-semibold text-base mb-1">
                      No Videos Yet
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Add your first video using the form.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {allVideos.map((video, i) => (
                      <div
                        key={video.id.toString()}
                        className="flex items-center gap-3 bg-card border border-border rounded-lg p-3"
                        data-ocid={`admin.video_item.${i + 1}`}
                      >
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-16 h-10 object-cover rounded flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-10 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                            <Film className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {video.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-secondary text-muted-foreground border border-border text-xs px-1.5 py-0">
                              {video.genre}
                            </Badge>
                            {video.isPremiumOnly && (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs px-1.5 py-0">
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isDeletingVideo}
                          onClick={() => handleDeleteVideo(video.id)}
                          className="border-crimson/40 text-crimson hover:bg-crimson/10 h-7 w-7 p-0 flex-shrink-0"
                          data-ocid={`admin.video_delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* HELP DESK TAB */}
          <TabsContent value="helpdesk">
            {isLoadingHelpDesk ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="admin.helpdesk_loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !helpDeskRequests || helpDeskRequests.length === 0 ? (
              <div
                className="text-center py-20"
                data-ocid="admin.helpdesk_empty_state"
              >
                <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-display font-semibold text-lg mb-1">
                  No Help Desk Requests
                </h3>
                <p className="text-muted-foreground text-sm">
                  No help desk requests yet.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {helpDeskRequests.length} request
                    {helpDeskRequests.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Table data-ocid="admin.helpdesk_table">
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">#</TableHead>
                      <TableHead className="text-muted-foreground">
                        Name
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Phone Number
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Problem
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Submitted
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {helpDeskRequests.map((req, i) => (
                      <TableRow
                        key={req.id.toString()}
                        className="border-border"
                        data-ocid={`admin.helpdesk_row.${i + 1}`}
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {req.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {req.phoneNumber}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs">
                          <p className="line-clamp-2 text-muted-foreground">
                            {req.problem}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(
                            Number(req.submittedAt) / 1_000_000,
                          ).toLocaleDateString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* PAYMENT SETTINGS TAB */}
          <TabsContent value="settings">
            {isLoadingSettings ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="admin.settings_loading_state"
              >
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="max-w-lg">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-crimson/10 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-crimson" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-base">
                        Payment Settings
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Configure UPI details shown to users on the Premium
                        page.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">
                        UPI ID
                      </Label>
                      <Input
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                        data-ocid="admin.upi_id_input"
                        className="bg-secondary border-border focus:border-crimson"
                      />
                      <p className="text-xs text-muted-foreground">
                        e.g. ksrpfm@upi or 9876543210@paytm
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">
                        QR Code Image URL
                      </Label>
                      <Input
                        placeholder="https://your-qr-image-url.com/qr.png"
                        value={qrCodeUrl}
                        onChange={(e) => setQrCodeUrl(e.target.value)}
                        data-ocid="admin.qr_url_input"
                        className="bg-secondary border-border focus:border-crimson"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste a direct link to your UPI QR code image. Leave
                        blank to show a placeholder.
                      </p>
                    </div>

                    {qrCodeUrl && (
                      <div className="rounded-lg border border-border bg-secondary p-4 flex flex-col items-center gap-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Preview
                        </p>
                        <img
                          src={qrCodeUrl}
                          alt="UPI QR Code Preview"
                          className="w-40 h-40 object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSavingSettings}
                      className="bg-crimson hover:bg-crimson/90 text-white w-full"
                      data-ocid="admin.save_settings_button"
                    >
                      {isSavingSettings ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isSavingSettings ? "Saving..." : "Save Settings"}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

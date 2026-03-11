import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Clock, Loader2, Shield, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { PremiumPlan } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import {
  usePendingPremiumRequests,
  useVerifyPremiumRequest,
} from "../hooks/useQueries";

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { data: requests, isLoading } = usePendingPremiumRequests();
  const { mutateAsync: verifyRequest, isPending } = useVerifyPremiumRequest();

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
            Review and process premium payment requests.
          </p>
        </motion.div>

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
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">#</TableHead>
                  <TableHead className="text-muted-foreground">
                    User ID
                  </TableHead>
                  <TableHead className="text-muted-foreground">Plan</TableHead>
                  <TableHead className="text-muted-foreground">
                    UTR ID
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Submitted
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
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
                    data-ocid={`admin.request_row.${i + 1}`}
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-24 truncate">
                      {req.userId.toString().slice(0, 10)}...
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          req.plan === PremiumPlan.Yearly
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            : "bg-crimson/20 text-crimson border-crimson/30"
                        } border`}
                      >
                        {req.plan}
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
                      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs">
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleVerify(req.id, true)}
                          className="border-green-500/40 text-green-400 hover:bg-green-500/10 hover:text-green-300 h-7 px-2 text-xs gap-1"
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
      </div>
    </main>
  );
}

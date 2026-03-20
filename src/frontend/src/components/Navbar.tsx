import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Crown,
  Film,
  HelpCircle,
  Home,
  Menu,
  Phone,
  Shield,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";
import { useSubmitHelpDeskRequest } from "../hooks/useQueries";

export default function Navbar() {
  const {
    isLoggedIn,
    userProfile,
    isPremium,
    isAdmin,
    isLoading,
    refreshAuth,
  } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminCodeError, setAdminCodeError] = useState("");
  const [adminCodeLoading, setAdminCodeLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [helpDeskOpen, setHelpDeskOpen] = useState(false);
  const [hdName, setHdName] = useState("");
  const [hdPhone, setHdPhone] = useState("");
  const [hdProblem, setHdProblem] = useState("");
  const [hdSuccess, setHdSuccess] = useState(false);

  const { actor } = useActor();
  const { mutateAsync: submitHelpDesk, isPending: isSubmittingHd } =
    useSubmitHelpDeskRequest();

  const handleAdminPowerMode = () => {
    setAdminCode("");
    setAdminCodeError("");
    setAdminSuccess(false);
    setAdminModalOpen(true);
  };

  const handleAdminCodeSubmit = async () => {
    setAdminCodeError("");
    setAdminCodeLoading(true);
    try {
      if (adminCode === "1000") {
        // Activate admin role on the backend using the persistent local identity
        if (actor) {
          try {
            await actor.activateAdminWithCode("1000");
          } catch {
            // best-effort; fallback to localStorage only
          }
        }
        localStorage.setItem("ksrp_admin", "true");
        await refreshAuth();
        setAdminSuccess(true);
        setTimeout(() => {
          setAdminModalOpen(false);
          navigate({ to: "/admin" });
        }, 1200);
      } else {
        setAdminCodeError("Incorrect code. Please try again.");
      }
    } catch {
      setAdminCodeError("Something went wrong. Please try again.");
    } finally {
      setAdminCodeLoading(false);
    }
  };

  const openHelpDesk = () => {
    setHdName("");
    setHdPhone("");
    setHdProblem("");
    setHdSuccess(false);
    setHelpDeskOpen(true);
  };

  const handleHelpDeskSubmit = async () => {
    const name = hdName.trim();
    const phoneNumber = hdPhone.trim();
    const problem = hdProblem.trim();
    if (!name || !phoneNumber || !problem) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await submitHelpDesk({ name, phoneNumber, problem });
      setHdSuccess(true);
      toast.success("Help request submitted! We'll get back to you soon.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to submit: ${msg}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center shadow-crimson">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              <span className="text-crimson">KSRP</span>
              <span className="text-foreground"> FM</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              data-ocid="nav.home_link"
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            {/* Admin Power Mode - always visible for non-admins */}
            {!isAdmin && (
              <button
                type="button"
                data-ocid="nav.admin_power_mode_button"
                onClick={handleAdminPowerMode}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Power Mode
              </button>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
            {/* Help Desk button */}
            <button
              type="button"
              data-ocid="helpdesk.open_modal_button"
              onClick={openHelpDesk}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Help Desk
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="w-16 h-7" />
            ) : isLoggedIn ? (
              <>
                <Link to="/premium" data-ocid="nav.premium_link">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`hidden sm:flex gap-1.5 text-xs ${
                      isPremium
                        ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                        : "border-crimson/50 text-crimson"
                    }`}
                  >
                    <Crown className="w-3 h-3" />
                    {isPremium ? "Premium" : "Go Premium"}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-8 h-8 cursor-pointer border border-border hover:border-crimson transition-colors">
                      <AvatarFallback className="bg-secondary text-xs font-medium">
                        {userProfile?.firstName?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="gap-2 text-muted-foreground text-xs"
                      disabled
                    >
                      <User className="w-3 h-3" />
                      {userProfile?.firstName} {userProfile?.lastName}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={() => setProfileModalOpen(true)}
                      data-ocid="profile.open_modal_button"
                    >
                      <User className="w-3 h-3 text-crimson" />
                      View Your Profile
                    </DropdownMenuItem>
                    {!isAdmin && (
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={handleAdminPowerMode}
                        data-ocid="nav.dropdown_admin_power_mode_button"
                      >
                        <Shield className="w-3 h-3" />
                        Admin Power Mode
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem
                        className="gap-2 text-yellow-400 focus:text-yellow-300 cursor-pointer"
                        onClick={() => navigate({ to: "/admin" })}
                        data-ocid="nav.dropdown_admin_link"
                      >
                        <Shield className="w-3 h-3" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={openHelpDesk}
                      data-ocid="helpdesk.dropdown_open_button"
                    >
                      <HelpCircle className="w-3 h-3 text-crimson" />
                      Help Desk
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/auth">
                <Button
                  size="sm"
                  className="bg-crimson hover:bg-crimson/90 text-white text-xs"
                  data-ocid="nav.signin_button"
                >
                  Sign In
                </Button>
              </Link>
            )}
            <button
              type="button"
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <nav className="flex flex-col px-4 py-3 gap-1">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center gap-1.5"
                  data-ocid="nav.mobile_home_link"
                >
                  <Home className="w-3 h-3" />
                  Home
                </Link>
                {isLoggedIn && (
                  <>
                    <Link
                      to="/premium"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 rounded-md text-sm font-medium text-crimson"
                    >
                      <Crown className="w-3 h-3 inline mr-1" />
                      {isPremium ? "Premium" : "Go Premium"}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-crimson hover:bg-crimson/10 text-left flex items-center gap-1.5 transition-colors"
                      data-ocid="nav.mobile_profile_button"
                    >
                      <User className="w-3 h-3 text-crimson" />
                      View Profile
                    </button>
                  </>
                )}
                {!isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleAdminPowerMode();
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground text-left flex items-center gap-1.5"
                    data-ocid="nav.mobile_admin_power_mode_button"
                  >
                    <Shield className="w-3 h-3" />
                    Admin Power Mode
                  </button>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-yellow-400 flex items-center gap-1.5"
                    data-ocid="nav.mobile_admin_link"
                  >
                    <Shield className="w-3 h-3" />
                    Admin Panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    openHelpDesk();
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground text-left flex items-center gap-1.5"
                  data-ocid="nav.mobile_helpdesk_button"
                >
                  <HelpCircle className="w-3 h-3" />
                  Help Desk
                </button>
                {!isLoading && !isLoggedIn && (
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-crimson"
                    data-ocid="nav.mobile_signin_link"
                  >
                    Sign In
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Admin Power Mode Dialog */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="admin_power_mode.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              Admin Power Mode
            </DialogTitle>
            <DialogDescription>
              Enter the admin code to activate admin powers.
            </DialogDescription>
          </DialogHeader>
          {adminSuccess ? (
            <div
              className="flex flex-col items-center gap-2 py-4 text-green-400"
              data-ocid="admin_power_mode.success_state"
            >
              <Shield className="w-8 h-8" />
              <p className="font-medium">Admin powers activated!</p>
              <p className="text-xs text-muted-foreground">
                Redirecting to Admin Panel...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Input
                type="text"
                placeholder="Enter code"
                value={adminCode}
                onChange={(e) => {
                  setAdminCode(e.target.value);
                  setAdminCodeError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdminCodeSubmit()}
                data-ocid="admin_power_mode.input"
                className="text-center tracking-widest text-lg"
                autoFocus
              />
              {adminCodeError && (
                <p
                  className="text-xs text-destructive text-center"
                  data-ocid="admin_power_mode.error_state"
                >
                  {adminCodeError}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setAdminModalOpen(false)}
                  data-ocid="admin_power_mode.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleAdminCodeSubmit}
                  disabled={adminCodeLoading || !adminCode}
                  data-ocid="admin_power_mode.submit_button"
                >
                  {adminCodeLoading ? "Verifying..." : "Activate"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="profile.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-4 h-4 text-crimson" />
              Your Profile
            </DialogTitle>
            <DialogDescription>Your account details.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-crimson/20 border-2 border-crimson flex items-center justify-center">
                <span className="text-2xl font-bold text-crimson">
                  {userProfile?.firstName?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-secondary/50 border border-border">
                <User className="w-4 h-4 text-crimson shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Full Name
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-secondary/50 border border-border">
                <Phone className="w-4 h-4 text-crimson shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Phone Number
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {userProfile?.mobileNumber ?? "—"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-crimson hover:bg-crimson/90 text-white"
              onClick={() => setProfileModalOpen(false)}
              data-ocid="profile.close_button"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Desk Dialog */}
      <Dialog open={helpDeskOpen} onOpenChange={setHelpDeskOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="helpdesk.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-crimson" />
              Help Desk
            </DialogTitle>
            <DialogDescription>
              Fill in your details and describe your problem. Our team will get
              back to you soon.
            </DialogDescription>
          </DialogHeader>
          {hdSuccess ? (
            <div
              className="flex flex-col items-center gap-3 py-6 text-center"
              data-ocid="helpdesk.success_state"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-green-400" />
              </div>
              <p className="font-medium text-foreground">Request Submitted!</p>
              <p className="text-sm text-muted-foreground">
                We've received your request and will get back to you shortly.
              </p>
              <Button
                className="bg-crimson hover:bg-crimson/90 text-white mt-2"
                onClick={() => setHelpDeskOpen(false)}
                data-ocid="helpdesk.close_button"
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Name *</Label>
                <Input
                  placeholder="Your full name"
                  value={hdName}
                  onChange={(e) => setHdName(e.target.value)}
                  required
                  data-ocid="helpdesk.name_input"
                  className="bg-secondary border-border focus:border-crimson"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">
                  Phone Number *
                </Label>
                <Input
                  placeholder="Your phone number"
                  value={hdPhone}
                  onChange={(e) => setHdPhone(e.target.value)}
                  required
                  data-ocid="helpdesk.phone_input"
                  className="bg-secondary border-border focus:border-crimson"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">
                  Problem *
                </Label>
                <Textarea
                  placeholder="Describe your problem in detail..."
                  value={hdProblem}
                  onChange={(e) => setHdProblem(e.target.value)}
                  required
                  rows={4}
                  data-ocid="helpdesk.problem_textarea"
                  className="bg-secondary border-border focus:border-crimson resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setHelpDeskOpen(false)}
                  data-ocid="helpdesk.close_button"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleHelpDeskSubmit}
                  disabled={isSubmittingHd}
                  className="flex-1 bg-crimson hover:bg-crimson/90 text-white"
                  data-ocid="helpdesk.submit_button"
                >
                  {isSubmittingHd ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

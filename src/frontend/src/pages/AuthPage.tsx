import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Film, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useActor } from "../hooks/useActor";
import { sha256 } from "../utils/crypto";

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes("Invalid credentials"))
      return "Invalid mobile number or password.";
    if (msg.includes("Mobile number already registered"))
      return "This mobile number is already registered. Please log in.";
    if (msg.includes("already registered"))
      return "This mobile number is already registered.";
    return msg;
  }
  return "Something went wrong. Please try again.";
}

export default function AuthPage() {
  const { actor } = useActor();
  const { login, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Read admin token from URL if present
  const adminToken = new URLSearchParams(window.location.search).get(
    "caffeineAdminToken",
  );

  const [loginForm, setLoginForm] = useState({ mobile: "", password: "" });
  const [regForm, setRegForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    password: "",
  });

  const tryGrantAdmin = async () => {
    if (!actor || !adminToken) return;
    try {
      await actor._initializeAccessControlWithSecret(adminToken);
      await refreshAuth();
      toast.success(
        "Admin access granted! You now have full admin privileges.",
      );
    } catch {
      // Already initialized or token mismatch -- silently ignore
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected to backend. Please wait and try again.");
      return;
    }
    setLoading(true);
    try {
      const hash = await sha256(loginForm.password);
      const success = await actor.login(loginForm.mobile, hash);
      if (success) {
        await login(loginForm.mobile);
        if (adminToken) {
          await tryGrantAdmin();
        }
        toast.success("Welcome back!");
        navigate({ to: adminToken ? "/admin" : "/" });
      } else {
        toast.error("Invalid mobile number or password.");
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected to backend. Please wait and try again.");
      return;
    }
    setLoading(true);
    try {
      const hash = await sha256(regForm.password);
      const success = await actor.register(
        regForm.firstName,
        regForm.lastName,
        regForm.mobile,
        hash,
      );
      if (success) {
        await actor.login(regForm.mobile, hash);
        await login(regForm.mobile);
        if (adminToken) {
          await tryGrantAdmin();
        }
        toast.success("Account created! Welcome to KSRP FM.");
        navigate({ to: adminToken ? "/admin" : "/" });
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto flex items-start justify-center bg-background relative py-10 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-crimson/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-crimson/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.18_0.01_270)_0%,_transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-crimson flex items-center justify-center shadow-crimson mb-3">
            <Film className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl">
            <span className="text-crimson">KSRP</span> FM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your cinematic short film universe
          </p>
        </div>

        {adminToken && (
          <div className="mb-4 rounded-lg border border-crimson/30 bg-crimson/10 px-4 py-3 text-sm text-crimson">
            Admin setup mode -- log in or register to get admin access.
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6 shadow-card-hover">
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6 bg-secondary">
              <TabsTrigger
                value="login"
                className="flex-1 data-[state=active]:bg-crimson data-[state=active]:text-white"
                data-ocid="auth.login_tab"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 data-[state=active]:bg-crimson data-[state=active]:text-white"
                data-ocid="auth.register_tab"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Mobile Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={loginForm.mobile}
                    onChange={(e) =>
                      setLoginForm((p) => ({ ...p, mobile: e.target.value }))
                    }
                    required
                    data-ocid="auth.mobile_input"
                    className="bg-secondary border-border focus:border-crimson"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((p) => ({
                          ...p,
                          password: e.target.value,
                        }))
                      }
                      required
                      data-ocid="auth.password_input"
                      className="bg-secondary border-border focus:border-crimson pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold mt-2 bg-white hover:bg-gray-100 text-black border border-gray-300"
                  data-ocid="auth.submit_button"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      First Name
                    </Label>
                    <Input
                      placeholder="John"
                      value={regForm.firstName}
                      onChange={(e) =>
                        setRegForm((p) => ({ ...p, firstName: e.target.value }))
                      }
                      required
                      className="bg-secondary border-border focus:border-crimson"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Last Name
                    </Label>
                    <Input
                      placeholder="Doe"
                      value={regForm.lastName}
                      onChange={(e) =>
                        setRegForm((p) => ({ ...p, lastName: e.target.value }))
                      }
                      required
                      className="bg-secondary border-border focus:border-crimson"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Mobile Number
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regForm.mobile}
                    onChange={(e) =>
                      setRegForm((p) => ({ ...p, mobile: e.target.value }))
                    }
                    required
                    data-ocid="auth.reg_mobile_input"
                    className="bg-secondary border-border focus:border-crimson"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Create a password"
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm((p) => ({ ...p, password: e.target.value }))
                      }
                      required
                      data-ocid="auth.reg_password_input"
                      className="bg-secondary border-border focus:border-crimson pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-semibold mt-2 bg-white hover:bg-gray-100 text-black border border-gray-300"
                  data-ocid="auth.reg_submit_button"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

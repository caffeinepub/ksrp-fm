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

export default function AuthPage() {
  const { actor } = useActor();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ mobile: "", password: "" });
  const [regForm, setRegForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setLoading(true);
    try {
      const hash = await sha256(loginForm.password);
      const success = await actor.login(loginForm.mobile, hash);
      if (success) {
        await login(loginForm.mobile);
        toast.success("Welcome back!");
        navigate({ to: "/" });
      } else {
        toast.error("Invalid mobile number or password");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Not connected to backend");
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
        toast.success("Account created! Welcome to KSRP FM.");
        navigate({ to: "/" });
      } else {
        toast.error(
          "Registration failed. Mobile number may already be registered.",
        );
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-crimson/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-crimson/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.18_0.01_270)_0%,_transparent_70%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md px-4"
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
                  className="w-full bg-crimson hover:bg-crimson/90 text-white font-semibold"
                  data-ocid="auth.submit_button"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Signing in..." : "Sign In"}
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
                      placeholder="Create a password"
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm((p) => ({ ...p, password: e.target.value }))
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
                  className="w-full bg-crimson hover:bg-crimson/90 text-white font-semibold"
                  data-ocid="auth.submit_button"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

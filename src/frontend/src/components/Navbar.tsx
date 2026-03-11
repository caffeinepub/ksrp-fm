import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Crown, Film, LogOut, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Genre } from "../backend.d";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, userProfile, isPremium, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth" });
  };

  const navLinks = [
    { label: "Home", to: "/", ocid: "nav.home_link" },
    {
      label: "Romance",
      to: `/browse/${Genre.Romance}`,
      ocid: "nav.browse_link",
    },
    {
      label: "Thriller",
      to: `/browse/${Genre.Thriller}`,
      ocid: "nav.browse_link",
    },
    { label: "Action", to: `/browse/${Genre.Action}`, ocid: "nav.browse_link" },
  ];

  return (
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
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={link.ocid}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-crimson bg-crimson/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
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
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    className="gap-2 text-muted-foreground text-xs"
                    disabled
                  >
                    <User className="w-3 h-3" />
                    {userProfile?.firstName} {userProfile?.lastName}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleLogout}
                    data-ocid="nav.logout_button"
                  >
                    <LogOut className="w-3 h-3" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                className="bg-crimson hover:bg-crimson/90 text-white text-xs"
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
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-crimson bg-crimson/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn && (
                <Link
                  to="/premium"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-crimson"
                >
                  <Crown className="w-3 h-3 inline mr-1" />
                  {isPremium ? "Premium" : "Go Premium"}
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

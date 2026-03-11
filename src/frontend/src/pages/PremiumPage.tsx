import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Check, Crown, Loader2, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PremiumPlan } from "../backend.d";
import { useAuth } from "../context/AuthContext";
import { useSubmitPremiumRequest } from "../hooks/useQueries";

const BENEFITS = [
  "No advertisements",
  "Unlimited video access",
  "Exclusive premium content",
  "Early access to new releases",
  "HD streaming quality",
];

export default function PremiumPage() {
  const { isPremium, premiumExpiresAt, refreshAuth } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [utrId, setUtrId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutateAsync: submitRequest, isPending } = useSubmitPremiumRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !utrId.trim()) return;
    try {
      await submitRequest({ plan: selectedPlan, utrId: utrId.trim() });
      setSubmitted(true);
      await refreshAuth();
    } catch {
      toast.error("Failed to submit payment request. Please try again.");
    }
  };

  const premiumExpiry = premiumExpiresAt
    ? new Date(Number(premiumExpiresAt) / 1_000_000).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
    : null;

  return (
    <main className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="text-sm font-semibold uppercase tracking-widest text-gold">
              Premium
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">
            Unlock the Full Experience
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get unlimited access to all short films, exclusive content, and
            enjoy an ad-free experience.
          </p>
        </motion.div>

        {/* Active Premium Status */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-yellow-300">
                  Premium Active
                </h3>
                {premiumExpiry && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Expires {premiumExpiry}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {BENEFITS.map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedPlan(PremiumPlan.Monthly)}
            data-ocid="premium.monthly_card"
            className={`rounded-2xl border-2 p-6 cursor-pointer transition-all ${
              selectedPlan === PremiumPlan.Monthly
                ? "border-crimson bg-crimson/10 shadow-crimson"
                : "border-border bg-card hover:border-crimson/40"
            }`}
          >
            <h3 className="font-display font-bold text-xl mb-1">Monthly</h3>
            <div className="flex items-end gap-1 mb-4">
              <span className="font-display font-bold text-4xl text-crimson">
                ₹100
              </span>
              <span className="text-muted-foreground mb-1">/month</span>
            </div>
            <ul className="space-y-2">
              {BENEFITS.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="w-3.5 h-3.5 text-crimson flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            {selectedPlan === PremiumPlan.Monthly && (
              <Badge className="mt-4 bg-crimson/20 text-crimson border-crimson/30">
                Selected
              </Badge>
            )}
          </motion.div>

          {/* Yearly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedPlan(PremiumPlan.Yearly)}
            data-ocid="premium.yearly_card"
            className={`rounded-2xl border-2 p-6 cursor-pointer relative transition-all ${
              selectedPlan === PremiumPlan.Yearly
                ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_oklch(0.78_0.15_82/0.3)]"
                : "border-border bg-card hover:border-yellow-500/40"
            }`}
          >
            <div className="absolute -top-3 right-4">
              <Badge className="bg-yellow-500 text-black text-xs font-bold">
                Save ₹200
              </Badge>
            </div>
            <h3 className="font-display font-bold text-xl mb-1">Yearly</h3>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-display font-bold text-4xl text-gold">
                ₹1000
              </span>
              <span className="text-muted-foreground mb-1">/year</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Just ₹83/month — save 17%
            </p>
            <ul className="space-y-2">
              {BENEFITS.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            {selectedPlan === PremiumPlan.Yearly && (
              <Badge className="mt-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                Selected
              </Badge>
            )}
          </motion.div>
        </div>

        {/* CTA */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              className="bg-crimson hover:bg-crimson/90 text-white px-12 shadow-crimson font-semibold"
              onClick={() => {}}
              data-ocid="premium.submit_button"
            >
              <Crown className="w-4 h-4 mr-2" />
              Proceed to Payment
            </Button>
          </motion.div>
        )}

        {/* Payment Dialog */}
        <Dialog
          open={!!selectedPlan}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPlan(null);
              setUtrId("");
              setSubmitted(false);
            }
          }}
        >
          <DialogContent
            className="max-w-md"
            data-ocid="premium.payment_dialog"
          >
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-xl">
                {submitted ? "Payment Submitted!" : "Complete Payment"}
              </DialogTitle>
            </DialogHeader>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-green-400">
                  Payment Received!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your payment is being verified. Premium will be activated
                  within 24 hours.
                </p>
                <Button
                  className="mt-6 bg-crimson hover:bg-crimson/90 text-white"
                  onClick={() => {
                    setSelectedPlan(null);
                    setUtrId("");
                    setSubmitted(false);
                  }}
                >
                  Done
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-5">
                <div className="bg-secondary rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold mb-3">
                    Pay{" "}
                    {selectedPlan === PremiumPlan.Monthly ? "₹100" : "₹1000"}{" "}
                    via UPI
                  </p>
                  <div className="flex justify-center">
                    <img
                      src="/assets/generated/payment-qr.dim_300x300.png"
                      alt="UPI QR Code"
                      className="w-52 h-52 rounded-lg border border-border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Scan to pay via UPI. After payment, enter your
                    UTR/Transaction ID below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      UTR / Transaction ID
                    </Label>
                    <Input
                      placeholder="Enter transaction ID (e.g. 412345678901)"
                      value={utrId}
                      onChange={(e) => setUtrId(e.target.value)}
                      required
                      data-ocid="premium.utr_input"
                      className="bg-secondary border-border focus:border-crimson"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isPending || !utrId.trim()}
                    className="w-full bg-crimson hover:bg-crimson/90 text-white"
                    data-ocid="premium.submit_button"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {isPending ? "Submitting..." : "Submit Payment"}
                  </Button>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

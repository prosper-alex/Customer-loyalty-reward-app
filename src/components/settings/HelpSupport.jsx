import { useState } from "react";
import { Icon } from "@iconify/react";
import { SettingsHeader } from "./SettingsHeader";
import { useAppData } from "../../context/AppDataContext";

const FAQS = [
  {
    q: "How do I earn points?",
    a: "You earn 10 points for every ₦100 spent at any partner outlet. Bring your own tumbler for +50 bonus points, or order ahead in the app for 1.5× points.",
  },
  {
    q: "How long do points last?",
    a: "Points stay active as long as you make at least one purchase every 12 months. Expiring points show up under Notifications before they lapse.",
  },
  {
    q: "Can I transfer points to someone else?",
    a: "Not yet — points are tied to your account. Referral bonuses are the closest way to share the love: invite a friend and you both earn.",
  },
  {
    q: "My reward didn't apply at checkout, what do I do?",
    a: "Show the cashier your barcode from Wallet & Pass, or reach out below with your Member ID and we'll sort it out.",
  },
];

export function HelpSupport() {
  const { profile, submitSupportTicket } = useAppData();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!subject.trim() || !message.trim()) {
      setError("Fill in both the subject and message.");
      return;
    }
    setSubmitting(true);
    const { error } = await submitSupportTicket({ subject, message });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSubject("");
    setMessage("");
    setSent(true);
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <SettingsHeader title="Help & Support" />

      <div className="px-5 md:px-8 mt-6 max-w-lg space-y-8">
        <section>
          <h2 className="font-bold text-lg mb-4">Frequently asked questions</h2>
          <div className="card bg-card border border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {FAQS.map((faq, i) => (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="font-bold text-sm md:text-base">{faq.q}</span>
                    <Icon
                      icon="solar:alt-arrow-down-outline"
                      className={`size-5 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-4">Contact support</h2>
          {sent ? (
            <div className="card bg-accent/10 border border-accent/30 shadow-sm">
              <div className="card-body p-6 items-center text-center">
                <Icon icon="solar:check-circle-bold" className="size-10 text-accent mb-2" />
                <p className="font-bold">Message sent</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll get back to you at your registered email
                  {profile?.email ? ` (${profile.email})` : ""}, usually within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="btn btn-ghost btn-sm mt-4 font-bold text-primary"
                >
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card bg-card border border-border shadow-sm">
              <div className="card-body p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold" htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                    placeholder="e.g. Points not credited"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="textarea textarea-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                    placeholder="Tell us what happened…"
                  />
                </div>
                {error && (
                  <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full rounded-xl h-12 font-bold disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

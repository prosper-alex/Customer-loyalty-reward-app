import { Icon } from "@iconify/react";
import { useState } from "react";
import jsPDF from "jspdf";
import { MobileNav } from "./Sidebar";
import { useAppData } from "../context/AppDataContext";
import apiClient from "../lib/apiClient";

function formatDate(dateString) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function generatePurchasePDF(purchase) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  const totalPrice = Number(purchase.totalPrice) || 0;
  const quantity = Number(purchase.quantity) || 0;
  const pointsEarned = Number(purchase.pointsEarned) || 0;

  const pricePerUnit = quantity > 0 ? totalPrice / quantity : totalPrice;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(30, 30, 30);
  doc.text("Customer Loyalty App", margin, 25);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Purchase Receipt", margin, 33);

  // Receipt status
  const status = purchase.status || "Completed";

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 120, 70);
  doc.text(status.toUpperCase(), pageWidth - margin, 25, { align: "right" });

  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 40, pageWidth - margin, 40);

  // Purchase information
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  doc.text("PURCHASE DATE", margin, 52);
  doc.text("TRANSACTION ID", pageWidth / 2, 52);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  doc.text(formatDateTime(purchase.createdAt), margin, 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const transactionId = purchase._id || "—";

  doc.text(transactionId, pageWidth / 2, 60);

  // Product section
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 70, pageWidth - margin, 70);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  doc.text("ITEM", margin, 82);
  doc.text("QTY", 115, 82);
  doc.text("UNIT PRICE", 140, 82);
  doc.text("TOTAL", pageWidth - margin, 82, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  const productName = purchase.productName || "Product";

  doc.text(productName, margin, 94);
  doc.text(String(quantity), 115, 94);

  doc.text(`₦${pricePerUnit.toLocaleString()}`, 140, 94);

  doc.text(`₦${totalPrice.toLocaleString()}`, pageWidth - margin, 94, {
    align: "right",
  });

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 105, pageWidth - margin, 105);

  // Total
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);

  doc.text("Total Paid", margin, 120);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);

  doc.text(`₦${totalPrice.toLocaleString()}`, pageWidth - margin, 120, {
    align: "right",
  });

  // Points earned box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, 132, pageWidth - margin * 2, 25, 4, 4, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  doc.text("Points Earned", margin + 8, 147);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(40, 120, 70);

  doc.text(
    `+${pointsEarned.toLocaleString()} pts`,
    pageWidth - margin - 8,
    147,
    { align: "right" },
  );

  // Footer divider
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 170, pageWidth - margin, 170);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  doc.text("Thank you for your purchase!", pageWidth / 2, 185, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);

  doc.text("Keep this receipt for your records.", pageWidth / 2, 193, {
    align: "center",
  });

  return doc;
}

export function PurchaseHistory() {
  const { purchases, loading } = useAppData();

  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const handleViewDetails = async (purchaseId) => {
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedPurchase(null);

    try {
      const result = await apiClient(
        `/purchases/getPurchaseById/${purchaseId}`,
      );

      setSelectedPurchase(result.data?.purchase || result.data);
    } catch (error) {
      setDetailsError(error.message || "Unable to load purchase details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedPurchase(null);
    setDetailsError("");
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <header className="px-5 md:px-8 pt-6 pb-6 border-b border-border/40">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Purchase History
        </h1>

        <p className="text-muted-foreground mt-2">
          View your previous purchases and points earned.
        </p>
      </header>

      <div className="px-5 md:px-8 py-8">
        <div className="card bg-card border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Icon
                icon="solar:bag-4-outline"
                className="size-16 mx-auto text-muted-foreground mb-4"
              />

              <h2 className="text-xl font-semibold">No purchases yet</h2>

              <p className="text-muted-foreground mt-2">
                Your completed purchases will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {purchases.map((purchase) => (
                <button
                  key={purchase._id}
                  type="button"
                  onClick={() => handleViewDetails(purchase._id)}
                  className="w-full text-left p-5 hover:bg-gray-200 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon icon="solar:bag-4-outline" className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-semibold">
                          {purchase.productName}
                        </h2>

                        <p className="text-sm text-muted-foreground mt-1">
                          Purchased on {formatDate(purchase.createdAt)}
                        </p>

                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: {purchase.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <p className="font-bold">
                        ₦{Number(purchase.totalPrice).toLocaleString()}
                      </p>

                      <p className="text-sm text-green-600 font-medium mt-1">
                        +{purchase.pointsEarned} pts
                      </p>

                      <p className="text-sm text-muted-foreground mt-1">
                        {purchase.status}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Details */}
      {(selectedPurchase || detailsLoading || detailsError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold">Purchase Details</h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Transaction information
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="btn btn-circle btn-dark text-white"
                aria-label="Close purchase details"
              >
                <Icon icon="solar:close-circle-outline" className="size-6" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : detailsError ? (
              <div className="p-6 text-center">
                <Icon
                  icon="solar:danger-circle-outline"
                  className="size-12 mx-auto text-error mb-3"
                />

                <p className="font-medium">{detailsError}</p>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="btn btn-dark mt-5"
                >
                  Close
                </button>
              </div>
            ) : selectedPurchase ? (
              <div className="p-6 space-y-5">
                <div className="rounded-2xl bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                    Product
                  </p>

                  <p className="text-lg font-bold mt-1">
                    {selectedPurchase.productName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold mt-1">
                      {selectedPurchase.quantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold mt-1">
                      ₦{Number(selectedPurchase.totalPrice).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Points Earned
                    </p>
                    <p className="font-semibold text-green-600 mt-1">
                      +{selectedPurchase.pointsEarned}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold mt-1">
                      {selectedPurchase.status}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction ID
                  </p>

                  <p className="text-sm font-mono break-all mt-1">
                    {selectedPurchase._id}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const doc = generatePurchasePDF(selectedPurchase);
                      doc.save(`purchase-${selectedPurchase._id}.pdf`);
                    }}
                    className="btn btn-dark text-white"
                  >
                    <Icon
                      icon="solar:file-download-outline"
                      className="size-5"
                    />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const purchase = selectedPurchase;

                      const shareText = `Purchase Receipt
                        Product: ${purchase.productName}
                        Quantity: ${purchase.quantity}
                        Total: ₦${Number(purchase.totalPrice).toLocaleString()}
                        Points Earned: +${purchase.pointsEarned}
                        Transaction ID: ${purchase._id}
                        Date: ${formatDateTime(purchase.createdAt)}`;

                      try {
                        // Generate the PDF without automatically downloading it.
                        const doc = generatePurchasePDF(purchase);
                        const pdfBlob = doc.output("blob");

                        const pdfFile = new File(
                          [pdfBlob],
                          `purchase-${purchase._id}.pdf`,
                          { type: "application/pdf" },
                        );

                        if (
                          navigator.share &&
                          navigator.canShare({ files: [pdfFile] })
                        ) {
                          // Attach the actual PDF file to the native share menu.
                          await navigator.share({
                            title: "Purchase Receipt",
                            files: [pdfFile],
                          });
                        } else if (navigator.share) {
                          await navigator.share({
                            title: "Purchase Receipt",
                            text: shareText,
                          });
                        } else {
                          await navigator.clipboard.writeText(shareText);
                          alert("Purchase details copied to clipboard.");
                        }
                      } catch (error) {
                        if (error.name !== "AbortError") {
                          console.error("Share failed:", error);
                          alert(
                            "Unable to share the receipt. Please try again.",
                          );
                        }
                      }
                    }}
                    className="btn btn-dark text-white"
                  >
                    <Icon icon="solar:share-outline" className="size-5" />
                    Share
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <MobileNav />
    </main>
  );
}

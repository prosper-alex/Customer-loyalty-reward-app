import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { MobileNav } from "../components/Sidebar";
import { useAppData } from "../context/AppDataContext";

export function Products() {
  const {
    products,
    favorites,
    loading,
    purchaseProduct,
    isFavorite,
    addFavorite,
    removeFavorite,
  } = useAppData();

  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [purchasingProductId, setPurchasingProductId] = useState(null);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) =>
      `${product.name} ${product.description || ""}`
        .toLowerCase()
        .includes(search),
    );
  }, [products, searchTerm]);

  const favoriteProducts = favorites;

  const handleQuantityChange = (productId, value, maxQuantity) => {
    const quantity = Math.max(1, Math.min(Number(value) || 1, maxQuantity));

    setQuantities((current) => ({
      ...current,
      [productId]: quantity,
    }));
  };

  const handlePurchase = async (productId, quantity) => {
    if (purchasingProductId) return;

    setPurchasingProductId(productId);
    setFeedback(null);

    try {
      const { error } = await purchaseProduct(productId, quantity);

      if (error) {
        setFeedback({
          type: "error",
          message: error.message,
        });
        return;
      }

      setFeedback({
        type: "success",
        message: "Purchase successful! Your points have been added.",
      });

      setQuantities((current) => ({
        ...current,
        [productId]: 1,
      }));
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.message ||
          "Unable to complete your purchase. Please try again.",
      });
    } finally {
      setPurchasingProductId(null);
    }
    };

  const handleFavorite = async (productId) => {
    setFeedback(null);

    if (isFavorite(productId)) {
      const { error } = await removeFavorite(productId);

      if (error) {
        setFeedback({
          type: "error",
          message: error.message,
        });
      }

      return;
    }

    const { error } = await addFavorite(productId);

    if (error) {
      setFeedback({
        type: "error",
        message: error.message,
      });
    }
  };

  if (loading) {
    return (
      <>
        <main className="w-full min-w-0 p-6 pb-28 md:p-8">
          <div className="flex min-h-[60vh] items-center justify-center">
            <span
              className="loading loading-spinner loading-lg text-primary"
              role="status"
              aria-label="Loading products"
            />
          </div>
        </main>

        <MobileNav />
      </>
    );
  }

  return (
    <>
      <main className="w-full min-w-0 p-6 pb-28 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Products</h1>

            <p className="mt-2 text-muted-foreground">
              Browse our products and earn loyalty points with every purchase.
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-xl">
              <Icon
                icon="solar:magnifer-outline"
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products..."
                className="input input-bordered w-full bg-muted/30 pl-12"
              />
            </div>
          </div>

          {feedback && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
              <div
                role="alert"
                className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-xl"
              >
                <div
                  className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full ${
                    feedback.type === "success" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Icon
                    icon={
                      feedback.type === "success"
                        ? "solar:check-circle-bold"
                        : "solar:danger-circle-bold"
                    }
                    className={`size-7 ${
                      feedback.type === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                </div>

                <h3 className="text-lg font-bold">
                  {feedback.type === "success"
                    ? "Purchase Successful"
                    : "Purchase Failed"}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {feedback.message}
                </p>

                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="btn btn-dark mt-5 w-full text-white"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* My Favourites */}
          {favoriteProducts.length > 0 && (
            <section className="mb-12">
              <div className="mb-5">
                <h2 className="text-2xl font-bold">My Favourites</h2>

                <p className="mt-1 text-muted-foreground">
                  Products you've saved for later.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteProducts.map((product) => (
                  <div
                    key={product._id}
                    className="card border border-border bg-card shadow-sm"
                  >
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                          <Icon
                            icon="solar:bag-4-outline"
                            className="size-7 text-primary"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleFavorite(product._id)}
                          className="btn btn-circle btn-ghost"
                          aria-label="Remove from favourites"
                        >
                          <Icon
                            icon="solar:heart-bold"
                            className="size-6 text-primary"
                          />
                        </button>
                      </div>

                      <h3 className="card-title mt-4">{product.name}</h3>

                      <p className="text-muted-foreground">
                        {product.description || "No description available."}
                      </p>

                      {product.size && (
                        <p className="text-sm text-muted-foreground">
                          Size: {product.size}
                        </p>
                      )}

                      <p className="mt-4 text-2xl font-bold">
                        ₦{Number(product.price).toLocaleString()}
                      </p>

                      <p className="font-medium text-primary">
                        Earn {product.points} points
                      </p>

                      <button
                        type="button"
                        className="btn btn-dark mt-4 w-full text-white"
                        onClick={() => handlePurchase(product._id, 1)}
                        disabled={
                          !product.isAvailable ||
                          product.quantity < 1 ||
                          purchasingProductId !== null
                        }
                      >
                        {purchasingProductId === product._id
                          ? "Buying..."
                          : !product.isAvailable || product.quantity < 1
                            ? "Out of Stock"
                            : "Buy Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Products */}
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold">All Products</h2>

              <p className="mt-1 text-muted-foreground">
                Choose a product to make a purchase.
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <Icon
                  icon="solar:box-minimalistic-outline"
                  className="mx-auto mb-4 size-12 text-muted-foreground"
                />

                <h3 className="text-lg font-semibold">No products found</h3>

                <p className="mt-2 text-muted-foreground">
                  Try searching for a different product.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="card border border-border bg-card shadow-sm"
                  >
                    <div className="card-body">
                      {/* Product Header */}
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="card-title">{product.name}</h2>

                        <button
                          type="button"
                          onClick={() => handleFavorite(product._id)}
                          className="btn btn-circle btn-ghost"
                          aria-label={
                            isFavorite(product._id)
                              ? "Remove from favourites"
                              : "Add to favourites"
                          }
                        >
                          <Icon
                            icon={
                              isFavorite(product._id)
                                ? "solar:heart-bold"
                                : "solar:heart-outline"
                            }
                            className={`size-6 ${
                              isFavorite(product._id)
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Description */}
                      <p className="text-muted-foreground">
                        {product.description || "No description available."}
                      </p>

                      {/* Product Size */}
                      {product.size && (
                        <p className="text-sm text-muted-foreground">
                          Size: {product.size}
                        </p>
                      )}

                      {/* Price */}
                      <p className="mt-4 text-2xl font-bold">
                        ₦{Number(product.price).toLocaleString()}
                      </p>

                      {/* Points */}
                      <p className="font-medium text-primary">
                        Earn {product.points} points
                      </p>

                      {/* Stock */}
                      <p className="text-sm text-muted-foreground">
                        {product.quantity > 0
                          ? `${product.quantity} available`
                          : "Out of stock"}
                      </p>

                      {/* Quantity */}
                      {product.isAvailable && product.quantity > 0 && (
                        <div className="mt-2">
                          <label
                            htmlFor={`quantity-${product._id}`}
                            className="mb-2 block text-sm font-medium"
                          >
                            Quantity
                          </label>

                          <input
                            id={`quantity-${product._id}`}
                            type="number"
                            min="1"
                            max={product.quantity}
                            value={quantities[product._id] || 1}
                            onChange={(event) =>
                              handleQuantityChange(
                                product._id,
                                event.target.value,
                                product.quantity,
                              )
                            }
                            className="input input-bordered w-24 bg-background"
                          />
                        </div>
                      )}

                      {/* Purchase Button */}
                      <button
                        type="button"
                        className="btn btn-dark mt-4 w-full text-white"
                        onClick={() =>
                          handlePurchase(
                            product._id,
                            quantities[product._id] || 1,
                          )
                        }
                        disabled={
                          !product.isAvailable ||
                          product.quantity < 1 ||
                          purchasingProductId !== null
                        }
                      >
                        {purchasingProductId === product._id
                          ? "Buying..."
                          : !product.isAvailable || product.quantity < 1
                            ? "Out of Stock"
                            : "Buy Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <MobileNav />
    </>
  );
}

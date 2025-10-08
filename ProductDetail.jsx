// frontend/src/pages/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProduct, submitReview } from "../lib/api";

// ---------- Stars helpers ----------
function Stars({ value = 0, outOf = 5, size = 18, color = "#f5c04a" }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = outOf - full - (half ? 1 : 0);
  const starStyle = { fontSize: size, color, lineHeight: 1, marginRight: 2 };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {Array.from({ length: full }).map((_, i) => (
          <span key={"f" + i} style={starStyle}>
            ★
          </span>
        ))}
        {half ? (
          <span key="half" style={starStyle}>
            ☆
          </span>
        ) : null}
        {Array.from({ length: empty }).map((_, i) => (
          <span key={"e" + i} style={{ ...starStyle, color: "#ccc" }}>
            ★
          </span>
        ))}
      </div>
    </div>
  );
}

function StarsInput({ value = 0, onChange, size = 20 }) {
  const starStyle = (active) => ({
    fontSize: size,
    color: active ? "#f5c04a" : "#ccc",
    cursor: "pointer",
    marginRight: 4,
  });

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const v = i + 1;
        return (
          <span
            key={v}
            style={starStyle(v <= value)}
            onClick={() => onChange(v)}
            onKeyDown={(e) => e.key === "Enter" && onChange(v)}
            role="button"
            tabIndex={0}
            aria-label={`${v} star`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
// ---------- end helpers ----------

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // feedback states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userHasLeftReview, setUserHasLeftReview] = useState(false);

  // submit helpers & UI
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // mock purchase check
  const userHasBoughtThisProduct = true; // TODO: replace with real logic

  // === IMPORTANT: fallback related now contains ONLY the two items you asked for ===
  // images are expected at public/tv.png and public/headphones.png
  const fallbackRelated = [
    {
      id: "tv-001",
      title: "4K Ultra HD Smart TV",
      name: "4K Ultra HD Smart TV",
      price: 799.0,
      image: "/tv.png",
    },
    {
      id: "headphones-001",
      title: "Wireless Noise-Cancelling Headphones",
      name: "Wireless Noise-Cancelling Headphones",
      price: 199.0,
      image: "/headphones.png",
    },
  ];

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/products/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Product fetch failed");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        // try common related fields that backend might provide
        const relatedFromApi =
          data.related ||
          data.related_products ||
          data.relatedProducts ||
          data.recommendations ||
          [];
        // if backend returns an array use it, otherwise use our two-item fallback
        if (Array.isArray(relatedFromApi) && relatedFromApi.length > 0) {
          setRelated(relatedFromApi);
        } else {
          // filter fallback to avoid showing the same product in related (by id)
          const filtered = fallbackRelated.filter(
            (r) => String(r.id) !== String(id)
          );
          setRelated(filtered);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("product error:", err);
        // on error use fallback (filter out current product id if matches)
        const filtered = fallbackRelated.filter((r) => String(r.id) !== String(id));
        setRelated(filtered);
        setLoading(false);
      });
  }, [id]);

  function openSuccessModal(msg = "Thanks for your feedback 🎉") {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2500);
  }

  // handle submit (uses api.submitReview and falls back to localStorage)
  async function handleSubmitReview() {
    if (rating < 1) {
      alert("Choose 1-5 stars before submitting.");
      return;
    }
    if (!product || !product.id) {
      alert("Product not loaded yet.");
      return;
    }

    setReviewSubmitting(true);

    // Try backend first
    try {
      await submitReview(product.id, rating, comment || "");
      // success
      setUserHasLeftReview(true);
      setRating(0);
      setComment("");
      openSuccessModal("🎉 Your review was submitted to the server!");
      setReviewSubmitting(false);
      return;
    } catch (err) {
      console.warn("submitReview failed:", err);
    }

    // Fallback: save locally
    try {
      const payload = {
        product: product.id,
        rating,
        text: comment || "",
        created_at: new Date().toISOString(),
      };
      const key = `reviews_local_${product.id}`;
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(payload);
      localStorage.setItem(key, JSON.stringify(arr));

      setUserHasLeftReview(true);
      setRating(0);
      setComment("");
      openSuccessModal(
        "Saved locally (offline). Your review is stored in localStorage 🎉"
      );
    } catch (err) {
      console.error("Local save error:", err);
      alert("Could not submit or save review. See console for details.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!product) return <p style={{ color: "red" }}>Product not found.</p>;

  const title = product.name || product.title || "Product";
  const description = product.description || product.short_description || "";
  const price = product.price ?? product.amount ?? 0;

  // Inline styles used inside component (as requested)
  const containerStyle = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 24,
    fontFamily:
      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  };
  const gridStyle = { display: "grid", gridTemplateColumns: "380px 1fr", gap: 32, alignItems: "start" };
  const imageBox = {
    background: "#fff",
    borderRadius: 8,
    padding: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #eee",
  };
  const productImage = { maxHeight: 420, objectFit: "contain", width: "100%" };
  const titleStyle = { fontSize: 34, fontWeight: 700, margin: "6px 0 12px", color: "#111", lineHeight: 1.05 };
  const priceStyle = { fontSize: 28, fontWeight: 700, margin: "6px 0", color: "#111" };
  const inStockStyle = { color: "#16a34a", fontWeight: 600, marginBottom: 12 };
  const shortDescStyle = { fontSize: 14, color: "#444", marginBottom: 16 };
  const qtyStyle = { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 };

  // Related grid styles
  const relatedSection = { marginTop: 46 };
  const relatedGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, max-content))", justifyContent:"left", gap:20 };
  const card = { background: "#fff", borderRadius: 8, padding: "12px", border: "1px solid #e6e6e6", boxShadow: "0 4px 10px rgba(0,0,0,0.03)", textDecoration: "none", color: "inherit" , maxWidth:"220px", boxSizing : "border-box", };
  const cardImageWrap = { height: 110, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, background: "#fafafa", borderRadius: 6, overflow: "hidden" };
  const cardImage = { maxHeight: "100%", maxWidth: "100%", objectFit: "contain" };
  const cardTitle = { fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 6, minHeight: 40 };
  const cardPrice = { fontSize: 14, color: "#444" };

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {/* Left: Image */}
        <div style={imageBox}>
          <img
            src={product.image || product.thumbnail || "/laptop.png"}
            alt={title}
            style={productImage}
            onError={(e) => (e.target.src = "/laptop.png")}
          />
        </div>

        {/* Right: Details */}
        <div>
          <h1 style={titleStyle}>{title}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Stars value={product?.rating?.rate ?? product?.rating ?? 0} size={18} />
            <div style={{ fontSize: 14, color: "#666" }}>
              {(product?.rating?.rate ?? product?.rating ?? 0).toFixed(1)} (
              {product?.rating?.count ?? product?.reviewsCount ?? 0} Reviews)
            </div>
          </div>

          <div style={priceStyle}>${price}</div>

          {product.in_stock ? (
            <div style={inStockStyle}>In stock</div>
          ) : (
            <div style={{ color: "#dc2626", fontWeight: 600 }}>Out of stock</div>
          )}

          <p style={shortDescStyle}>{(product.short_description || description || "").slice(0, 250)}</p>

          <div style={qtyStyle}>
            <label style={{ fontSize: 14, color: "#333" }}>
              Qty
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ marginLeft: 8, width: 60, padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd" }}
              />
            </label>

            <button
              disabled={!product.in_stock}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                cursor: product.in_stock ? "pointer" : "not-allowed",
                background: product.in_stock ? "#fbbf24" : "#e5e7eb",
                fontWeight: 700,
              }}
            >
              Add to Cart
            </button>
          </div>

          {/* Review form */}
          {userHasBoughtThisProduct && !userHasLeftReview && (
            <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Leave your feedback</div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={product.image || "/laptop.png"}
                  alt="thumb"
                  style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }}
                  onError={(e) => (e.target.src = "/laptop.png")}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <StarsInput value={rating} onChange={setRating} />
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                    style={{ padding: "8px 12px", background: "#2563eb", color: "#fff", borderRadius: 6, border: "none" }}
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a short review (optional)"
                style={{ width: "100%", marginTop: 10, minHeight: 80, padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
              />
            </div>
          )}

          {userHasLeftReview && (
            <div style={{ marginTop: 12, color: "#064e3b", fontWeight: 600 }}>
              Thanks — your review was recorded.
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Description</h2>
        <div style={{ color: "#444", fontSize: 14, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: description }} />
      </section>

      {/* Related */}
      <section style={relatedSection}>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Related Products</h3>

        {related && related.length > 0 ? (
          <div style={relatedGrid}>
            {related.map((r) => (
              <Link to={`/products/${r.id}`} key={r.id} style={card}>
                <div style={cardImageWrap}>
                  <img src={r.image || r.thumbnail || "/laptop.png"} alt={r.name || r.title} style={cardImage} onError={(e) => (e.target.src = "/laptop.png")} />
                </div>
                <div style={cardTitle}>{r.title || r.name}</div>
                <div style={cardPrice}>${r.price ?? r.amount ?? 0}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ color: "#666", fontSize: 14 }}>No related products found.</div>
        )}
      </section>

      <div style={{ marginTop: 26 }}>
        <Link to="/products" style={{ color: "#2563eb", textDecoration: "underline" }}>← Back to products</Link>
      </div>

      {/* Success modal */}
      {showSuccessModal && (
        <div
          onClick={() => setShowSuccessModal(false)}
          style={{
            position: "fixed",
            left: 0, right: 0, top: 0, bottom: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, minWidth: 260, boxShadow: "0 10px 30px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>🎉</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>{successMessage}</div>
            <div style={{ marginTop: 8, color: "#666" }}>Your feedback was recorded.</div>
          </div>
        </div>
      )}
    </div>
  );
}
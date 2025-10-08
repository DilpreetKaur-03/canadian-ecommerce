// frontend/src/lib/api.js

// base server (vite env fallback to local django)
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// if your DRF endpoints are under /api
const API_PREFIX = "/api"; // keep if your backend is mounted on /api

// helper to build full URL like http://127.0.0.1:8000/api/products/
function fullUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  // ensure prefix present
  return `${API_BASE}${API_PREFIX}${path}`;
}

// ---------------- existing API helpers ----------------

// fetch products list
export async function fetchProducts() {
  const res = await fetch(fullUrl("/products/"));
  if (!res.ok) throw new Error("Failed to fetch products: " + res.status);
  return res.json();
}

// fetch single product by id
export async function fetchProduct(id) {
  const res = await fetch(fullUrl(`/products/${id}/`));
  if (!res.ok) throw new Error("Failed to fetch product: " + res.status);
  return res.json();
}

// create order example (same pattern)
export async function createOrder(payload) {
  const res = await fetch(fullUrl("/checkout/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Order failed: " + res.status);
  return res.json();
}

// ---------------- new: submit review helper ----------------
// Usage from React:
// import { submitReview } from "../lib/api";
// await submitReview(productId, rating, text);
export async function submitReview(productId, rating, text) {
  if (!productId) throw new Error("productId required");
  const url = fullUrl(`/products/${productId}/reviews/`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // if your backend needs auth token add it here:
      // "Authorization": `Token ${token}`
    },
    body: JSON.stringify({
      rating,
      text,
    }),
  });

  if (!res.ok) {
    // Read response body for better debug message if available
    let body = "";
    try { body = await res.text(); } catch (e) {}
    throw new Error("Failed to submit review: " + res.status + " " + body);
  }

  return res.json();
}
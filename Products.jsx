// src/pages/Products.jsx
import React, { useEffect, useState } from "react";
import { fetchProducts } from "../lib/api"; // correct named import
import ProductCard from "../components/ProductCard"; // make sure file exists (not required by this file)
import { Link, useNavigate } from "react-router-dom";  // ⬅️ added useNavigate
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";

export default function Products() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate(); // ⬅️ initialize navigate

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (data.results) setProducts(data.results);
        else setProducts([]);
      })
      .catch((err) => {
        console.error("fetchProducts error:", err);
        // fallback demo data
        setProducts([
          { id: 1, title: "Laptop", price: 999, image: "/laptop.png" },
          { id: 2, title: "Wireless Headphones", price: 199, image: "/headphones.png" },
          { id: 3, title: "4K TV", price: 799, image: "/tv.png" },
        ]);
      });
  }, []);

  // 🔄 updated handleAddToCart with redirect
  function handleAddToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ ...product, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));

    // navigate directly to /cart after adding
    navigate("/cart");
  }

  // Inline styles (all in this file as requested)
  const pageStyle = {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "28px 20px",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    color: "#111827",
  };

  const headingStyle = {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "700",
    marginBottom: 18,
    letterSpacing: "-0.02em",
  };

  // grid: responsive, auto-fit ensures cards wrap; minmax controls min card size
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    alignItems: "stretch",
  };

  // Card style: border included (so border-box), subtle shadow, rounded
  const cardStyle = {
    border: "1px solid #e6e6e6", // visible subtle border
    boxSizing: "border-box", // include border in width calculations
    borderRadius: 12,
    background: "#ffffff",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 260,
    transition: "transform .12s ease, box-shadow .12s ease",
  };

  const cardHover = {
    transform: "translateY(-6px)",
    boxShadow: "0 8px 24px rgba(16,24,40,0.08)",
  };

  const imageWrap = {
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafafa",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  };

  const imageStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 600,
    margin: "6px 0 6px",
    color: "#111827",
  };

  const priceStyle = {
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 10,
  };

  const actionsWrap = {
    display: "flex",
    gap: 10,
    marginTop: 10,
    alignItems: "center",
  };

  const viewBtn = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    textDecoration: "none",
    color: "#111827",
    fontWeight: 600,
  };

  const cartBtn = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#0a3d62",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  };

  // Small helper to apply hover effect with inline style
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <div style={pageStyle}>
      <h1 style={headingStyle}>Products</h1>

      <div style={gridStyle}>
        {products.map((p, idx) => (
          <div
            key={p.id}
            style={{
              ...cardStyle,
              ...(hoverIndex === idx ? cardHover : {}),
            }}
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div>
              <div style={imageWrap}>
                <img
                  src={p.image || p.thumbnail || "/laptop.png"}
                  alt={p.title || p.name}
                  style={imageStyle}
                  onError={(e) => (e.target.src = "/laptop.png")}
                />
              </div>

              <div style={{ textAlign: "left" }}>
                <h3 style={titleStyle}>{p.title || p.name}</h3>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  {/* optional short description could go here */}
                </p>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={priceStyle}>${p.price}</div>

              <div
                style={{
                  borderTop: "1px dashed #f3f4f6",
                  paddingTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <Link to={`/products/${p.id}`} style={viewBtn}>
                  View
                </Link>

                <button onClick={() => handleAddToCart(p)} style={cartBtn}>
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
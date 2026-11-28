
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/admin/actions";

export default function AdminProductForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = event.currentTarget;

    const result = await createProduct({
      name: form.name.value,
      slug: form.slug.value,
      description: form.description.value,
      price: form.price.value,
      compare_at_price: form.compare_at_price.value,
      currency: form.currency.value,
      status: form.status.value,
      is_featured: form.is_featured.checked,
    });

    setLoading(false);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    setMessage("Product created successfully.");

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      <label>
        Product name
        <input name="name" required />
      </label>

      <label>
        Product slug
        <input
          name="slug"
          placeholder="mini-desk-lamp"
          required
        />
      </label>

      <label>
        Description
        <textarea name="description" rows="4" />
      </label>

      <label>
        Selling price
        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          required
        />
      </label>

      <label>
        Compare-at price (optional)
        <input
          name="compare_at_price"
          type="number"
          min="0.01"
          step="0.01"
        />
      </label>

      <label>
        Currency
        <select name="currency" defaultValue="AED">
          <option value="AED">AED</option>
          <option value="USD">USD</option>
        </select>
      </label>

      <label>
        Publication status
        <select name="status" defaultValue="draft">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      <label>
        <input
          name="is_featured"
          type="checkbox"
        />
        Featured product
      </label>

      <button
        className="button primary"
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving..." : "Create product"}
      </button>

      {message && (
        <p role="status" className="muted">
          {message}
        </p>
      )}
    </form>
  );
}

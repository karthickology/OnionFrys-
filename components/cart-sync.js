
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  readCart,
  writeCart,
  cartEventName,
} from "@/lib/cart-storage";

export default function CartSync() {
  useEffect(() => {
    const supabase = createClient();

    if (!supabase) return;

    let active = true;
    let syncing = false;
    let currentUserId = null;

    function mergeCarts(localItems, remoteItems) {
      const merged = new Map();

      [...remoteItems, ...localItems].forEach((item) => {
        const existing = merged.get(item.variantId);

        if (!existing) {
          merged.set(item.variantId, { ...item });
          return;
        }

        merged.set(item.variantId, {
          ...existing,
          ...item,
          quantity: Math.min(
            Math.max(
              Number(existing.quantity || 1),
              Number(item.quantity || 1)
            ),
            Number(item.stock || existing.stock || 999)
          ),
        });
      });

      return Array.from(merged.values());
    }

    async function saveCart(user) {
      if (!user || syncing || !active) return;

      const items = readCart();

      const subtotal = items.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 1),
        0
      );

      const { error } = await supabase
        .from("customer_carts")
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            items,
            currency: items[0]?.currency || "USD",
            subtotal,
            status: "active",
            last_activity_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Cart sync failed:", error.message);
      }
    }

    async function syncUser(user) {
      if (!user || !active) return;

      syncing = true;
      currentUserId = user.id;

      const { data, error } = await supabase
        .from("customer_carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Cart retrieval failed:", error.message);
        syncing = false;
        return;
      }

      if (!active) {
        syncing = false;
        return;
      }

      const remoteItems = Array.isArray(data?.items)
        ? data.items
        : [];

      const mergedItems = mergeCarts(
        readCart(),
        remoteItems
      );

      writeCart(mergedItems);

      await saveCart(user);

      syncing = false;
    }

    let currentUser = null;

    const cartHandler = () => {
      if (currentUser && !syncing) {
        saveCart(currentUser);
      }
    };

    window.addEventListener(cartEventName(), cartHandler);

    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Authentication check failed:", error.message);
        return;
      }

      if (data.user && active) {
        currentUser = data.user;
        syncUser(data.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;

      currentUser = user;

      if (!user) {
        currentUserId = null;
        return;
      }

      if (user.id !== currentUserId) {
        syncUser(user);
      }
    });

    return () => {
      active = false;
      window.removeEventListener(cartEventName(), cartHandler);
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

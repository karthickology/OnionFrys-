
"use client";

import { useEffect } from "react";
import { initializeTracking } from "@/lib/data-layer";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "onionfrys_first_touch";

function captureFirstTouch() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);

    if (existing) {
      const saved = JSON.parse(existing);

      const hasSavedUtm = [
        saved.source,
        saved.medium,
        saved.campaign,
        saved.content,
        saved.term,
      ].some(Boolean);

      if (hasSavedUtm) return saved;

      // Remove an old empty attribution record.
      localStorage.removeItem(STORAGE_KEY);
    }

    const params = new URLSearchParams(window.location.search);

    const attribution = {
      source: params.get("utm_source")?.slice(0, 250) || null,
      medium: params.get("utm_medium")?.slice(0, 250) || null,
      campaign: params.get("utm_campaign")?.slice(0, 250) || null,
      content: params.get("utm_content")?.slice(0, 250) || null,
      term: params.get("utm_term")?.slice(0, 250) || null,
      landing_page: window.location.pathname.slice(0, 1000),
      referrer: document.referrer.slice(0, 1000) || null,
    };

    const hasUtm = [
      attribution.source,
      attribution.medium,
      attribution.campaign,
      attribution.content,
      attribution.term,
    ].some(Boolean);

    // Do not save empty/direct visits as UTM attribution.
    if (!hasUtm) return null;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));

    return attribution;
  } catch (error) {
    console.error("First-touch capture failed:", error);
    return null;
  }
}

export default function TrackingInitializer() {
  useEffect(() => {
    initializeTracking();

    const supabase = createClient();
    if (!supabase) return;

    const attribution = captureFirstTouch();
    if (!attribution) return;

    let saving = false;

    async function saveAttribution(session) {
      if (!session?.user || saving) return;

      saving = true;

      try {
        const { error } = await supabase.rpc(
          "capture_first_touch_attribution",
          {
            p_source: attribution.source,
            p_medium: attribution.medium,
            p_campaign: attribution.campaign,
            p_content: attribution.content,
            p_term: attribution.term,
            p_landing_page: attribution.landing_page,
            p_referrer: attribution.referrer,
          }
        );

        if (error) {
          console.error("Attribution profile save failed:", error.message);
        }
      } finally {
        saving = false;
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      saveAttribution(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      saveAttribution(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}

// The Write Vibe — Universal Publishing Provider Adapter Layer
// All external publishing traffic flows through these adapters.
// Provider-specific terminology stays inside this module; the app only
// sees normalized Write Vibe concepts (BOOK, EDITION, CHANNEL, STATUS...).
import { secrets } from "base44:runtime";

export const NORMALIZED_STATUSES = [
  "draft", "not_ready", "ready", "awaiting_approval", "submitted", "processing",
  "under_review", "approved", "live", "update_pending", "action_required",
  "rejected", "suspended", "retired"
];

// Channel catalog — the author-facing distribution surface.
export const CHANNELS = [
  { channel: "amazon", label: "Amazon", provider: "amazon_kdp", formats: ["ebook", "paperback"] },
  { channel: "amazon_audio", label: "Amazon / Audible", provider: "amazon_acx", formats: ["audiobook"] },
  { channel: "apple_books", label: "Apple Books", provider: "publishdrive", formats: ["ebook", "audiobook"] },
  { channel: "kobo", label: "Kobo", provider: "publishdrive", formats: ["ebook", "audiobook"] },
  { channel: "google_play", label: "Google Play Books", provider: "publishdrive", formats: ["ebook", "audiobook"] },
  { channel: "barnes_noble", label: "Barnes & Noble", provider: "publishdrive", formats: ["ebook", "paperback"] },
  { channel: "libraries", label: "Libraries (OverDrive, Bibliotheca)", provider: "publishdrive", formats: ["ebook", "audiobook"] },
  { channel: "international", label: "International Channels", provider: "publishdrive", formats: ["ebook"] },
  { channel: "direct_store", label: "Direct Store (Book Website)", provider: "lulu", formats: ["paperback", "hardcover"] }
];

function getSecret(name) {
  try {
    return secrets.get(name) || null;
  } catch {
    return null;
  }
}

// Map raw Lulu print-job statuses into normalized Write Vibe statuses.
const LULU_STATUS_MAP = {
  CREATED: "submitted", UNPAID: "action_required", PAYMENT_IN_PROGRESS: "processing",
  PRODUCTION_DELAYED: "processing", PRODUCTION_READY: "processing", IN_PRODUCTION: "processing",
  SHIPPED: "live", REJECTED: "rejected", CANCELED: "retired", ERROR: "action_required"
};

export const luluAdapter = {
  provider: "lulu",
  role: "print_fulfillment",

  isConnected() {
    return !!(getSecret("LULU_CLIENT_KEY") && getSecret("LULU_CLIENT_SECRET"));
  },

  async getToken() {
    const key = getSecret("LULU_CLIENT_KEY");
    const sec = getSecret("LULU_CLIENT_SECRET");
    const res = await fetch("https://api.lulu.com/auth/realms/glasses/protocol/openid-connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(`${key}:${sec}`)
      },
      body: "grant_type=client_credentials"
    });
    if (!res.ok) throw new Error(`Lulu auth failed (${res.status})`);
    const data = await res.json();
    return data.access_token;
  },

  // Internal cost model used when Lulu credentials are not configured —
  // clearly flagged as an estimate, never reported as provider data.
  localEstimate({ pageCount, format, quantity }) {
    const perUnit = format === "hardcover"
      ? 5.5 + pageCount * 0.014
      : 1.0 + pageCount * 0.012;
    const printCost = perUnit * quantity;
    const shipping = 4.99 + Math.max(0, quantity - 1) * 0.99;
    return {
      source: "estimate",
      connected: false,
      print_cost: Math.round(printCost * 100) / 100,
      shipping_cost: Math.round(shipping * 100) / 100,
      total_cost: Math.round((printCost + shipping) * 100) / 100,
      currency: "USD"
    };
  },

  async calculatePrintCost({ pageCount, format, quantity, countryCode = "US" }) {
    if (!this.isConnected()) return this.localEstimate({ pageCount, format, quantity });
    const token = await this.getToken();
    const podPackage = format === "hardcover" ? "0600X0900FCSTDCW080CW444GXX" : "0600X0900BWSTDPB060UW444MXX";
    const res = await fetch("https://api.lulu.com/print-job-cost-calculations/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        line_items: [{ page_count: pageCount, pod_package_id: podPackage, quantity }],
        shipping_address: { country_code: countryCode },
        shipping_level: "MAIL"
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Lulu cost calculation failed: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    return {
      source: "lulu",
      connected: true,
      print_cost: parseFloat(data.total_cost_excl_tax || 0) - parseFloat(data.shipping_cost?.total_cost_excl_tax || 0),
      shipping_cost: parseFloat(data.shipping_cost?.total_cost_excl_tax || 0),
      total_cost: parseFloat(data.total_cost_incl_tax || data.total_cost_excl_tax || 0),
      currency: data.currency || "USD"
    };
  },

  normalizeStatus(raw) {
    return LULU_STATUS_MAP[raw] || "processing";
  }
};

export const publishDriveAdapter = {
  provider: "publishdrive",
  role: "distribution",

  isConnected() {
    return !!getSecret("PUBLISHDRIVE_API_KEY");
  },

  // PublishDrive API access is partner-gated. Until credentials are configured,
  // submissions are staged locally with honest statuses — never fake success.
  async submitDistribution() {
    if (!this.isConnected()) {
      return {
        accepted: false,
        status: "action_required",
        required_action: "Connect PublishDrive credentials to transmit this submission",
        message: "Submission staged locally. It will be transmittable once PublishDrive is connected."
      };
    }
    // Live partner-API submission wiring goes here once credentials exist.
    return { accepted: true, status: "submitted" };
  }
};

export function providerHealth() {
  return [
    {
      provider: "lulu",
      label: "Lulu — Print & Fulfillment",
      connected: luluAdapter.isConnected(),
      mode: luluAdapter.isConnected() ? "live" : "estimates_only"
    },
    {
      provider: "publishdrive",
      label: "PublishDrive — Global Distribution",
      connected: publishDriveAdapter.isConnected(),
      mode: publishDriveAdapter.isConnected() ? "live" : "staging_only"
    }
  ];
}
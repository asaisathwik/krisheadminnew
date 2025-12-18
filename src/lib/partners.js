"use client";

/**
 * Fetch list of partners from an external API if configured.
 * Expected environment variable:
 * - NEXT_PUBLIC_PARTNERS_API_URL: points to an HTTP endpoint returning an array of partners
 *
 * The endpoint can return objects with various phone field names; we normalize them.
 * Returns: [{ id, name, phone }]
 */
export async function fetchPartners() {
  const apiUrl = process.env.NEXT_PUBLIC_PARTNERS_API_URL;
  if (!apiUrl) {
    return { ok: false, partners: [], error: "API URL not configured" };
  }

  try {
    const res = await fetch(apiUrl, { method: "GET" });
    if (!res.ok) {
      return { ok: false, partners: [], error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    const partners = arr.map((p, idx) => {
      const id = String(p.id ?? p.uid ?? p._id ?? idx);
      const name = String(p.name ?? p.fullName ?? p.displayName ?? id);
      const phone = String(
        p.phone ??
        p.mobile ??
        p.phoneNumber ??
        p.contactNumber ??
        p.contact ??
        ""
      );
      return { id, name, phone };
    });
    return { ok: true, partners };
  } catch (e) {
    return { ok: false, partners: [], error: String(e?.message || e) };
  }
}



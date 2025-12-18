"use client";

import { getDb } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

/**
 * Fetch organizations from Firestore.
 * Env:
 * - NEXT_PUBLIC_FIREBASE_ORG_COLLECTION (optional) default: "organizations"
 * Supports nested paths like "landing/primary/organizations" (split on '/').
 * Normalizes to: { id, name, phone }
 *
 * Special handling when the target collection is a user list (e.g., "users"):
 * - Will derive a distinct set of organization names from each user document's "organization" field.
 * - For each unique organization, returns a single entry with name = organization. Phone is taken from
 *   the first user record that contains a phone-like field, if present; otherwise left blank.
 */
export async function fetchOrganizations() {
  try {
    const db = getDb();
    const path = (process.env.NEXT_PUBLIC_FIREBASE_ORG_COLLECTION || "organizations")
      .split("/")
      .filter(Boolean);
    if (path.length === 0) path.push("organizations");
    const colRef = collection(db, ...path);
    const snap = await getDocs(colRef);
    const docs = [];
    snap.forEach((doc) => { docs.push({ id: doc.id, data: doc.data() || {} }); });

    // If documents have an "organization" field, derive distinct organizations from it.
    const orgSet = new Map(); // key: orgName, value: { id, name, phone }
    for (const { id: docId, data: d } of docs) {
      const orgNameRaw = d.organization ?? d.org ?? null;
      if (orgNameRaw && typeof orgNameRaw === "string") {
        const orgName = orgNameRaw.trim();
        if (orgName) {
          if (!orgSet.has(orgName)) {
            const phone = String(
              d.phone ??
              d.mobile ??
              d.phoneNumber ??
              d.contactNumber ??
              d.contact ??
              ""
            );
            orgSet.set(orgName, { id: orgName, name: orgName, phone });
          }
        }
      }
    }
    if (orgSet.size > 0) {
      return { ok: true, organizations: Array.from(orgSet.values()) };
    }

    // Fallback: Treat the collection as an organizations collection with "name"-like fields
    const list = docs.map(({ id: docId, data: d }) => {
      const id = String(docId);
      const name = String(d.name ?? d.organization ?? d.orgName ?? id);
      const phone = String(
        d.phone ??
        d.mobile ??
        d.phoneNumber ??
        d.contactNumber ??
        d.contact ??
        ""
      );
      return { id, name, phone };
    });
    return { ok: true, organizations: list };
  } catch (e) {
    return { ok: false, organizations: [], error: String(e?.message || e) };
  }
}



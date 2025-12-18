"use client";

/**
 * Lightweight loader for Firebase compat builds without adding npm deps.
 * This only runs on the client and injects <script> tags for compat SDKs.
 */
export async function loadFirebaseCompat() {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  if (window.firebase?.apps?.length >= 0) return { ok: true };

  const scripts = [
    "https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore-compat.js",
  ];

  for (const src of scripts) {
    const loaded = Array.from(document.scripts).some((s) => s.src === src);
    if (loaded) continue;
    await new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(el);
    });
  }
  return { ok: true };
}

/**
 * Initialize Firebase app (compat) if not already initialized.
 */
export function ensureFirebaseApp(config) {
  if (typeof window === "undefined") return { ok: false, error: "Not in browser" };
  if (!window.firebase) return { ok: false, error: "Firebase SDK not loaded" };
  const apps = window.firebase.apps || [];
  if (apps.length === 0) {
    window.firebase.initializeApp(config);
  }
  return { ok: true, app: window.firebase.app() };
}

/**
 * Fetch unique organization names from a Firestore collection and field.
 * Defaults:
 * - collection: "users"
 * - field: "organization"
 *
 * Returns array of strings.
 */
export async function fetchOrganizationsFromFirestore({
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  collection = "users",
  field = "organization",
}) {
  const { ok, error } = await loadFirebaseCompat();
  if (!ok) return { ok: false, organizations: [], error };

  const init = ensureFirebaseApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  });
  if (!init.ok) return { ok: false, organizations: [], error: init.error };

  try {
    const db = window.firebase.firestore();
    const snap = await db.collection(collection).get();
    const set = new Set();
    snap.forEach((doc) => {
      const val = doc.get(field);
      if (val && typeof val === "string") set.add(val);
      if (Array.isArray(val)) val.forEach((v) => { if (v && typeof v === "string") set.add(v); });
    });
    return { ok: true, organizations: Array.from(set) };
  } catch (e) {
    return { ok: false, organizations: [], error: String(e?.message || e) };
  }
}



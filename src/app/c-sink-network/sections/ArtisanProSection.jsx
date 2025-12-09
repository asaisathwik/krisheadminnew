"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

export default function ArtisanProSection() {
  const columns = ["ID", "Name", "Klins", "GPS", ""];
  const headerSpanClasses = ["col-span-2", "col-span-3", "col-span-4", "col-span-2", "col-span-1"]; // must sum to 12

  const [artisanPros, setArtisanPros] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    klins: [],
    gps: "",
    productionPerYear: "",
    block: "",
    district: "",
    state: "",
  });
  const [klinInput, setKlinInput] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("csink:artisan-pros") || "[]");
      if (Array.isArray(saved)) setArtisanPros(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("csink:artisan-pros", JSON.stringify(artisanPros));
    } catch {}
  }, [artisanPros]);

  function resetForm() {
    setForm({
      id: "",
      name: "",
      klins: [],
      gps: "",
      productionPerYear: "",
      block: "",
      district: "",
      state: "",
    });
    setKlinInput("");
  }

  function openAddModal() {
    resetForm();
    setEditing(null);
    setOpenAdd(true);
  }

  function submitForm() {
    if (!form.id || !form.name) return;
    if (editing) {
      setArtisanPros((prev) => prev.map((p) => (p.id === editing ? { ...form } : p)));
    } else {
      if (artisanPros.some((p) => p.id === form.id)) return;
      setArtisanPros((prev) => [...prev, { ...form }]);
    }
    setOpenAdd(false);
    setEditing(null);
  }

  function onEdit(id) {
    const found = artisanPros.find((p) => p.id === id);
    if (!found) return;
    setForm({ ...found });
    setEditing(id);
    setOpenAdd(true);
  }

  function onDelete(id) {
    setArtisanPros((prev) => prev.filter((p) => p.id !== id));
    if (menuOpenId === id) setMenuOpenId(null);
  }

  function onView(id) {
    setOpenView(id);
    if (menuOpenId === id) setMenuOpenId(null);
  }

  // Close any open menus when clicking outside
  useEffect(() => {
    function onDocClick() {
      setMenuOpenId(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function addKlin() {
    const value = (klinInput || "").trim();
    if (!value) return;
    setForm((f) => ({ ...f, klins: [...(f.klins || []), value] }));
    setKlinInput("");
  }

  function removeKlin(idx) {
    setForm((f) => ({ ...f, klins: f.klins.filter((_, i) => i !== idx) }));
  }

  return (
    <>
      <details className="group rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md" open>
        <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-slate-900">Artisan Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openAddModal();
              }}
              className="inline-flex items-center bg-black text-white rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium"
            >
              + Add record
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 flex-shrink-0 text-slate-500 transition-transform group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </summary>

        <div className="border-t border-slate-200 px-4 pb-4 pt-3 md:px-5 md:pb-5">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="hidden grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 sm:grid">
              {columns.map((c, i) => (
                <div key={i} className={`${headerSpanClasses[i]} ${i === columns.length - 1 ? "text-right" : ""}`}>{c}</div>
              ))}
            </div>

            <ul className="divide-y divide-slate-100 text-sm">
              {artisanPros.map((row) => (
                <li key={row.id} className="px-4 py-3 bg-white/60 hover:bg-slate-50 transition-colors">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center text-slate-700">
                    <div className="sm:col-span-2">{row.id}</div>
                    <div className="sm:col-span-3">{row.name}</div>
                    <div className="sm:col-span-4">{(row.klins || []).join(", ") || "-"}</div>
                    <div className="sm:col-span-2">{row.gps || "-"}</div>
                    <div className="sm:col-span-1 sm:text-right">
                      <div className="relative inline-block text-left z-10">
                        <button
                          aria-label="Actions"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === row.id ? null : row.id); }}
                          className="rounded p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-black/20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                            <circle cx="5" cy="12" r="1.6"></circle>
                            <circle cx="12" cy="12" r="1.6"></circle>
                            <circle cx="19" cy="12" r="1.6"></circle>
                          </svg>
                        </button>
                        {menuOpenId === row.id ? (
                          <div onClick={(e)=>e.stopPropagation()} className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-lg">
                            <button onClick={() => onView(row.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View
                            </button>
                            <button onClick={() => onEdit(row.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => onDelete(row.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-slate-50">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {artisanPros.length === 0 ? (
                <li className="px-4 py-6 text-center text-xs text-slate-500">No records yet. Click “Add record” to create one.</li>
              ) : null}
            </ul>
          </div>
        </div>
      </details>

      {/* Add / Edit Modal */}
      <Modal
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setEditing(null);
        }}
        title={editing ? "Edit Artisan Pro" : "Add Artisan Pro"}
        footer={
          <>
            <button onClick={() => { setOpenAdd(false); setEditing(null); }} className="rounded-md border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={submitForm} disabled={!form.id || !form.name} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">
              {editing ? "Save" : "Create"}
            </button>
          </>
        }
      >
        <form className="grid gap-5">
          <section className="rounded-lg border border-slate-200 p-4 sm:p-5 bg-white">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Identity</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Artisan Pro ID</label>
                <input value={form.id} onChange={(e)=>setForm((f)=>({...f, id:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Unique ID" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Artisan Pro Name</label>
                <input value={form.name} onChange={(e)=>setForm((f)=>({...f, name:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Full name / Firm name" />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-4 sm:p-5 bg-white">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Production & Location</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">GPS Coordinates</label>
                <input value={form.gps} onChange={(e)=>setForm((f)=>({...f, gps:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="e.g., 17.3850, 78.4867" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Estimated Production per year</label>
                <input value={form.productionPerYear} onChange={(e)=>setForm((f)=>({...f, productionPerYear:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="e.g., 10 tons" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Block</label>
                <input value={form.block} onChange={(e)=>setForm((f)=>({...f, block:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Block" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">District</label>
                <input value={form.district} onChange={(e)=>setForm((f)=>({...f, district:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="District" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">State</label>
                <input value={form.state} onChange={(e)=>setForm((f)=>({...f, state:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="State" />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-4 sm:p-5 bg-white">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Klins under Artisan Pro</h4>
            <div className="flex items-center gap-2">
              <input
                value={klinInput}
                onChange={(e)=>setKlinInput(e.target.value)}
                onKeyDown={(e)=>{ if(e.key === "Enter"){ e.preventDefault(); addKlin(); }}}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none"
                placeholder="Enter klin name/id and press Add"
              />
              <button type="button" onClick={addKlin} className="rounded-md bg-black px-3 py-2 text-xs font-medium text-white hover:bg-gray-900">Add</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(form.klins || []).map((k, i) => (
                <span key={i} className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs">
                  {k}
                  <button type="button" onClick={()=>removeKlin(i)} aria-label="Remove" className="text-gray-500 hover:text-black">✕</button>
                </span>
              ))}
            </div>
          </section>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!openView} onClose={() => setOpenView(null)} title="Artisan Pro Details">
        {(() => {
          const data = artisanPros.find((p) => p.id === openView);
          if (!data) return <p className="text-sm text-gray-600">Record not found.</p>;
          return (
            <div className="grid gap-3 text-sm text-gray-800 sm:grid-cols-2">
              <div>
                <span className="text-gray-500">ID:</span> <span className="ml-1 font-medium">{data.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Name:</span> <span className="ml-1 font-medium">{data.name}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500">Klins:</span> <span className="ml-1 font-medium">{(data.klins || []).join(", ") || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">GPS:</span> <span className="ml-1 font-medium">{data.gps || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Production/year:</span>{" "}
                <span className="ml-1 font-medium">{data.productionPerYear || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Block:</span> <span className="ml-1 font-medium">{data.block || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">District:</span> <span className="ml-1 font-medium">{data.district || "-"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500">State:</span> <span className="ml-1 font-medium">{data.state || "-"}</span>
              </div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}



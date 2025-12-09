"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/Modal";

export default function FarmSection() {
  const columns = ["Name", "Phone", "Location", ""];
  const headerSpanClasses = ["col-span-5", "col-span-3", "col-span-3", "col-span-1"]; // sum to 12

  const [farms, setFarms] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    phone: "",
    projectSiteMode: "",
    lat: "",
    lng: "",
    searchQuery: "",
    mapsUrl: "",
    shapeFileName: "",
    shapeFileType: "",
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("csink:farms") || "[]");
      if (Array.isArray(saved)) setFarms(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("csink:farms", JSON.stringify(farms));
    } catch {}
  }, [farms]);

  useEffect(() => {
    function onDoc() { setMenuOpenId(null); }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function resetForm() {
    setForm({
      id: "",
      name: "",
      phone: "",
      projectSiteMode: "",
      lat: "",
      lng: "",
      searchQuery: "",
      mapsUrl: "",
      shapeFileName: "",
      shapeFileType: "",
    });
  }

  function openAddModal() { resetForm(); setEditing(null); setOpenAdd(true); }

  function submitForm() {
    if (!form.name) return;
    if (editing) {
      setFarms((prev) => prev.map((p) => (p.id === editing ? { ...form, id: editing } : p)));
    } else {
      const id = crypto?.randomUUID?.() || String(Date.now());
      setFarms((prev) => [...prev, { ...form, id }]);
    }
    setOpenAdd(false); setEditing(null);
  }

  function onEdit(id) {
    const found = farms.find((p) => p.id === id);
    if (!found) return;
    setForm({ ...found }); setEditing(id); setOpenAdd(true); setMenuOpenId(null);
  }

  function onDelete(id) { setFarms((prev) => prev.filter((p) => p.id !== id)); setMenuOpenId(null); }
  function onView(id) { setOpenView(id); setMenuOpenId(null); }

  function onUseCurrentLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setForm((f) => ({ ...f, lat: String(latitude), lng: String(longitude) }));
    });
  }

  function onFileChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setForm((f) => ({ ...f, shapeFileName: file.name, shapeFileType: file.type || "application/octet-stream" }));
  }

  function locationLabel(row) {
    if (row.projectSiteMode === "Use my current location" || row.projectSiteMode === "Input Coordinate") {
      const lat = row.lat ? Number(row.lat).toFixed(4) : "-";
      const lng = row.lng ? Number(row.lng).toFixed(4) : "-";
      return `${lat}, ${lng}`;
    }
    if (row.projectSiteMode === "Google maps URL") return "Maps URL";
    if (row.projectSiteMode === "Search location") return row.searchQuery || "-";
    if (row.projectSiteMode === "Set location") return "Pinned on map";
    return "-";
  }

  return (
    <>
      <details className="group rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md" open>
        <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-4">
          <span className="text-lg font-semibold text-slate-900">Farm</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={(e) => { e.preventDefault(); openAddModal(); }} className="inline-flex items-center bg-black text-white rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium">+ Add record</button>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
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
              {farms.map((row) => (
                <li key={row.id} className="px-4 py-3 bg-white/60 hover:bg-slate-50 transition-colors">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center text-slate-700">
                    <div className="sm:col-span-5">{row.name}</div>
                    <div className="sm:col-span-3">{row.phone || "-"}</div>
                    <div className="sm:col-span-3">{locationLabel(row)}</div>
                    <div className="sm:col-span-1 sm:text-right">
                      <div className="relative inline-block text-left z-10">
                        <button aria-label="Actions" onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === row.id ? null : row.id); }} className="rounded p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-black/20">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><circle cx="5" cy="12" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="19" cy="12" r="1.6"></circle></svg>
                        </button>
                        {menuOpenId === row.id ? (
                          <div onClick={(e)=>e.stopPropagation()} className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-lg">
                            <button onClick={() => onView(row.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></svg>View</button>
                            <button onClick={() => onEdit(row.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-slate-50"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>Edit</button>
                            <button onClick={() => onDelete(row.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-slate-50"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>Delete</button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {farms.length === 0 ? (
                <li className="px-4 py-6 text-center text-xs text-slate-500">No records yet. Click “Add record” to create one.</li>
              ) : null}
            </ul>
          </div>
        </div>
      </details>

      {/* Add / Edit Modal */}
      <Modal
        open={openAdd}
        onClose={() => { setOpenAdd(false); setEditing(null); }}
        title={editing ? "Edit Farm" : "Add Farm"}
        footer={<><button onClick={() => { setOpenAdd(false); setEditing(null); }} className="rounded-md border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button><button onClick={submitForm} disabled={!form.name} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">{editing ? "Save" : "Create"}</button></>}
      >
        <form className="grid gap-5">
          <section className="rounded-lg border border-slate-200 p-4 sm:p-5 bg-white">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Identity</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input value={form.name} onChange={(e)=>setForm((f)=>({...f, name:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Farm name / Owner name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
                <input value={form.phone} onChange={(e)=>setForm((f)=>({...f, phone:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="+91 9xxxxxxxxx" />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-4 sm:p-5 bg-white">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Location</h4>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Mode</label>
                <select value={form.projectSiteMode} onChange={(e)=>setForm((f)=>({...f, projectSiteMode:e.target.value}))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none">
                  <option value="">Select</option>
                  <option>Use my current location</option>
                  <option>Input Coordinate</option>
                  <option>Search location</option>
                  <option>Set location</option>
                  <option>Google maps URL</option>
                </select>
              </div>

              {form.projectSiteMode === "Use my current location" ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <button type="button" onClick={onUseCurrentLocation} className="rounded-md bg-black px-3 py-2 text-xs font-medium text-white hover:bg-gray-900 w-max">Fill current location</button>
                  <input value={form.lat} onChange={(e)=>setForm((f)=>({...f, lat:e.target.value}))} className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Latitude" />
                  <input value={form.lng} onChange={(e)=>setForm((f)=>({...f, lng:e.target.value}))} className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Longitude" />
                </div>
              ) : null}

              {form.projectSiteMode === "Input Coordinate" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={form.lat} onChange={(e)=>setForm((f)=>({...f, lat:e.target.value}))} className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Latitude" />
                  <input value={form.lng} onChange={(e)=>setForm((f)=>({...f, lng:e.target.value}))} className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Longitude" />
                </div>
              ) : null}

              {form.projectSiteMode === "Search location" ? (
                <input value={form.searchQuery} onChange={(e)=>setForm((f)=>({...f, searchQuery:e.target.value}))} className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="Search query" />
              ) : null}

              {form.projectSiteMode === "Set location" ? (
                <p className="text-xs text-slate-600">Map picker coming soon.</p>
              ) : null}

              {form.projectSiteMode === "Google maps URL" ? (
                <div className="grid gap-3">
                  <input value={form.mapsUrl} onChange={(e)=>setForm((f)=>({...f, mapsUrl:e.target.value}))} className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none" placeholder="https://maps.google.com/..." />
                  {form.mapsUrl ? (
                    <div className="rounded-md border border-slate-200 overflow-hidden">
                      <iframe title="Map Preview" src={form.mapsUrl} className="h-56 w-full" />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-4 sm:p-5 bg-white">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">Documents</h4>
            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Shape file</label>
                <input type="file" accept=".zip,.shp,application/zip" onChange={onFileChange} className="block w-full text-sm" />
                {form.shapeFileName ? <p className="mt-1 text-xs text-slate-600">Selected: {form.shapeFileName}</p> : null}
              </div>
            </div>
          </section>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!openView} onClose={() => setOpenView(null)} title="Farm Details">
        {(() => {
          const data = farms.find((p) => p.id === openView);
          if (!data) return <p className="text-sm text-gray-600">Record not found.</p>;
          return (
            <div className="grid gap-3 text-sm text-gray-800 sm:grid-cols-2">
              <div><span className="text-gray-500">Name:</span> <span className="ml-1 font-medium">{data.name}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="ml-1 font-medium">{data.phone || "-"}</span></div>
              <div className="sm:col-span-2"><span className="text-gray-500">Location:</span> <span className="ml-1 font-medium">{locationLabel(data)}</span></div>
              {data.mapsUrl ? (
                <div className="sm:col-span-2 rounded-md border border-slate-200 overflow-hidden">
                  <iframe title="Map" src={data.mapsUrl} className="h-56 w-full" />
                </div>
              ) : null}
              <div className="sm:col-span-2"><span className="text-gray-500">Shape file:</span> <span className="ml-1 font-medium">{data.shapeFileName || "-"}</span></div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}



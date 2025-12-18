"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { fetchPartners } from "@/lib/partners";
import { fetchOrganizations } from "@/lib/organizations";

export default function SupervisorSection() {
  const columns = ["Name", "Mobile", "Education", "Cluster", ""];
  const headerSpanClasses = ["col-span-4", "col-span-3", "col-span-2", "col-span-2", "col-span-1"]; // sum 12

  const [supervisors, setSupervisors] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const dropdownRef = useRef(null);

  const [partnerOptions, setPartnerOptions] = useState([]);
  useEffect(() => {
    if (!openAdd) return;
    let cancelled = false;
    (async () => {
      // 1) Try Firestore organizations
      const org = await fetchOrganizations();
      if (!cancelled && org.ok && org.organizations.length > 0) {
        setPartnerOptions(
          org.organizations.map((o) => ({
            value: `org:${o.id}`,
            label: o.name,
            id: o.id,
            name: o.name,
            phone: o.phone || "",
            type: "Organization",
          }))
        );
        return;
      }
      // 2) Try external partners API
      const external = await fetchPartners();
      if (!cancelled && external.ok && external.partners.length > 0) {
        setPartnerOptions(
          external.partners.map((p) => ({
            value: `ext:${p.id}`,
            label: `${p.name}${p.phone ? ` (${p.phone})` : ""}`,
            id: p.id,
            name: p.name,
            phone: p.phone || "",
            type: "External",
          }))
        );
        return;
      }
      // 3) Fallback to local options (APs and Producers)
      let aps = []; let producers = [];
      try { aps = JSON.parse(localStorage.getItem("csink:artisan-pros") || "[]"); } catch {}
      try { producers = JSON.parse(localStorage.getItem("csink:biochar-producers") || "[]"); } catch {}
      const apOptions = (Array.isArray(aps) ? aps : []).map((a) => ({ value: `ap:${a.id}`, label: `AP: ${a.name || a.id}`, type: "AP", id: a.id, name: a.name || a.id, phone: "" }));
      const prodOptions = (Array.isArray(producers) ? producers : []).map((p) => ({ value: `prod:${p.id}`, label: `${p.designation || "Producer"}: ${p.name || p.id}`, type: p.designation || "Producer", id: p.id, name: p.name || p.id, phone: p.phone || "" }));
      if (!cancelled) setPartnerOptions([...apOptions, ...prodOptions]);
    })();
    return () => { cancelled = true; };
  }, [openAdd]);

  const [form, setForm] = useState({
    id: "",
    name: "",
    phone: "",
    education: "",
    currentIncome: "",
    bikeAccess: "No",
    partnerId: "",
    partnerLabel: "",
    partnerNumber: "",
    cluster: "",
    trainingDate: "",
    agreementSigned: false,
    demoPictures: [], // array of { name, type }
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankName: "",
    panCardName: "",
    panCardType: "",
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("csink:supervisors") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        setSupervisors(saved);
      } else {
        const seed = [
          {
            id: "sup-1",
            name: "Mahesh Kumar",
            phone: "9000012345",
            education: "Graduate",
            currentIncome: "₹18,000",
            bikeAccess: "Yes",
            partnerId: "ap:AP-001",
            partnerLabel: "AP: Ravi Kumar",
            cluster: "Cluster A",
            trainingDate: "2025-01-05",
            agreementSigned: true,
            demoPictures: [],
            bankAccountName: "Mahesh Kumar",
            bankAccountNumber: "123456789012",
            bankIfsc: "HDFC0000001",
            bankName: "HDFC Bank",
            panCardName: "",
            panCardType: "",
          },
        ];
        setSupervisors(seed);
        localStorage.setItem("csink:supervisors", JSON.stringify(seed));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("csink:supervisors", JSON.stringify(supervisors));
    } catch {}
  }, [supervisors]);

  useEffect(() => {
    function onDoc(e) {
      if (!menuOpenId) return;
      const el = dropdownRef.current;
      if (el && !el.contains(e.target)) setMenuOpenId(null);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [menuOpenId]);

  function resetForm() {
    setForm({
      id: "",
      name: "",
      phone: "",
      education: "",
      currentIncome: "",
      bikeAccess: "No",
      partnerId: "",
      partnerLabel: "",
      cluster: "",
      trainingDate: "",
      agreementSigned: false,
      demoPictures: [],
      bankAccountName: "",
      bankAccountNumber: "",
      bankIfsc: "",
      bankName: "",
      panCardName: "",
      panCardType: "",
    });
  }

  function openAddModal() { resetForm(); setEditing(null); setOpenAdd(true); }

  function submitForm() {
    if (!form.name || !form.phone) return;
    if (editing) {
      setSupervisors((prev) => prev.map((s) => (s.id === editing ? { ...form, id: editing } : s)));
    } else {
      const id = crypto?.randomUUID?.() || String(Date.now());
      setSupervisors((prev) => [...prev, { ...form, id }]);
    }
    setOpenAdd(false); setEditing(null);
  }

  function onEdit(id) {
    const found = supervisors.find((s) => s.id === id);
    if (!found) return;
    setForm({ ...found }); setEditing(id); setOpenAdd(true); setMenuOpenId(null);
  }

  function onDelete(id) { setSupervisors((prev) => prev.filter((s) => s.id !== id)); setMenuOpenId(null); }
  function onView(id) { setOpenView(id); setMenuOpenId(null); }

  function onPartnerChange(e) {
    const value = e.target.value;
    const opt = partnerOptions.find((o) => o.value === value);
    setForm((f) => ({ ...f, partnerId: value, partnerLabel: opt?.label || "", partnerNumber: opt?.phone || "" }));
  }

  function onPanUpload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setForm((f) => ({ ...f, panCardName: file.name, panCardType: file.type || "application/octet-stream" }));
  }

  function onDemoPicturesUpload(e) {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({ name: f.name, type: f.type || "application/octet-stream" }));
    setForm((f) => ({ ...f, demoPictures: mapped }));
  }

  function UploadField({ label, accept, onChange, selectedName }) {
    return (
      <div>
        <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">{label}</label>
        <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white px-4 py-6 text-center cursor-pointer transition hover:border-black hover:shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          <span className="text-xs Smedium text-slate-900">{selectedName ? "Change file" : "Click to upload"}</span>
          <span className="text-[11px] text-slate-500">{selectedName ? selectedName : "or drag & drop"}</span>
          <input type="file" accept={accept} onChange={onChange} className="hidden" />
        </label>
      </div>
    );
  }

  function UploadMultiField({ label, accept, onChange, files }) {
    return (
      <div>
        <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">{label}</label>
        <label className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white px-4 py-6 text-center cursor-pointer transition hover:border-black hover:shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
          <span className="text-xs Smedium text-slate-900">{files && files.length > 0 ? "Change files" : "Click to upload"}</span>
          <span className="text-[11px] text-slate-500">{files && files.length > 0 ? `${files.length} file(s) selected` : "or drag & drop"}</span>
          <input multiple type="file" accept={accept} onChange={onChange} className="hidden" />
        </label>
        {files && files.length > 0 ? (
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {files.map((f, i) => (<li key={i} className="truncate">{f.name}</li>))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <details className="group rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md" open>
        <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-4">
          <span className="text-lg font-semibold text-slate-900">Supervisor</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={(e) => { e.preventDefault(); openAddModal(); }} className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-xs font-semibold shadow-sm ring-1 ring-black/10 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              Add record
            </button>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-slate-500 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </div>
        </summary>

        <div className="border-t border-slate-200 px-4 pb-4 pt-3 md:px-5 md:pb-5">
          <div className="overflow-visible rounded-lg border border-slate-200">
            <div className="hidden grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 sm:grid">
              {columns.map((c, i) => (
                <div key={i} className={`${headerSpanClasses[i]} ${i === columns.length - 1 ? "text-right" : ""}`}>{c}</div>
              ))}
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              {supervisors.map((row) => (
                <li key={row.id} className="px-4 py-3 bg-white/60 hover:bg-slate-50 transition-colors">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center text-slate-700">
                    <div className="sm:col-span-4">{row.name}</div>
                    <div className="sm:col-span-3">{row.phone}</div>
                    <div className="sm:col-span-2">{row.education || "-"}</div>
                    <div className="sm:col-span-2">{row.cluster || "-"}</div>
                    <div className="sm:col-span-1 sm:text-right">
                      <div className="relative inline-block text-left z-10" ref={menuOpenId === row.id ? dropdownRef : null}>
                        <button aria-label="Actions" onClick={(e)=>{ e.stopPropagation(); setMenuOpenId(menuOpenId === row.id ? null : row.id); }} className="rounded p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-black/20">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><circle cx="5" cy="12" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="19" cy="12" r="1.6"></circle></svg>
                        </button>
                        {menuOpenId === row.id ? (
                          <div onClick={(e)=>e.stopPropagation()} className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white shadow-lg shadow-black/5 overflow-hidden">
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
              {supervisors.length === 0 ? (
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
        title={editing ? "Edit Supervisor" : "Add Supervisor"}
        footer={<><button onClick={() => { setOpenAdd(false); setEditing(null); }} className="rounded-md border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button><button onClick={submitForm} disabled={!form.name || !form.phone} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed">{editing ? "Save" : "Create"}</button></>}
      >
        <form className="grid gap-5">
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-900 Sbold">Identity</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Name</label>
                <input value={form.name ?? ""} onChange={(e)=>setForm((f)=>({...f, name:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="Full name" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Mobile number</label>
                <input value={form.phone ?? ""} onChange={(e)=>setForm((f)=>({...f, phone:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="+91 9xxxxxxxxx" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Education</label>
                <input value={form.education ?? ""} onChange={(e)=>setForm((f)=>({...f, education:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="e.g., 10th, Graduate" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Current income</label>
                <input value={form.currentIncome ?? ""} onChange={(e)=>setForm((f)=>({...f, currentIncome:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="e.g., ₹18,000" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Bike access</label>
                <select value={form.bikeAccess ?? ""} onChange={(e)=>setForm((f)=>({...f, bikeAccess:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Partner name</label>
                <select value={form.partnerId ?? ""} onChange={onPartnerChange} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition">
                  <option value="">Pick from dropdown</option>
                  {partnerOptions.map((o)=>(
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Partner number</label>
                <input value={form.partnerNumber ?? ""} onChange={(e)=>setForm((f)=>({...f, partnerNumber:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="Auto-filled from partner" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Cluster assigned</label>
                <input value={form.cluster ?? ""} onChange={(e)=>setForm((f)=>({...f, cluster:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="Cluster name" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-900 Sbold">Training</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Biochar training date</label>
                <input type="date" value={form.trainingDate ?? ""} onChange={(e)=>setForm((f)=>({...f, trainingDate:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-slate-900">
                  <input type="checkbox" checked={!!form.agreementSigned} onChange={(e)=>setForm((f)=>({...f, agreementSigned:e.target.checked}))} className="h-4 w-4 rounded border-slate-300 text-black focus:ring-black" />
                  Agreement signed
                </label>
              </div>
              <div className="sm:col-span-2">
                <UploadMultiField label="Pictures of demo (images)" accept="image/*" onChange={onDemoPicturesUpload} files={form.demoPictures} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-900 Sbold">KYC</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Account holder name</label>
                <input value={form.bankAccountName ?? ""} onChange={(e)=>setForm((f)=>({...f, bankAccountName:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="As per bank records" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Account number</label>
                <input value={form.bankAccountNumber ?? ""} onChange={(e)=>setForm((f)=>({...f, bankAccountNumber:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="Bank account number" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">IFSC</label>
                <input value={form.bankIfsc ?? ""} onChange={(e)=>setForm((f)=>({...f, bankIfsc:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="e.g., HDFC0000001" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wide text-slate-600 Smedium">Bank name</label>
                <input value={form.bankName ?? ""} onChange={(e)=>setForm((f)=>({...f, bankName:e.target.value}))} className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:ring-2 focus:ring-black focus:border-black outline-none transition" placeholder="Branch / Bank" />
              </div>
              <div className="sm:col-span-2">
                <UploadField label="PAN Card (PDF/Image)" accept="application/pdf,image/*" onChange={onPanUpload} selectedName={form.panCardName} />
              </div>
            </div>
          </section>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!openView} onClose={() => setOpenView(null)} title="Supervisor Details">
        {(() => {
          const data = supervisors.find((s) => s.id === openView);
          if (!data) return <p className="text-sm text-gray-600">Record not found.</p>;
          return (
            <div className="grid gap-4">
              <section className="rounded-xl border border-slate-200 bg-white/90 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">Identity</h5>
                <div className="grid gap-3 text-sm text-slate-900 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Name</div>
                    <div className="font-medium">{data.name}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Mobile</div>
                    <div className="font-medium">{data.phone}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Education</div>
                    <div className="font-medium">{data.education || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Current income</div>
                    <div className="font-medium">{data.currentIncome || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Bike access</div>
                    <div className="font-medium">{data.bikeAccess || "-"}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white/90 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">Partner & Cluster</h5>
                <div className="grid gap-3 text-sm text-slate-900 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Partner</div>
                    <div className="font-medium">{data.partnerLabel || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Partner number</div>
                    <div className="font-medium">{data.partnerNumber || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Cluster</div>
                    <div className="font-medium">{data.cluster || "-"}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white/90 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">Training</h5>
                <div className="grid gap-3 text-sm text-slate-900 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Biochar training date</div>
                    <div className="font-medium">{data.trainingDate || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Agreement signed</div>
                    <div className="font-medium">{data.agreementSigned ? "Yes" : "No"}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Demo pictures</div>
                    <div className="font-medium">
                      {data.demoPictures && data.demoPictures.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {data.demoPictures.map((f, i) => (<li key={i} className="break-all">{f.name}</li>))}
                        </ul>
                      ) : ("-")}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white/90 p-4">
                <h5 className="mb-3 text-sm font-semibold text-slate-900">KYC</h5>
                <div className="grid gap-3 text-sm text-slate-900 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Account holder</div>
                    <div className="font-medium">{data.bankAccountName || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Account number</div>
                    <div className="font-medium">{data.bankAccountNumber || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">IFSC</div>
                    <div className="font-medium">{data.bankIfsc || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Bank name</div>
                    <div className="font-medium">{data.bankName || "-"}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">PAN Card</div>
                    <div className="font-medium">{data.panCardName || "-"}</div>
                  </div>
                </div>
              </section>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}



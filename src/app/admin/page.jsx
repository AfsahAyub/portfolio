
"use client";
import RichTextEditor from "../../../components/RichTextEditor";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);

  const [sectionName, setSectionName] = useState("");
  const [editSectionId, setEditSectionId] = useState(null);

  const [itemName, setItemName] = useState("");
  const [editItemId, setEditItemId] = useState(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function api(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  }

  function jsonOptions(method, body) {
    return {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  }

  async function loadSections() {
    const data = await api("/api/sections");
    setSections(data);
  }

  useEffect(() => {
    loadSections().catch(err => setError(err.message));
  }, []);

  async function saveSection(e) {
    e.preventDefault();
    if (!sectionName.trim() || busy) return;

    setBusy(true);
    setError("");

    try {
      if (editSectionId) {
        const updated = await api(
          "/api/sections",
          jsonOptions("PATCH", {
            id: editSectionId,
            title: sectionName,
          })
        );

        if (selected?.id === editSectionId) {
          setSelected(updated);
        }
      } else {
        await api(
          "/api/sections",
          jsonOptions("POST", { title: sectionName })
        );
      }

      await loadSections();
      setSectionName("");
      setEditSectionId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteSection(id) {
    if (!confirm(
      "Poora section aur uski saari information delete ho jayegi. Continue?"
    )) return;

    setBusy(true);
    setError("");

    try {
      await api(
        "/api/sections",
        jsonOptions("DELETE", { id })
      );

      if (selected?.id === id) {
        setSelected(null);
        setItems([]);
      }

      await loadSections();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function openSection(section) {
    setSelected(section);
    setItems([]);
    setItemName("");
    setEditItemId(null);
    setError("");

    try {
      const data = await api(
        `/api/sections/${section.id}/items`
      );
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveItem(e) {
    e.preventDefault();
    if (!itemName.trim() || !selected || busy) return;

    setBusy(true);
    setError("");

    try {
      const url = `/api/sections/${selected.id}/items`;

      if (editItemId) {
        await api(
          url,
          jsonOptions("PATCH", {
            itemId: editItemId,
            name: itemName,
          })
        );
      } else {
        await api(
          url,
          jsonOptions("POST", { name: itemName })
        );
      }

      const data = await api(url);
      setItems(data);
      setItemName("");
      setEditItemId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(id) {
    if (!confirm("Ye information delete karni hai?")) return;

    setBusy(true);
    setError("");

    try {
      await api(
        `/api/sections/${selected.id}/items`,
        jsonOptions("DELETE", { itemId: id })
      );

      setItems(prev => prev.filter(item => item.id !== id));
      if (editItemId === id) {
        setEditItemId(null);
        setItemName("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function displayItem(item) {
    const content = item.content || {};
    return content.name ||
      content.title ||
      content.degree ||
      Object.values(content).join(" - ");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">



        <div>
          <h1 className="text-3xl font-bold">
            Portfolio Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-400">
            Manage your complete portfolio
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-900 p-4">
            {error}
          </div>
        )}

        {/* ADD / EDIT SECTION */}
        <form
          onSubmit={saveSection}
          className="rounded-xl bg-slate-900 p-6"
        >
          <h2 className="mb-4 text-xl font-semibold">
            {editSectionId ? "Edit Section" : "Add New Section"}
          </h2>

          <div className="flex flex-wrap gap-3">
            <input
              value={sectionName}
              onChange={e => setSectionName(e.target.value)}
              placeholder="Skills, Education, Projects..."
              required
              className="min-w-0 flex-1 rounded-lg bg-slate-800 p-3 outline-none"
            />

            <button
              disabled={busy}
              className="rounded-lg bg-blue-600 px-5 py-3 disabled:opacity-50"
            >
              {editSectionId ? "Save Changes" : "+ Add Section"}
            </button>

            {editSectionId && (
              <button
                type="button"
                onClick={() => {
                  setEditSectionId(null);
                  setSectionName("");
                }}
                className="rounded-lg bg-slate-700 px-4"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* SECTIONS LIST */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Your Sections
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map(section => (
              <div
                key={section.id}
                className="rounded-xl border border-slate-700 bg-slate-900 p-5"
              >
                <h3 className="mb-4 text-xl font-semibold">
                  {section.title}
                </h3>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openSection(section)}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm"
                  >
                    Manage Info
                  </button>

                  <button
                    onClick={() => {
                      setEditSectionId(section.id);
                      setSectionName(section.title);
                    }}
                    className="rounded-lg bg-amber-600 px-3 py-2 text-sm"
                  >
                    Edit
                  </button>

                  <button
                    disabled={busy}
                    onClick={() => deleteSection(section.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION INFORMATION */}
        {selected && (
          <div className="rounded-xl border border-blue-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-2xl font-bold">
              Manage {selected.title}
            </h2>

            <form
              onSubmit={saveItem}
              className="mb-6 space-y-4 rounded-lg bg-slate-800 p-5"
            >
              <label className="block font-medium">
                {editItemId ? "Edit Information" : "Add Information"}
              </label>

              
<RichTextEditor
  key={`${selected.id}-${editItemId || "new"}`}
  content={itemName}
  onChange={setItemName}
/>


              <div className="flex gap-3">
                <button
                  disabled={busy}
                  className="rounded-lg bg-blue-600 px-5 py-3 disabled:opacity-50"
                >
                  {busy
                    ? "Saving..."
                    : editItemId
                    ? "Save Changes"
                    : "+ Add Information"}
                </button>

                {editItemId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditItemId(null);
                      setItemName("");
                    }}
                    className="rounded-lg bg-slate-600 px-4"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 className="mb-4 text-lg font-semibold">
              Saved Information
            </h3>

            {items.length === 0 && (
              <p className="text-slate-400">
                No information added yet.
              </p>
            )}

            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-800 p-4"
                >
                 
<div className="min-w-0 flex-1 break-words">
  {displayItem(item)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim()}
</div>


                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditItemId(item.id);
                        setItemName(displayItem(item));
                      }}
                      className="rounded-lg bg-amber-600 px-4 py-2 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      disabled={busy}
                      onClick={() => deleteItem(item.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

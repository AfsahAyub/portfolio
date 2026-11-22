
"use client";

import { useState } from "react";
import RichTextEditor from "../../components/RichTextEditor";

export default function PortfolioClient({
  initialSections,
  initialItems,
}) {
  const [sections, setSections] = useState(initialSections);
  const [items, setItems] = useState(initialItems);

  const [editMode, setEditMode] = useState(true);
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function api(url, method, body) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  }

  async function refreshData() {
    const sectionData = await api("/api/sections", "GET");
    setSections(sectionData);

    const results = await Promise.all(
      sectionData.map(async (section) => {
        return await api(
          `/api/sections/${section.id}/items`,
          "GET"
        );
      })
    );

    setItems(results.flat());
  }

  function startEdit(type, id, text = "", sectionId = null) {
    setEditing({ type, id, sectionId });
    setValue(text);
    setError("");
  }

  function cancelEdit() {
    setEditing(null);
    setValue("");
  }

  async function save() {
    if (!value.replace(/<[^>]*>/g, "").trim()) {
      setError("Information likhna zaroori hai.");
      return;
    }

    if (busy) return;

    setBusy(true);
    setError("");

    try {
      if (editing.type === "addSection") {
        await api("/api/sections", "POST", {
          title: value.trim(),
        });
      }

      if (editing.type === "editSection") {
        await api("/api/sections", "PATCH", {
          id: editing.id,
          title: value.trim(),
        });
      }

      if (editing.type === "addItem") {
        await api(
          `/api/sections/${editing.sectionId}/items`,
          "POST",
          { name: value }
        );
      }

      if (editing.type === "editItem") {
        await api(
          `/api/sections/${editing.sectionId}/items`,
          "PATCH",
          { itemId: editing.id, name: value }
        );
      }

      await refreshData();
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeSection(id) {
    if (!confirm(
      "Poora section aur uski saari information delete hogi. Continue?"
    )) return;

    setBusy(true);
    setError("");

    try {
      await api("/api/sections", "DELETE", { id });
      await refreshData();
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(sectionId, itemId) {
    if (!confirm("Ye information delete karni hai?")) return;

    setBusy(true);
    setError("");

    try {
      await api(
        `/api/sections/${sectionId}/items`,
        "DELETE",
        { itemId }
      );

      setItems((old) =>
        old.filter((item) => item.id !== itemId)
      );

      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function getText(item) {
    const content = item.content || {};

    return (
      content.name ||
      content.title ||
      content.degree ||
      content.description ||
      Object.values(content).join(" | ")
    );
  }

  function plainText(html) {
    return String(html || "")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }

  function EditorBox({ rich = false }) {
    return (
      <div className="space-y-4 rounded-2xl border border-violet-400/40 bg-[#252349] p-5">
        {rich ? (
          <RichTextEditor
            key={`${editing?.type}-${editing?.id || "new"}`}
            content={value}
            onChange={setValue}
          />
        ) : (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-[#16182f] p-4 text-white outline-none"
            placeholder="Information likhein..."
          />
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={save}
            className="rounded-lg bg-violet-500 px-5 py-2 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={cancelEdit}
            className="rounded-lg bg-slate-600 px-5 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const ActionButton = ({ children, onClick, danger = false }) => (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
        danger
          ? "bg-red-500/15 text-red-300 hover:bg-red-500/30"
          : "bg-violet-400/15 text-violet-200 hover:bg-violet-400/30"
      }`}
    >
      {children}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#080B1D] text-white">

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080B1D]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <a href="#home" className="text-2xl font-black">
            <span className="text-violet-300">AFSAH</span>
            <span className="text-pink-300">.</span>
          </a>

          <nav className="flex gap-5 text-sm text-slate-300">
            <a href="#about">About</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
          </nav>

          {/* Local editing preview only */}
          <button
            onClick={() => {
              setEditMode(!editMode);
              cancelEdit();
            }}
            className="rounded-full border border-violet-400/40 bg-violet-400/10 px-5 py-2 text-sm text-violet-200"
          >
            {editMode ? "Preview Visitor View" : "Enable Editing"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative isolate overflow-hidden px-6 py-28"
      >
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1800&q=85')",
          }}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080B1D] via-[#080B1D]/95 to-[#1d1644]/70" />

        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-pink-300">
            Plant Sciences • Biotechnology • Research
          </p>

          <h1 className="text-6xl font-black leading-tight md:text-8xl">
            Afsah
            <span className="block bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
              Ayub.
            </span>
          </h1>

          <h2 className="mt-6 text-2xl text-violet-200">
            PhD Research Scholar in Botany
          </h2>

          <p className="mt-6 max-w-2xl leading-8 text-slate-300">
            Exploring plant biotechnology, molecular research
            and sustainable scientific solutions.
          </p>

          <a
            href="#portfolio"
            className="mt-8 inline-block rounded-full bg-gradient-to-r from-violet-400 to-pink-300 px-8 py-4 font-bold text-[#080B1D]"
          >
            Explore My Portfolio ↗
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-violet-400/20 bg-[#171A35] p-8 md:p-12">
          <p className="text-sm uppercase tracking-[0.2em] text-pink-300">
            Discover My Story
          </p>

          <h2 className="mt-3 text-4xl font-bold">
            Science & Discovery
          </h2>

          <p className="mt-6 max-w-3xl leading-8 text-slate-300">
            A passionate researcher interested in plant
            sciences, biotechnology, molecular genetics,
            laboratory techniques and environmental studies.
          </p>
        </div>
      </section>

      {/* Dynamic Sections */}
      <section id="portfolio" className="px-6 py-20">
        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-widest text-pink-300">
              My Journey
            </p>
            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Academic &
              <span className="block text-violet-300">
                Professional Portfolio
              </span>
            </h2>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-900/40 p-4 text-red-200">
              {error}
            </div>
          )}

          {editMode && (
            <div className="mb-8">
              {editing?.type === "addSection" ? (
                <EditorBox />
              ) : (
                <button
                  onClick={() => startEdit("addSection", null)}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-pink-400 px-6 py-3 font-semibold"
                >
                  + Add New Section
                </button>
              )}
            </div>
          )}

          <div className="space-y-10">
            {sections.map((section, index) => {
              const sectionItems = items.filter(
                (item) => item.section_id === section.id
              );

              const isSkills = section.title
                .toLowerCase()
                .includes("skill");

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-3xl border border-violet-400/20 bg-[#171A35]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#29204E] to-[#171A35] p-6 md:p-8">
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-widest text-pink-300">
                        Chapter {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="text-3xl font-bold">
                        {section.title}
                      </h3>
                    </div>

                    {editMode && (
                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          onClick={() => startEdit(
                            "addItem", null, "", section.id
                          )}
                        >
                          + Add
                        </ActionButton>

                        <ActionButton
                          onClick={() => startEdit(
                            "editSection",
                            section.id,
                            section.title
                          )}
                        >
                          ✎ Edit
                        </ActionButton>

                        <ActionButton
                          danger
                          onClick={() => removeSection(section.id)}
                        >
                          🗑 Delete
                        </ActionButton>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5 p-6 md:p-8">

                    {editing?.type === "editSection" &&
                      editing.id === section.id && (
                        <EditorBox />
                      )}

                    {editing?.type === "addItem" &&
                      editing.sectionId === section.id && (
                        <EditorBox rich={!isSkills} />
                      )}

                    <div className={
                      isSkills
                        ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid gap-5 md:grid-cols-2"
                    }>
                      {sectionItems.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-2xl border border-violet-400/15 bg-[#222342] p-5 transition hover:border-violet-300/40"
                        >
                          {editing?.type === "editItem" &&
                          editing.id === item.id ? (
                            <EditorBox rich={!isSkills} />
                          ) : (
                            <>
                              <p className="whitespace-pre-line break-words leading-8 text-slate-200">
                                {plainText(getText(item))}
                              </p>

                              {editMode && (
                                <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
                                  <ActionButton
                                    onClick={() => startEdit(
                                      "editItem",
                                      item.id,
                                      getText(item),
                                      section.id
                                    )}
                                  >
                                    ✎ Edit
                                  </ActionButton>

                                  <ActionButton
                                    danger
                                    onClick={() => removeItem(
                                      section.id,
                                      item.id
                                    )}
                                  >
                                    🗑 Delete
                                  </ActionButton>
                                </div>
                              )}
                            </>
                          )}
                        </article>
                      ))}
                    </div>

                    {sectionItems.length === 0 && (
                      <p className="text-slate-400">
                        No information added yet.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="bg-gradient-to-br from-[#241C4F] to-[#080B1D] px-6 py-24 text-center"
      >
        <h2 className="text-4xl font-black md:text-5xl">
          Let's Create
          <span className="block text-pink-300">
            Something Meaningful.
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-slate-300">
          Open to scientific research collaborations and
          professional opportunities.
        </p>

        <a
          href="mailto:afsahayub45@gmail.com"
          className="mt-9 inline-block rounded-full bg-gradient-to-r from-violet-400 to-pink-300 px-9 py-4 font-bold text-[#080B1D]"
        >
          Send Me an Email ↗
        </a>
      </section>

      <footer className="border-t border-white/10 bg-[#070A18] p-7 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Afsah Ayub.
        All rights reserved.
      </footer>
    </main>
  );
}

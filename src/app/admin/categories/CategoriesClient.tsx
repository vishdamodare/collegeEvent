"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, Search, Archive, Trash2, Edit, X, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createCategory, updateCategory, archiveCategory } from "@/actions/admin";

interface CategoriesClientProps {
  initialCategories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    color: string | null;
    isArchived: boolean;
  }>;
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📌");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#D7FF3D");

  const filteredCategories = initialCategories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    toast.promise(createCategory(name, icon, description, color), {
      loading: "Creating category...",
      success: (res) => {
        if (res.error) throw new Error(res.error);
        setShowCreateModal(false);
        // Reset form
        setName("");
        setIcon("📌");
        setDescription("");
        setColor("#D7FF3D");
        router.refresh();
        return "Category created successfully!";
      },
      error: (err: any) => err.message || "Failed to create category.",
    });
  };

  const handleEditSave = async (id: string) => {
    if (!name.trim()) return;

    toast.promise(updateCategory(id, name, icon, description, color), {
      loading: "Saving updates...",
      success: (res) => {
        if (res.error) throw new Error(res.error);
        setEditingId(null);
        setName("");
        router.refresh();
        return "Category updated successfully!";
      },
      error: (err: any) => err.message || "Failed to save category.",
    });
  };

  const handleArchiveToggle = async (id: string, isCurrentlyArchived: boolean) => {
    toast.promise(archiveCategory(id, !isCurrentlyArchived), {
      loading: isCurrentlyArchived ? "Restoring category..." : "Archiving category...",
      success: (res) => {
        if (res.error) throw new Error(res.error);
        router.refresh();
        return isCurrentlyArchived ? "Category restored!" : "Category archived!";
      },
      error: (err: any) => err.message || "Action failed.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-archivo)]">Categories</h1>
          <p className="text-text-faint mt-1">Configure event taxonomies, filter criteria, and custom indicators.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowCreateModal(true);
          }}
          className="btn btn-primary w-full sm:w-auto shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </button>
      </div>

      {/* Toolbar filter */}
      <div className="bg-card border border-border rounded-xl p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => {
            const isEditing = editingId === cat.id;

            return (
              <div
                key={cat.id}
                className={`rounded-2xl border bg-card p-5 relative overflow-hidden flex flex-col justify-between transition-all group ${
                  cat.isArchived ? "border-border/40 opacity-60" : "border-border hover:border-border-bright"
                }`}
                style={{
                  boxShadow: !cat.isArchived && cat.color ? `0 4px 20px -6px ${cat.color}15` : "none",
                }}
              >
                {/* Upper row header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="w-10 text-center form-input text-lg px-0.5"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input text-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{cat.icon || "📌"}</span>
                      <div>
                        <h3 className="font-semibold text-text-main text-base font-archivo truncate max-w-[150px]">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] text-text-faint font-mono block">/{cat.slug}</span>
                      </div>
                    </div>
                  )}

                  {/* Top-right color box indicator */}
                  {!isEditing && (
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: cat.color || "#ccc" }}
                    />
                  )}
                </div>

                {/* Description details */}
                <div className="mb-6">
                  {isEditing ? (
                    <div className="space-y-3 mt-2">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-input text-xs resize-none"
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-text-faint uppercase font-bold shrink-0">Color</label>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-text-faint leading-relaxed line-clamp-2">
                      {cat.description || "No description provided."}
                    </p>
                  )}
                </div>

                {/* Action buttons footer */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-text-faint">
                    {cat.isArchived ? "Archived" : "Active"}
                  </span>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg border border-border bg-card hover:bg-card-hover text-text-faint cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditSave(cat.id)}
                          className="p-1.5 rounded-lg border border-border bg-lime/10 hover:bg-lime/20 text-lime cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setName(cat.name);
                            setIcon(cat.icon || "📌");
                            setDescription(cat.description || "");
                            setColor(cat.color || "#D7FF3D");
                          }}
                          className="p-1.5 rounded-lg border border-border bg-card hover:bg-card-hover text-text-faint hover:text-text-main cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchiveToggle(cat.id, cat.isArchived)}
                          className={`p-1.5 rounded-lg border border-border bg-card hover:bg-card-hover cursor-pointer ${
                            cat.isArchived
                              ? "text-text-faint hover:text-lime"
                              : "text-text-faint hover:text-coral"
                          }`}
                          title={cat.isArchived ? "Restore" : "Archive"}
                        >
                          {cat.isArchived ? <RefreshCw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-border p-12 text-center text-text-faint bg-card">
            <Tag className="w-8 h-8 mx-auto mb-3 opacity-30" />
            No categories match your search filters.
          </div>
        )}
      </div>

      {/* Creation Modal/Form panel overlays */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold font-archivo">Create Category</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-text-faint hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hackathons"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5">
                    Emoji / Icon
                  </label>
                  <input
                    type="text"
                    required
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="form-input text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5">
                    Glow Color
                  </label>
                  <div className="flex items-center gap-2 h-[42px] px-3 bg-card border border-border rounded-xl">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                    />
                    <span className="text-xs text-text-faint font-mono truncate">{color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-faint mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short explanation for student lists..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-glass px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

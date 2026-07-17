"use client";

import { useState } from "react";
import { FormField } from "@/types/admin/registration";
import { Plus, Trash2, Settings2, PlusCircle, Check, Eye } from "lucide-react";

interface RegistrationFormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

export function RegistrationFormBuilder({ fields, onChange }: RegistrationFormBuilderProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const addCustomField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: `field-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: `Custom ${type.toUpperCase()} Field`,
      required: false,
      placeholder: `Enter your response`,
      options: type === "dropdown" || type === "checkbox" || type === "radio" ? ["Option 1", "Option 2"] : undefined,
    };
    onChange([...fields, newField]);
    setEditingFieldId(newField.id);
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
    if (editingFieldId === id) setEditingFieldId(null);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(
      fields.map((f) => {
        if (f.id === id) {
          return { ...f, ...updates } as FormField;
        }
        return f;
      })
    );
  };

  const addOption = (fieldId: string, options: string[]) => {
    updateField(fieldId, { options: [...options, `Option ${options.length + 1}`] });
  };

  const updateOption = (fieldId: string, options: string[], index: number, val: string) => {
    const nextOpts = [...options];
    nextOpts[index] = val;
    updateField(fieldId, { options: nextOpts });
  };

  const removeOption = (fieldId: string, options: string[], index: number) => {
    updateField(fieldId, { options: options.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[15px] font-bold text-white uppercase tracking-wider">Registration Form Config</h4>
          <p className="text-[12px] text-white/40">Build custom questions students must answer to enroll.</p>
        </div>
        <div className="flex gap-2">
          {/* Quick add triggers */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                addCustomField(e.target.value as any);
                e.target.value = "";
              }
            }}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[12px] outline-none cursor-pointer"
          >
            <option value="">+ Add Question</option>
            <option value="text">Short Text</option>
            <option value="textarea">Long Text</option>
            <option value="number">Number</option>
            <option value="dropdown">Dropdown Options</option>
            <option value="checkbox">Checkbox Select</option>
            <option value="radio">Radio Buttons</option>
            <option value="file">File Upload (PDF/Image)</option>
            <option value="url">URL Link</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, idx) => {
          const isDefault = ["f-name", "f-email", "f-phone", "f-college", "f-dept", "f-year"].includes(field.id);
          const isEditing = editingFieldId === field.id;

          return (
            <div
              key={field.id}
              className={`rounded-xl border transition-all ${
                isEditing ? "border-[var(--color-lime)] bg-white/5" : "border-white/5 bg-[#141414]/40"
              } p-4`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/5 text-white/50 uppercase">
                    {field.type}
                  </span>
                  <p className="text-[13.5px] font-semibold text-white">{field.label}</p>
                  {field.required && (
                    <span className="text-[10px] text-[var(--color-lime)] font-archivo uppercase bg-[var(--color-lime)]/10 px-1.5 py-0.5 rounded border border-[var(--color-lime)]/20">
                      Required
                    </span>
                  )}
                  {isDefault && (
                    <span className="text-[10px] text-blue-400 font-archivo uppercase bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                      System Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingFieldId(isEditing ? null : field.id)}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    title="Configure field options"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                      title="Delete field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expansion Details editing block */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-4 font-archivo">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Question Title / Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        disabled={isDefault}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="Placeholder text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase mb-1.5">Help Text / Description</label>
                      <input
                        type="text"
                        value={field.helpText || ""}
                        onChange={(e) => updateField(field.id, { helpText: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-white/5 text-white text-[13px] outline-none"
                        placeholder="e.g. Provide link to your Google Drive folder"
                      />
                    </div>
                    <div className="flex items-end pb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-[13px] text-white/70 select-none">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="rounded border-gray-600 bg-gray-800 text-[var(--color-lime)] cursor-pointer"
                          disabled={isDefault}
                        />
                        Mark as Required Question
                      </label>
                    </div>
                  </div>

                  {/* Options List editor for Multiple Choices */}
                  {(field.type === "dropdown" || field.type === "checkbox" || field.type === "radio") && field.options && (
                    <div className="space-y-2 p-3.5 rounded-lg bg-[#181818]/60 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] font-bold text-white/40 uppercase">Multiple Choice Options</label>
                        <button
                          type="button"
                          onClick={() => addOption(field.id, field.options || [])}
                          className="text-[11px] font-bold text-[var(--color-lime)] flex items-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Add Option
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-2">
                        {field.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(field.id, field.options || [], oIdx, e.target.value)}
                              className="flex-1 px-2.5 py-1.5 rounded bg-[#131313] border border-white/5 text-white text-[12.5px] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(field.id, field.options || [], oIdx)}
                              className="p-1.5 text-white/30 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingFieldId(null)}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--color-lime)] text-[#0B0B08] font-bold text-[12px] flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

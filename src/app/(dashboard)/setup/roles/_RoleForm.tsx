// @ts-nocheck
"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Button from "../../../../components/ui/Button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../../../components/ui/Card";
import Input from "../../../../components/ui/Input";
import {
  type FormData, type FormErrors, type RoleItem,
  EMPTY_FORM, PERM_GROUPS, PERM_LABEL, TOTAL_PERMS, permKey,
} from "./_data";

// ─── Permission Grid ──────────────────────────────────────────────────────────

function PermissionGrid({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function toggle(key: string) {
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  }

  function toggleModule(mod: string, perms: string[]) {
    const keys = perms.map((p) => permKey(mod, p));
    const allChecked = keys.every((k) => value.includes(k));
    onChange(allChecked
      ? value.filter((k) => !keys.includes(k))
      : [...value, ...keys.filter((k) => !value.includes(k))]
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Izin Akses</p>
          <p className="text-xs text-text-muted">{value.length} izin dipilih dari {TOTAL_PERMS} tersedia</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange(PERM_GROUPS.flatMap((g) => g.perms.map((p) => permKey(g.key, p))))}
            className="text-xs font-medium text-secondary hover:underline"
          >
            Pilih Semua
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-medium text-text-muted hover:text-red-400"
          >
            Hapus Semua
          </button>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border/50 overflow-hidden rounded-xl border border-border/70">
        {PERM_GROUPS.map((group) => {
          const keys = group.perms.map((p) => permKey(group.key, p));
          const allChecked = keys.every((k) => value.includes(k));
          const someChecked = keys.some((k) => value.includes(k));
          return (
            <div
              key={group.key}
              className="flex items-start gap-4 bg-surface/40 px-4 py-3.5 transition-colors hover:bg-surface/60"
            >
              <label className="flex min-w-32 cursor-pointer select-none items-center gap-2.5 pt-0.5">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                  onChange={() => toggleModule(group.key, group.perms)}
                  className="h-4 w-4 rounded border-border accent-secondary"
                />
                <span className="text-sm font-semibold text-text-primary">{group.module}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {group.perms.map((perm) => {
                  const key = permKey(group.key, perm);
                  const checked = value.includes(key);
                  return (
                    <label
                      key={key}
                      className={`inline-flex cursor-pointer select-none items-center rounded-lg border px-3 py-1 text-xs font-medium transition ${
                        checked
                          ? "border-secondary/50 bg-secondary/10 text-secondary"
                          : "border-border/60 text-text-muted hover:border-border hover:text-text-primary"
                      }`}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggle(key)} className="sr-only" />
                      {PERM_LABEL[perm] ?? perm}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Form Component ───────────────────────────────────────────────────────────

type RoleFormProps = {
  editTarget?: RoleItem;
  onSave: (form: FormData) => Promise<string | null>;
  onBack: () => void;
};

export default function RoleForm({ editTarget, onSave, onBack }: RoleFormProps) {
  const [form, setForm] = useState<FormData>(
    editTarget
      ? { name: editTarget.name, description: editTarget.description, permissions: [...editTarget.permissions] }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Nama role wajib diisi";
    return e;
  }

  async function handleSave() {
    setApiError(null);
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSaving(true);
    const error = await onSave(form);
    setSaving(false);
    if (error) setApiError(error);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 text-text-muted transition hover:border-border hover:text-text-primary"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              {editTarget ? "Edit Role" : "Tambah Role"}
            </h1>
            <p className="text-sm text-text-muted">
              {editTarget
                ? "Perbarui informasi dan konfigurasi izin akses."
                : "Buat role baru dengan konfigurasi izin akses."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={saving}>Batal</Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            {editTarget ? "Simpan" : "Buat Role"}
          </Button>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left — info + summary */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Role</CardTitle>
              <CardDescription>Nama dan deskripsi singkat peran ini.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Nama Role"
                placeholder="cth. Supervisor, Resepsionis..."
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                error={errors.name}
                disabled={editTarget?.isSystem}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  placeholder="Jelaskan tanggung jawab dan ruang lingkup role ini..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-border/70 bg-surface/50 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/45 outline-none transition-all duration-150 focus:border-primary/40 focus:bg-surface focus:shadow-[0_0_0_3px_rgba(27,111,255,0.08)]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Permission summary */}
          <div className="rounded-xl border border-secondary/25 bg-secondary/5 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Ringkasan Izin</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">{form.permissions.length}</p>
            <p className="text-xs text-text-muted">dari {TOTAL_PERMS} izin tersedia</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2/60">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${(form.permissions.length / TOTAL_PERMS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right — permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Konfigurasi Izin Akses</CardTitle>
            <CardDescription>Pilih modul dan operasi yang diizinkan untuk role ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionGrid
              value={form.permissions}
              onChange={(v) => setForm((f) => ({ ...f, permissions: v }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

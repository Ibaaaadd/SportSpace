"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, User } from "lucide-react";
import Button from "../../../../components/ui/Button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../../../components/ui/Card";
import Input from "../../../../components/ui/Input";
import Select from "../../../../components/ui/Select";
import Toggle from "../../../../components/ui/Toggle";
import {
  type FormData, type FormErrors, type UserItem,
  EMPTY_FORM, toRoleOptions, validateEmail, getInitials,
} from "./_data";

type UserFormProps = {
  editTarget?: UserItem;
  // Kembalikan string error message kalau gagal, null kalau berhasil
  onSave: (form: FormData) => Promise<string | null>;
  onBack: () => void;
};

export default function UserForm({ editTarget, onSave, onBack }: UserFormProps) {
  const [form, setForm] = useState<FormData>(
    editTarget
      ? {
          name: editTarget.name,
          email: editTarget.email,
          phone: editTarget.phone,
          roleId: editTarget.roleId,
          active: editTarget.status === "active",
          password: "",
          confirmPassword: "",
          changePassword: false,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data: { id: string; name: string }[]) => {
        setRoles(data);
        setForm((f) => (f.roleId ? f : { ...f, roleId: data[0]?.id ?? "" }));
      })
      .catch(() => setRoles([]));
  }, []);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim())               e.name  = "Nama wajib diisi";
    if (!form.email.trim())              e.email = "Email wajib diisi";
    else if (!validateEmail(form.email)) e.email = "Format email tidak valid";
    if (!form.roleId)                    e.roleId = "Role wajib dipilih";

    const needsPassword = !editTarget || form.changePassword;
    if (needsPassword) {
      if (!form.password)                e.password = "Password wajib diisi";
      else if (form.password.length < 6) e.password = "Password minimal 6 karakter";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Password tidak cocok";
    }
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

  const breadcrumb = editTarget ? `Edit — ${editTarget.name}` : "Tambah User Baru";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-1.5 text-xs text-text-muted transition hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Kembali ke Daftar User
        </button>
        <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted/50">
              Setup / Users / {breadcrumb}
            </p>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              {editTarget ? "Edit User" : "Tambah User Baru"}
            </h1>
            <p className="mt-0.5 text-sm text-text-muted">
              {editTarget
                ? "Perbarui data dan hak akses pengguna."
                : "Isi informasi akun pengguna baru."}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} disabled={saving}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
              {editTarget ? "Simpan Perubahan" : "Tambah User"}
            </Button>
          </div>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {apiError}
        </div>
      )}

      {/* Form layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left — avatar preview + status */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Foto Profil</CardTitle>
              <CardDescription>Inisial dari nama pengguna.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary text-2xl font-bold text-white shadow-[0_0_24px_rgba(27,111,255,0.3)]">
                  {form.name.trim()
                    ? getInitials(form.name)
                    : <User className="h-8 w-8 opacity-60" strokeWidth={1.5} />}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-text-primary">
                    {form.name.trim() || "Nama Pengguna"}
                  </p>
                  <p className="text-xs text-text-muted">{form.email || "email@domain.com"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Akun</CardTitle>
              <CardDescription>Akun nonaktif tidak dapat login.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${form.active ? "text-accent" : "text-text-muted"}`}>
                    {form.active ? "Aktif" : "Nonaktif"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {form.active ? "User dapat login." : "Login diblokir."}
                  </p>
                </div>
                <Toggle
                  checked={form.active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                  label="Status akun"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — informasi + keamanan */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Data identitas dan role pengguna.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Nama Lengkap"
                placeholder="cth. Budi Santoso"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                error={errors.name}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Email"
                  type="email"
                  placeholder="budi@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  error={errors.email}
                />
                <Input
                  label="No. Telepon"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <Select
                label="Role"
                value={form.roleId}
                onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                options={toRoleOptions(roles)}
                error={errors.roleId}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
              <CardDescription>
                {editTarget
                  ? "Biarkan kosong jika tidak ingin mengubah password."
                  : "Atur password untuk akun baru."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {editTarget && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      changePassword: !f.changePassword,
                      password: "",
                      confirmPassword: "",
                    }))
                  }
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                    form.changePassword
                      ? "border-secondary/40 bg-secondary/8 text-secondary"
                      : "border-border/60 bg-ink-2/50 text-text-muted hover:border-border hover:text-text-primary"
                  }`}
                >
                  <Lock className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                  <div className="flex-1">
                    <p className="font-medium leading-tight">
                      {form.changePassword ? "Ubah Password Aktif" : "Ubah Password"}
                    </p>
                    <p className="text-xs opacity-70">
                      {form.changePassword ? "Klik untuk batal" : "Klik untuk mengatur password baru"}
                    </p>
                  </div>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
                    form.changePassword ? "border-secondary bg-secondary text-white" : "border-border/60"
                  }`}>
                    {form.changePassword ? "✓" : ""}
                  </span>
                </button>
              )}

              {(!editTarget || form.changePassword) && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 karakter"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    error={errors.password}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="pointer-events-auto text-text-muted/60 transition hover:text-text-muted"
                      >
                        {showPw
                          ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.8} />
                          : <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />}
                      </button>
                    }
                  />
                  <Input
                    label="Konfirmasi Password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                    error={errors.confirmPassword}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="pointer-events-auto text-text-muted/60 transition hover:text-text-muted"
                      >
                        {showConfirm
                          ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.8} />
                          : <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />}
                      </button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/80 px-5 py-3.5">
        <p className="text-sm text-text-muted">
          {editTarget
            ? `Mengedit: ${editTarget.name}`
            : "User baru akan ditambahkan ke sistem."}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={saving}>Batal</Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
            {editTarget ? "Simpan Perubahan" : "Tambah User"}
          </Button>
        </div>
      </div>
    </div>
  );
}

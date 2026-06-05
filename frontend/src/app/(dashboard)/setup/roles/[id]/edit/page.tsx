"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import RoleForm from "../../_RoleForm";
import { ToastProvider, useToast } from "../../../../../../components/ui/Toast";
import Button from "../../../../../../components/ui/Button";
import { normalizeRole, type FormData, type RoleItem } from "../../_data";

function EditRoleContent() {
  const params = useParams();
  const router = useRouter();
  const { push } = useToast();

  const id = params.id as string;

  const [role, setRole]       = useState<RoleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch(`/api/roles/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRole(normalizeRole(data));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchRole();
  }, [id]);

  async function handleSave(form: FormData): Promise<string | null> {
    try {
      const res = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name,
          description: form.description,
          permissions: form.permissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) return data.error ?? "Gagal mengupdate role.";

      push({ title: "Role diperbarui", description: `${form.name} berhasil diupdate.`, variant: "success" });
      router.push("/setup/roles");
      return null;
    } catch {
      return "Terjadi kesalahan, coba lagi.";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.8} />
        <span className="text-sm">Memuat data role...</span>
      </div>
    );
  }

  if (notFound || !role) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-semibold text-text-primary">Role tidak ditemukan</p>
        <p className="text-sm text-text-muted">
          ID <code className="rounded-md bg-ink-2 px-1.5 py-0.5 text-xs">{id}</code> tidak ada di sistem.
        </p>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />}
          onClick={() => router.push("/setup/roles")}
        >
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  return (
    <RoleForm
      editTarget={role}
      onSave={handleSave}
      onBack={() => router.push("/setup/roles")}
    />
  );
}

export default function EditRolePage() {
  return <ToastProvider><EditRoleContent /></ToastProvider>;
}

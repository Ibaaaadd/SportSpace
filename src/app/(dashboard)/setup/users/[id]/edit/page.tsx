"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import UserForm from "../../_UserForm";
import { ToastProvider, useToast } from "../../../../../../components/ui/Toast";
import Button from "../../../../../../components/ui/Button";
import { normalizeUser, type FormData, type UserItem } from "../../_data";

function EditUserContent() {
  const params = useParams();
  const router = useRouter();
  const { push } = useToast();

  const id = params.id as string;

  const [user, setUser]     = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(normalizeUser(data));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  async function handleSave(form: FormData): Promise<string | null> {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.name,
          email:    form.email,
          phone:    form.phone,
          role:     form.role,
          active:   form.active,
          // Hanya kirim password kalau diisi
          ...(form.changePassword && form.password ? { password: form.password } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error ?? "Gagal mengupdate user.";
      }

      push({ title: "User diperbarui", description: `${form.name} berhasil diupdate.`, variant: "success" });
      router.push("/setup/users");
      return null;
    } catch {
      return "Terjadi kesalahan, coba lagi.";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.8} />
        <span className="text-sm">Memuat data user...</span>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-lg font-semibold text-text-primary">User tidak ditemukan</p>
        <p className="text-sm text-text-muted">
          ID <code className="rounded-md bg-ink-2 px-1.5 py-0.5 text-xs">{id}</code> tidak ada di sistem.
        </p>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />}
          onClick={() => router.push("/setup/users")}
        >
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  return (
    <UserForm
      editTarget={user}
      onSave={handleSave}
      onBack={() => router.push("/setup/users")}
    />
  );
}

export default function EditUserPage() {
  return <ToastProvider><EditUserContent /></ToastProvider>;
}

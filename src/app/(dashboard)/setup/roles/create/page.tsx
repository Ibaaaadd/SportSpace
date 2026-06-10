"use client";

import { useRouter } from "next/navigation";
import RoleForm from "../_RoleForm";
import { ToastProvider, useToast } from "../../../../../components/ui/Toast";
import { type FormData } from "../_data";

function CreateRoleContent() {
  const router = useRouter();
  const { push } = useToast();

  async function handleSave(form: FormData): Promise<string | null> {
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name,
          description: form.description,
          permissions: form.permissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) return data.error ?? "Gagal membuat role.";

      push({ title: "Role dibuat", description: `${form.name} berhasil ditambahkan.`, variant: "success" });
      router.push("/setup/roles");
      return null;
    } catch {
      return "Terjadi kesalahan, coba lagi.";
    }
  }

  return (
    <RoleForm
      onSave={handleSave}
      onBack={() => router.push("/setup/roles")}
    />
  );
}

export default function CreateRolePage() {
  return <ToastProvider><CreateRoleContent /></ToastProvider>;
}

"use client";

import { useRouter } from "next/navigation";
import UserForm from "../_UserForm";
import { ToastProvider, useToast } from "../../../../../components/ui/Toast";
import { type FormData } from "../_data";

function CreateUserContent() {
  const router = useRouter();
  const { push } = useToast();

  async function handleSave(form: FormData): Promise<string | null> {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.name,
          email:    form.email,
          phone:    form.phone,
          roleId:   form.roleId,
          password: form.password,
          active:   form.active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error ?? "Gagal menambahkan user.";
      }

      push({ title: "User ditambahkan", description: `${form.name} berhasil ditambahkan.`, variant: "success" });
      router.push("/setup/users");
      return null;
    } catch {
      return "Terjadi kesalahan, coba lagi.";
    }
  }

  return (
    <UserForm
      onSave={handleSave}
      onBack={() => router.push("/setup/users")}
    />
  );
}

export default function CreateUserPage() {
  return <ToastProvider><CreateUserContent /></ToastProvider>;
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./ProfileForm.module.css";

interface ProfileFormProps {
  initialName: string | null;
  initialStatus: string | null;
  onUpdate: (name: string, status: string) => void;
}

export function ProfileForm({ initialName, initialStatus, onUpdate }: ProfileFormProps) {
  const t = useTranslations("profile");
  const [name, setName] = useState(initialName ?? "");
  const [status, setStatus] = useState(initialStatus ?? "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });

      if (!res.ok) throw new Error("Save failed");

      onUpdate(name, status);
      showToast("success", t("saved"));
    } catch {
      showToast("error", t("errorSave"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="profile-name">
          {t("name")}
        </label>
        <input
          id="profile-name"
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("namePlaceholder")}
          maxLength={100}
          disabled={saving}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="profile-status">
          {t("status")}
        </label>
        <input
          id="profile-status"
          type="text"
          className={styles.input}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder={t("statusPlaceholder")}
          maxLength={200}
          disabled={saving}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? t("saving") : t("save")}
        </button>

        {toast && (
          <span
            className={`${styles.toast} ${
              toast.type === "success" ? styles.toastSuccess : styles.toastError
            }`}
          >
            {toast.message}
          </span>
        )}
      </div>
    </form>
  );
}

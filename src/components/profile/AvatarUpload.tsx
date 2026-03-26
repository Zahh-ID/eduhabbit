"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./AvatarUpload.module.css";

interface AvatarUploadProps {
  initialImage: string | null;
  userName: string | null;
  userEmail: string;
  onImageUpdate: (newImage: string) => void;
}

export function AvatarUpload({
  initialImage,
  userName,
  userEmail,
  onImageUpdate,
}: AvatarUploadProps) {
  const t = useTranslations("profile");
  const [currentImage, setCurrentImage] = useState<string | null>(initialImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials =
    (userName?.trim()[0] ?? userEmail[0] ?? "?").toUpperCase();

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = "";

    // Client-side validation
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError(t("errorFileType"));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t("errorFileSize"));
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = (await res.json()) as { image: string };
      setCurrentImage(data.image);
      onImageUpdate(data.image);
    } catch {
      setError(t("errorSave"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.avatarContainer} ${uploading ? styles.uploading : ""}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        aria-label={t("uploadAvatar")}
      >
        {currentImage ? (
          <img src={currentImage} alt={userName ?? userEmail} className={styles.avatarImg} />
        ) : (
          <div className={styles.avatarInitials}>{initials}</div>
        )}
        <div className={styles.overlay}>
          <span className={styles.overlayText}>
            {uploading ? "..." : t("uploadAvatar")}
          </span>
        </div>
      </div>

      <button
        type="button"
        className={styles.changeBtn}
        onClick={handleClick}
        disabled={uploading}
      >
        {uploading ? "..." : t("uploadAvatar")}
      </button>

      <p className={styles.hint}>{t("avatarHint")}</p>

      {error && <p className={styles.error}>{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  );
}

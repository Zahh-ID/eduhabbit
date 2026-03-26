"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AvatarUpload } from "./AvatarUpload";
import { ProfileForm } from "./ProfileForm";
import styles from "./ProfileDashboard.module.css";

interface InitialProfile {
  name: string | null;
  status: string | null;
  image: string | null;
  email: string;
  firstStepsBadgeEligible: boolean;
  firstStepsBadgeClaimed: boolean;
}

interface ProfileDashboardProps {
  initialProfile: InitialProfile;
}

export function ProfileDashboard({ initialProfile }: ProfileDashboardProps) {
  const t = useTranslations("profile");
  const tNav = useTranslations("nav");
  const [currentImage, setCurrentImage] = useState<string | null>(initialProfile.image);
  const [currentName, setCurrentName] = useState<string | null>(initialProfile.name);
  const [currentStatus, setCurrentStatus] = useState<string | null>(initialProfile.status);

  // Recompute eligibility client-side after updates
  const isEligible =
    initialProfile.firstStepsBadgeEligible ||
    (!initialProfile.firstStepsBadgeClaimed &&
      Boolean(currentName?.trim()) &&
      Boolean(currentStatus?.trim()) &&
      Boolean(currentImage));

  const handleFormUpdate = (name: string, status: string) => {
    setCurrentName(name);
    setCurrentStatus(status);
  };

  return (
    <div className={`glass ${styles.card}`}>
      <div className={styles.avatarSection}>
        <AvatarUpload
          initialImage={currentImage}
          userName={currentName}
          userEmail={initialProfile.email}
          onImageUpdate={setCurrentImage}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.formSection}>
        <ProfileForm
          initialName={currentName}
          initialStatus={currentStatus}
          onUpdate={handleFormUpdate}
        />
      </div>

      {(isEligible || initialProfile.firstStepsBadgeClaimed) && (
        <>
          <div className={styles.divider} />
          <div
            className={`${styles.badgeBanner} ${
              initialProfile.firstStepsBadgeClaimed ? styles.badgeBannerClaimed : ""
            }`}
          >
            <span className={styles.badgeIcon}>
              {initialProfile.firstStepsBadgeClaimed ? "🏅" : "🎯"}
            </span>
            <div className={styles.badgeContent}>
              <p className={styles.badgeTitle}>{t("firstStepsBadge")}</p>
              <p className={styles.badgeDescription}>
                {initialProfile.firstStepsBadgeClaimed
                  ? t("firstStepsBadgeClaimed")
                  : t("firstStepsBadgeEligible")}
              </p>
              {!initialProfile.firstStepsBadgeClaimed && isEligible && (
                <Link href="/achievements" className={styles.badgeLink}>
                  {tNav("achievements")} &rarr;
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

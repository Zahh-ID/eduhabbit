import { auth } from "@/lib/auth";
import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { HeroSection } from "@/components/landing/HeroSection";
import { StorySection } from "@/components/landing/StorySection";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { CTASection } from "@/components/landing/CTASection";

export default async function HomePage() {
  const session = await auth();
  const hasSession = !!session?.user;

  return (
    <SmoothScroll>
      <main style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <HeroSection hasSession={hasSession} />
        <StorySection />
        <FeaturesBento />
        <CTASection hasSession={hasSession} />
      </main>
    </SmoothScroll>
  );
}

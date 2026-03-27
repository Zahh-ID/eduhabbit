import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: ["adams-examined-rose-chose.trycloudflare.com"],
};

export default withNextIntl(nextConfig);

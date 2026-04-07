import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const PricingContent = () => {
  const t = useTranslations("headerSections.pricing");
  return (
    <div className="w-full bg-card p-6 shadow-lg rounded-xl lg:w-[250px]">
      <div className="grid grid-cols-2 lg:grid-cols-1">
        <div className="mb-3 space-y-3">
          <h3 className="font-semibold text-card-foreground">{t("individual.title")}</h3>
          <Link
            href="/pricing/individual"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("individual.basicPlan")}
          </Link>
          <Link
            href="/pricing/premium"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("individual.premiumPlan")}
          </Link>
        </div>
        <div className="mb-6 space-y-3">
          <h3 className="font-semibold text-card-foreground">{t("business.title")}</h3>
          <Link
            href="/pricing/startup"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("business.startups")}
          </Link>
          <Link href="/pricing/smb" className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
            {t("business.smb")}
          </Link>
          <Link
            href="/pricing/enterprise"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("business.enterprise")}
          </Link>
        </div>
      </div>
      <Link
        href="/contact"
        className="block w-full rounded-lg border-2 border-primary bg-primary px-4 py-2 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90 hover:border-primary/90"
      >
        {t("contactSales")}
      </Link>
    </div>
  );
};

export default PricingContent;

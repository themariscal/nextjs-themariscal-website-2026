import React from "react";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { useTranslations } from "next-intl";

const CareersContent = () => {
  const t = useTranslations("headerSections.careers");
  return (
    <div className="grid w-full grid-cols-12 shadow-lg rounded-xl overflow-hidden lg:w-[750px]">
      <div className="col-span-12 flex flex-col justify-between bg-primary p-6 lg:col-span-4">
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-primary-foreground">{t("title")}</h2>
          <p className="text-sm text-primary-foreground/70">
            {t("description")}
          </p>
        </div>
        <Link
          href="/careers"
          className="flex items-center gap-1 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors"
        >
          {t("careersSite")} <FiArrowRight />
        </Link>
      </div>
      <div className="col-span-12 grid grid-cols-2 gap-3 bg-card p-6 lg:col-span-8 lg:grid-cols-3">
        <div className="space-y-3">
          <h3 className="font-semibold text-card-foreground">{t("business.title")}</h3>
          <Link
            href="/careers/marketing"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("business.marketing")}
          </Link>
          <Link
            href="/careers/finance"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("business.finance")}
          </Link>
          <Link href="/careers/legal" className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
            {t("business.legal")}
          </Link>
          <Link href="/careers/sales" className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
            {t("business.sales")}
          </Link>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-card-foreground">{t("engineering.title")}</h3>
          <Link
            href="/careers/fullstack"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("engineering.fullstack")}
          </Link>
          <Link
            href="/careers/devops"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("engineering.devops")}
          </Link>
          <Link href="/careers/qa" className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
            {t("engineering.qa")}
          </Link>
          <Link href="/careers/data" className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
            {t("engineering.data")}
          </Link>
          <Link href="/careers/ml" className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
            {t("engineering.machineLearning")}
          </Link>
          <Link
            href="/careers/management"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("engineering.management")}
          </Link>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-card-foreground">{t("more.title")}</h3>
          <Link
            href="/careers/support"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("more.support")}
          </Link>
          <Link
            href="/careers/office"
            className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            {t("more.office")}
          </Link>
          <Link href="/careers/other" className="block text-sm text-muted-foreground hover:text-primary hover:underline transition-colors">
            {t("more.other")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CareersContent;

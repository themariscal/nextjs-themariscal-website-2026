import React from "react";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { useTranslations } from "next-intl";

const AboutUsContent = () => {
  const t = useTranslations("headerSections.aboutUs");
  return (
    <div className="grid h-fit w-full grid-cols-12 shadow-lg rounded-xl overflow-hidden lg:h-72 lg:w-[600px] xl:w-[750px]">
      <div className="col-span-12 flex flex-col justify-between bg-primary p-6 lg:col-span-4">
        <div>
          <h2 className="mb-2 text-xl font-semibold text-primary-foreground">
            {t("title")}
          </h2>
          <p className="mb-6 max-w-xs text-sm text-primary-foreground/70">
            {t("description")}
          </p>
        </div>
        <Link
          href="/about"
          className="flex items-center gap-1 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors"
        >
          {t("learnMore")} <FiArrowRight />
        </Link>
      </div>
      <div className="col-span-12 grid grid-cols-2 grid-rows-2 gap-3 bg-card p-6 lg:col-span-8">
        <Link
          href="/features"
          className="rounded-lg bg-card p-3 transition-colors hover:bg-accent"
        >
          <h3 className="mb-1 font-semibold text-card-foreground">{t("features.title")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("features.description")}
          </p>
        </Link>
        <Link
          href="/testimonials"
          className="rounded-lg bg-card p-3 transition-colors hover:bg-accent"
        >
          <h3 className="mb-1 font-semibold text-card-foreground">{t("testimonials.title")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("testimonials.description")}
          </p>
        </Link>
        <Link
          href="/press"
          className="rounded-lg bg-card p-3 transition-colors hover:bg-accent"
        >
          <h3 className="mb-1 font-semibold text-card-foreground">{t("press.title")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("press.description")}
          </p>

        </Link>
        <Link
          href="/blog"
          className="rounded-lg bg-card p-3 transition-colors hover:bg-accent"
        >
          <h3 className="mb-1 font-semibold text-card-foreground">{t("blog.title")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("blog.description")}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AboutUsContent;

import AboutUsContent from "@/components/layout/top-sections/about-us-content";
import CareersContent from "@/components/layout/top-sections/careers-content";
import PricingContent from "@/components/layout/top-sections/pricing-content";

export const getNavigationLinks = (t: (key: string) => string) => [
    {
      text: t("navigation.sobreNosotros"),
      href: "/about",
      component: AboutUsContent,
    },
    {
      text: t("navigation.precios"),
      href: "/pricing",
      component: PricingContent,
    },
    {
      text: t("navigation.carreras"),
      href: "/careers",
      component: CareersContent,
    },
    {
      text: t("navigation.documentacion"),
      href: "/docs",
    },
  ];
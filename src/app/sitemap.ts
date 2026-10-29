import type { MetadataRoute } from "next";
import { profile } from "@/content/site";

const routes = ["", "/work/hrms", "/work/solbi", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${profile.siteUrl}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

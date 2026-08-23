import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
}

const SITE_URL = "https://www.grupoavanco.com.br";

export function Seo({ title, description, path = "/" }: SeoProps) {
  useEffect(() => {
    const fullTitle = `${title} | Grupo Avanço`;
    document.title = fullTitle;
    document.documentElement.lang = "pt-BR";

    const setMeta = (selector: string, attr: string, value: string) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement("meta");
        if (selector.startsWith("meta[name=")) {
          element.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] ?? "");
        } else if (selector.startsWith("meta[property=")) {
          element.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] ?? "");
        }
        document.head.appendChild(element);
      }

      element.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", `${SITE_URL}${path}`);
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", description);

    let canonical = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = `${SITE_URL}${path}`;
  }, [description, path, title]);

  return null;
}

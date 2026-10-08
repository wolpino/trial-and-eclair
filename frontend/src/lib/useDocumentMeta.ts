import { useEffect } from "react";

type DocumentMeta = {
  title: string;
  description?: string;
  image?: string | null;
};

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
): HTMLMetaElement {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
  return element;
}

export function useDocumentMeta({ title, description, image }: DocumentMeta): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const created: HTMLMetaElement[] = [];
    const track = (element: HTMLMetaElement) => {
      created.push(element);
    };

    track(upsertMeta("property", "og:title", title));
    track(upsertMeta("name", "twitter:title", title));

    if (description) {
      track(upsertMeta("property", "og:description", description));
      track(upsertMeta("name", "description", description));
      track(upsertMeta("name", "twitter:description", description));
    }

    if (image) {
      track(upsertMeta("property", "og:image", image));
      track(upsertMeta("name", "twitter:image", image));
      track(upsertMeta("name", "twitter:card", "summary_large_image"));
    } else {
      track(upsertMeta("name", "twitter:card", "summary"));
    }

    track(upsertMeta("property", "og:type", "article"));

    return () => {
      document.title = previousTitle;
      for (const element of created) {
        element.remove();
      }
    };
  }, [title, description, image]);
}

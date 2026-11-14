import { useEffect, useState } from "react";

import { templateRepository } from "../api/templateRepository";

export function useTemplateDocuments(templateId, documents) {
  const [loadedDocuments, setLoadedDocuments] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const objectUrls = [];

    async function load() {
      try {
        setLoading(true);

        const result = await Promise.all(
          documents.map(async (document) => {
            const blob = await templateRepository.getDocumentContent(
              templateId,
              document.id,
            );

            const fileUrl = URL.createObjectURL(blob);

            objectUrls.push(fileUrl);

            return {
              ...document,
              fileUrl,
            };
          }),
        );

        if (!cancelled) {
          setLoadedDocuments(result);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;

      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [templateId, documents]);

  return {
    documents: loadedDocuments,
    loading,
  };
}

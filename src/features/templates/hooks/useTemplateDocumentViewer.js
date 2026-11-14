import { useEffect, useState } from "react";

import { readPdfPages, releasePdf } from "@/components/shared";

import { templateRepository } from "../api/templateRepository";

export function useTemplateDocumentViewer(templateId, document) {
  const [viewerDocument, setViewerDocument] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!document?.id) {
      setViewerDocument(null);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    let objectUrl = null;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const blob = await templateRepository.getDocumentContent(
          templateId,
          document.id,
        );

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);

        const pages = await readPdfPages(objectUrl);

        if (cancelled) {
          return;
        }

        setViewerDocument({
          ...document,

          fileUrl: objectUrl,

          pages,
        });
      } catch (error) {
        console.error("Template PDF could not be loaded:", error);

        if (!cancelled) {
          setViewerDocument(null);

          setError(error.message || "PDF could not be displayed.");
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

      if (objectUrl) {
        releasePdf(objectUrl).catch(() => {});

        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [templateId, document?.id]);

  return {
    document: viewerDocument,

    loading,

    error,
  };
}

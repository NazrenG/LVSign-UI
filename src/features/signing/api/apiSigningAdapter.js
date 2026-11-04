import {
  fromSigningSessionDto,
  toSigningFieldValueRequest,
  toApplyMarkRequest,
  toCreateSignatureRequest,
} from "../mappers/signingMapper";
import {
  SigningAccessDeniedError,
  SigningSessionNotFoundError,
} from "./signingErrors";
import { readPdfPages } from "@/components/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";


async function createSignatureAsset(field, mark) {
  const body = toCreateSignatureRequest(field.fieldType, mark);

  const response = await fetch(`${API_BASE_URL}/api/signing/signatures`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(body),
  });

  if (response.status === 401 || response.status === 403) {
    throw new SigningAccessDeniedError();
  }

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "The signature could not be created.");
  }

  return response.json();
}
export const apiSigningAdapter = {
  async getSession(envelopeId) {
    console.log("API SIGNING: session request");
    const response = await fetch(`${API_BASE_URL}/api/signing/${envelopeId}`);
    console.log("API SIGNING: session redponse", response.status);
    if (response.status === 404) {
      throw new SigningSessionNotFoundError(envelopeId);
    }

    if (response.status === 401 || response.status === 403) {
      throw new SigningAccessDeniedError();
    }

    if (!response.ok) {
      const message = await response.text();

      throw new Error(
        message || "The agreement could not be opened. Please try again.",
      );
    }

    const dto = await response.json();

    console.log("API SIGNING: dto received", dto);

    const session = fromSigningSessionDto(dto, {
      apiBaseUrl: API_BASE_URL,
    });

    console.log("API SIGNING: mapped", session);

    const documents = await Promise.all(
      session.documents.map(async (document) => {
        const documentResponse = await fetch(
          `${API_BASE_URL}/api/envelopes/${session.envelopeId}/documents/${document.id}/content`,
        );

        if (!documentResponse.ok) {
          throw new Error(
            `Document "${document.fileName}" could not be loaded.`,
          );
        }

        const blob = await documentResponse.blob();

        const fileUrl = URL.createObjectURL(blob);

        console.log("PDF: loading started", document.id);
        const pages = await readPdfPages(fileUrl);

        console.log("PDF: loading completed", document.id, pages);
        
        return {
          ...document,
          fileUrl,
          pages,
          pageCount: pages.length,
        };
      }),
    );

    return {
      ...session,
      documents,
    };
  },
  async saveFieldValue(envelopeId, field, value) {
    const body = toSigningFieldValueRequest(field, value);

    if (!body) {
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/signing/${envelopeId}/fields/${field.id}/value`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      },
    );

    if (response.status === 401 || response.status === 403) {
      throw new SigningAccessDeniedError();
    }

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || `"${field.label}" could not be saved.`);
    }

    return response.json();
  },
  async applyMark(envelopeId, field, mark) {
    let persistedMark = mark;

    /*
     * Typed / Drawn signature və initials
     * hələ DB-də Signature record-a malik deyil.
     */
    if (
      (field.fieldType === "signature" || field.fieldType === "initials") &&
      !mark?.sourceId
    ) {
      const created = await createSignatureAsset(field, mark);

      persistedMark = {
        ...mark,

        sourceId: created.id,

        contentUrl: created.contentUrl,
      };
    }

    /*
     * Saved signature / adopted signature:
     * sourceId artıq var, ona görə
     * createSignatureAsset çağırılmır.
     */

    const body = toApplyMarkRequest(field.fieldType, persistedMark);

    const response = await fetch(
      `${API_BASE_URL}/api/signing/${envelopeId}/fields/${field.id}/mark`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      },
    );

    if (response.status === 401 || response.status === 403) {
      throw new SigningAccessDeniedError();
    }

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || `"${field.label}" could not be applied.`);
    }

    const result = await response.json();

    return {
      ...result,

      /*
       * UI bundan sonra eyni adopted
       * signature-ı başqa field-də reuse
       * edə bilsin.
       */
      sourceId:
        result.sourceSignatureId ??
        result.sourceStampId ??
        persistedMark.sourceId,

      contentUrl: persistedMark.contentUrl ?? null,
    };
  },
  async removeMark(envelopeId, fieldId) {
    const response = await fetch(
      `${API_BASE_URL}/api/signing/${envelopeId}/fields/${fieldId}/mark`,
      {
        method: "DELETE",
      },
    );

    if (response.status === 401 || response.status === 403) {
      throw new SigningAccessDeniedError();
    }

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "The applied mark could not be removed.");
    }
  },
  async completeSigning(session) {
    const response = await fetch(
      `${API_BASE_URL}/api/signing/${session.envelopeId}/finish`,
      {
        method: "POST",
      },
    );

    if (response.status === 401 || response.status === 403) {
      throw new SigningAccessDeniedError();
    }

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "The agreement could not be completed.");
    }

    return response.json();
  },

  async declineSigning(session, reason) {
    const response = await fetch(
      `${API_BASE_URL}/api/signing/${session.envelopeId}/decline`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(reason),
      },
    );

    if (response.status === 401 || response.status === 403) {
      throw new SigningAccessDeniedError();
    }

    if (!response.ok) {
      const message = await response.text();

      throw new Error(message || "The agreement could not be declined.");
    }

    return response.json();
  },
};

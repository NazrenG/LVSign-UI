const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function getAgreements() {
  const response = await fetch(`${API_BASE_URL}/api/envelopes`);

  if (!response.ok) {
    throw new Error("Agreements could not be loaded.");
  }

  const data = await response.json();

  return data.map((item) => ({
    ...item,

    signers: (item.signers ?? []).map((signer) => ({
      ...signer,

      personId: signer.personId,
      name: signer.name,
    })),

    history: [],
  }));
}

export async function getAgreementDownloads(envelopeId) {
  const response = await fetch(
    `${API_BASE_URL}/api/envelopes/${envelopeId}/downloads`,
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "Completed files could not be loaded.");
  }

  return response.json();
}

async function downloadFile(url, fallbackFileName) {
  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "The file could not be downloaded.");
  }

  const blob = await response.blob();

  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = objectUrl;

  link.download = fallbackFileName;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(objectUrl);
}

export async function downloadSignedDocument(envelopeId, documentId, fileName) {
  const safeFileName = fileName?.replace(/\.pdf$/i, "") || "document";

  await downloadFile(
    `${API_BASE_URL}/api/envelopes/${envelopeId}/documents/${documentId}/final`,
    `${safeFileName}-signed.pdf`,
  );
}

export async function downloadCompletionCertificate(envelopeId) {
  await downloadFile(
    `${API_BASE_URL}/api/envelopes/${envelopeId}/certificate`,
    `completion-certificate-${envelopeId}.pdf`,
  );

  
}

export async function voidEnvelope(
  envelopeId,
  reason,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/envelopes/${envelopeId}/void`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        reason,
      }),
    },
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message ||
        "Envelope could not be voided.",
    );
  }
}

export async function deleteDraftEnvelope(
  envelopeId,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/envelopes/${envelopeId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const message =
      await response.text();

    throw new Error(
      message ||
        "Draft could not be deleted.",
    );
  }
}

export async function getAgreementHistory(
  envelopeId,
) {
  const response = await fetch(
    `${API_BASE_URL}/api/envelopes/${envelopeId}/history`,
  );

  if (!response.ok) {
    throw new Error(
      "Agreement history could not be loaded.",
    );
  }

  return response.json();
}

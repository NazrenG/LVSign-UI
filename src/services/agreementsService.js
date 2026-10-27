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
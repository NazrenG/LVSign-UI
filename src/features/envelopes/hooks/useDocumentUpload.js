import { useCallback, useRef, useState } from "react";

/**
 * One hidden <input type="file"> for the whole editor, so "Add document"
 * works from the documents panel, the empty canvas and the mobile sheet.
 *
 * Render `inputProps` on an <input>; call open() from any button.
 */
export function useDocumentUpload({ addDocument, onAdded }) {
  const inputRef = useRef(null);
  const [state, setState] = useState({ isUploading: false, error: null });

  const handleChange = useCallback(
    async (event) => {
      const files = [...event.target.files];
      event.target.value = "";
      if (files.length === 0) return;

      setState({ isUploading: true, error: null });
      try {
        for (const file of files) await addDocument(file);
        setState({ isUploading: false, error: null });
        onAdded?.();
      } catch (error) {
        setState({ isUploading: false, error: error.message });
      }
    },
    [addDocument, onAdded],
  );

  return {
    ...state,
    open: () => inputRef.current?.click(),
    inputProps: {
      ref: inputRef,
      type: "file",
      accept: "application/pdf,.pdf",
      multiple: true,
      hidden: true,
      onChange: handleChange,
    },
  };
}

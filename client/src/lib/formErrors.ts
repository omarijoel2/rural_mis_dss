export function applyServerErrors(setErrorFn: any, errorsPayload: Record<string, string[]>) {
  if (!setErrorFn || !errorsPayload) return;
  Object.entries(errorsPayload).forEach(([field, messages]) => {
    // Some servers use dot notation like rules.0.question
    try {
      setErrorFn(field, { type: 'server', message: (messages || []).join(' ') });
    } catch (e) {
      // try nested name fallback: replace dot with bracket syntax for array fields
      const alt = field.replace(/\.(\d+)\./g, '[$1].');
      try {
        setErrorFn(alt, { type: 'server', message: (messages || []).join(' ') });
      } catch (e2) {
        // ignore - field mapping might not exist in form
        console.warn('Failed to map server error to form field:', field);
      }
    }
  });
}

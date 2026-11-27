declare function saveDraft(text: string): Promise<void>;
declare function showSaveError(error: unknown): void;

export function SilentAutosave({ text }: { text: string }) {
  return (
    <textarea
      aria-label="Order notes"
      defaultValue={text}
      onBlur={() => {
        // expect: error sonsu-lee-eslint/no-ignored-rejection -- Leaving the notes field can lose the draft without warning.
        saveDraft(text).catch(() => {});
      }}
    />
  );
}

export function Autosave({ text }: { text: string }) {
  return (
    <textarea
      aria-label="Order notes"
      defaultValue={text}
      onBlur={() => {
        saveDraft(text).catch(showSaveError);
      }}
    />
  );
}

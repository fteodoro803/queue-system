type ThemeRollbackInput = {
  baselineTheme?: string | null;
  draftTheme?: string | null;
};

export const shouldRollbackUnsavedTheme = ({
  baselineTheme,
  draftTheme,
}: ThemeRollbackInput): boolean => {
  if (!baselineTheme || !draftTheme) return false;
  return baselineTheme !== draftTheme;
};


import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const THEME_STORAGE_KEY = "te-theme";
const FONT_STORAGE_KEY = "te-font";

export const THEME_PRESETS = [{ id: "default", label: "Warm kitchen" }] as const;
export const FONT_PRESETS = [{ id: "default", label: "Serif (Iowan)" }] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number]["id"];
export type FontPresetId = (typeof FONT_PRESETS)[number]["id"];

type ThemeContextValue = {
  theme: ThemePresetId;
  font: FontPresetId;
  setTheme: (theme: ThemePresetId) => void;
  setFont: (font: FontPresetId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemePresetId {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && THEME_PRESETS.some((preset) => preset.id === stored)) {
    return stored as ThemePresetId;
  }
  return "default";
}

function readStoredFont(): FontPresetId {
  const stored = localStorage.getItem(FONT_STORAGE_KEY);
  if (stored && FONT_PRESETS.some((preset) => preset.id === stored)) {
    return stored as FontPresetId;
  }
  return "default";
}

function applyThemeAttributes(theme: ThemePresetId, font: FontPresetId): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.font = font;
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePresetId>(readStoredTheme);
  const [font, setFontState] = useState<FontPresetId>(readStoredFont);

  useLayoutEffect(() => {
    applyThemeAttributes(theme, font);
  }, [theme, font]);

  const setTheme = useCallback((next: ThemePresetId) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const setFont = useCallback((next: FontPresetId) => {
    setFontState(next);
    localStorage.setItem(FONT_STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ theme, font, setTheme, setFont }),
    [theme, font, setTheme, setFont],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

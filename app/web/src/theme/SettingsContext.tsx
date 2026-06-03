import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DEFAULT_THEME, ThemeId } from "./themes";

interface Settings {
  theme: ThemeId;
  animations: boolean;
  scanlines: boolean;
}

interface SettingsContextValue extends Settings {
  setTheme: (theme: ThemeId) => void;
  setAnimations: (value: boolean) => void;
  setScanlines: (value: boolean) => void;
}

const STORAGE_KEY = "codehub:settings";

const DEFAULTS: Settings = {
  theme: DEFAULT_THEME,
  animations: true,
  scanlines: true,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
    }
  } catch {
    /* ignora storage corrompido/indisponível */
  }
  return DEFAULTS;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignora */
    }
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.classList.toggle("no-anim", !settings.animations);
    root.classList.toggle("scanlines", settings.scanlines);
  }, [settings]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
      setAnimations: (animations) => setSettings((s) => ({ ...s, animations })),
      setScanlines: (scanlines) => setSettings((s) => ({ ...s, scanlines })),
    }),
    [settings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings deve ser usado dentro de <SettingsProvider>");
  }
  return ctx;
}

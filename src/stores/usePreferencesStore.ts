import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { THEME, LANGUAGE, type Theme, type Language } from '@/constants'

interface PreferencesState {
  theme: Theme
  language: Language
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  toggleTheme: () => void
  toggleLanguage: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    set => ({
      theme: THEME.DARK,
      language: LANGUAGE.EN,
      setTheme: theme => set({ theme }),
      setLanguage: language => set({ language }),
      toggleTheme: () => set(state => ({
        theme: state.theme === THEME.LIGHT ? THEME.DARK : THEME.LIGHT,
      })),
      toggleLanguage: () => set(state => ({
        language: state.language === LANGUAGE.EN ? LANGUAGE.ZH : LANGUAGE.EN,
      })),
    }),
    {
      name: 'devlens-preferences',
    },
  ),
)

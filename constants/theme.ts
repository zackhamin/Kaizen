// Add this to your existing theme.ts file

export const colors = {
  background: {
    light: '#F5F7FA', // Cool neutral grey-white
    dark: '#1A1D23', // Deep charcoal
  },
  
  // Primary colors - Navy blue (trust, stability, professionalism)
  primary: {
    main: '#2C5282', // Strong navy blue
    light: '#4A90B8', // Lighter navy
    dark: '#1A365D', // Darker navy
  },
  
  // Secondary colors - Forest green (growth, resilience, nature)
  secondary: {
    main: '#2F855A', // Forest green
    light: '#48BB78', // Lighter green
    dark: '#1A202C', // Very dark green-grey
  },
  
  // Accent colors
  accent: {
    steel: '#718096', // Steel grey (industrial, strong)
    copper: '#C05621', // Warm copper (energy, determination)
    charcoal: '#2D3748', // Deep charcoal
    slate: '#4A5568', // Slate grey
    white: '#FFFFFF',
  },
  
  // Error colors
  error: {
    main: '#E53E3E', // Strong red
    light: '#FC8181',
  },
  
  // Success colors
  success: {
    main: '#38A169', // Forest green
    light: '#68D391',
  },
  
  // Warning colors
  warning: {
    main: '#D69E2E', // Warm amber
    light: '#F6E05E',
  },
  
  // Text colors
  text: {
    primary: {
      light: '#1A202C', // Very dark grey
      dark: '#F7FAFC', // Off-white
    },
    secondary: {
      light: '#4A5568', // Medium grey
      dark: '#A0AEC0', // Light grey
    },
    muted: {
      light: '#718096', // Steel grey
      dark: '#718096', // Steel grey
    },
    disabled: {
      light: '#CBD5E0', // Very light grey (40% opacity feel)
      dark: '#4A5568', // Darker grey for dark mode
    },
  },
  
  // UI colors
  ui: {
    border: {
      light: '#E2E8F0', // Light border
      dark: '#2D3748', // Dark border
    },
    surface: {
      light: '#FFFFFF', // White surface
      dark: '#2D3748', // Dark surface
    },
    muted: {
      light: '#F7FAFC', // Very light grey
      dark: '#1A202C', // Very dark grey
    },
    focus: '#4299E1', // Bright blue for focus states
    disabled: {
      light: '#F7FAFC', // Very light grey background
      dark: '#2D3748', // Dark grey background
    },
  },

  // Calendar-specific colors
  calendar: {
    selected: {
      light: '#2C5282', // primary.main
      dark: '#4A90B8', // primary.light for better contrast on dark
    },
    cardBackground: {
      light: '#FFFFFFF2', // ui.surface.light with 95% opacity
      dark: '#2D3748E6', // ui.surface.dark with 90% opacity
    },
    indicator: {
      default: '#2C5282', // primary.main
      partial: '#D69E2E', // warning.main
      complete: '#38A169', // success.main
      mood: '#E53E3E', // error.main
    },
    disabled: {
      background: {
        light: '#F7FAFC', // Very muted background
        dark: '#1A202C', // Very dark background
      },
      text: {
        light: '#CBD5E0', // Very light grey text
        dark: '#4A5568', // Dark grey text
      },
      border: {
        light: '#E2E8F0', // Light border
        dark: '#2D3748', // Dark border
      },
    },
  },
};

export const theme = {
  colors,
  
  // Typography weights that feel more masculine
  typography: {
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Spacing system
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius - slightly more angular
  borderRadius: {
    small: 4,
    medium: 6,
    large: 8,
  },
  
  // Opacity values for disabled states
  opacity: {
    disabled: 0.4,
    muted: 0.6,
    overlay: 0.8,
  },
};
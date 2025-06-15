
export interface CalendarBarProps {
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    hasDataForDate?: (date: Date) => boolean;
    getDataIndicator?: (date: Date) => 'none' | 'partial' | 'complete' | 'mood';
    theme?: 'light' | 'dark';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
  }
  
  export interface SizeConfig {
    daySize: number;
    fontSize: number;
    dayLetterSize: number;
    indicatorSize: number;
    spacing: number;
    padding: number;
  }
  
  export const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  export const DAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
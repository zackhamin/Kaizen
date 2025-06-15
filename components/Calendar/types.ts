
export interface CalendarProps {
    selectedDate?: Date;
    onDateChange?: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    showMonthNavigation?: boolean;
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    highlightToday?: boolean;
    showSelectedDate?: boolean;
  }
  
  export interface SizeConfig {
    daySize: number;
    fontSize: number;
    headerFontSize: number;
    padding: number;
    spacing: number;
  }
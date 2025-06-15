import { Ionicons } from "@expo/vector-icons";

export interface SupportService {
    name: string;
    phone: string;
    hours: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    urgent?: boolean;
    specialty?: string;
  }
  
  export interface SOSModalProps {
    visible: boolean;
    onClose: () => void;
  }

  export interface USASOSModalProps {
    visible: boolean;
    onClose: () => void;
    theme?: 'light' | 'dark';
    size?: 'small' | 'medium' | 'large';
  }
  
  export interface SizeConfig {
    fontSize: number;
    buttonHeight: number;
    spacing: number;
    padding: number;
  }
  
  export interface EmergencyService {
    name: string;
    number: string;
    description: string;
    icon: string;
    color: string;
    priority: 'high' | 'medium' | 'low';
    category: 'crisis' | 'specialized' | 'support';
  }
  
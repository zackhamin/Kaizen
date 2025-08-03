import { DeepPartial, Theme } from 'stream-chat-react-native';
import { colors } from './theme';

export const customStreamTheme: DeepPartial<Theme> = {
  colors: {
    // Remove all default backgrounds
    white: 'transparent',
    white_snow: 'transparent',
    grey_gainsboro: 'transparent',
    grey_whisper: 'transparent',
    blue_alice: 'transparent',
    
    // Text colors
    black: colors.glass.text.primary,
    grey: colors.glass.text.secondary,
    grey_dark: colors.glass.text.muted,
  },
  
  // Fix message bubbles
  messageSimple: {
    content: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        marginHorizontal: 0,
        marginVertical: 2,
      },
      textContainer: {
        backgroundColor: colors.glass.userBubble,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.glass.overlayBorder,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: '80%',
        alignSelf: 'flex-end',
      },
      wrapper: {
        backgroundColor: 'transparent',
      },
      markdown: {
        text: {
          color: colors.glass.text.primary,
          fontSize: 16,
        },
      },
    },
  },
  
  // Fix thread container
  thread: {
    container: {
      backgroundColor: 'transparent',
      flex: 1,
    },
  },
  
  // Fix message input
  messageInput: {
    container: {
      backgroundColor: colors.glass.inputBackground,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.glass.inputBorder,
      marginHorizontal: 16,
      marginVertical: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    inputBox: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      color: colors.glass.text.primary,
      fontSize: 16,
      paddingHorizontal: 8,
    },
    sendButton: {
      backgroundColor: colors.primary.main,
      borderRadius: 20,
      width: 40,
      height: 40,
      marginLeft: 8,
    },
  },
  
  // Fix message list
  messageList: {
    container: {
      backgroundColor: 'transparent',
      paddingHorizontal: 0,
    },
  },
};
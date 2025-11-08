import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricCapabilities {
  isAvailable: boolean;
  supportedTypes: BiometricType[];
  isEnrolled: boolean;
}

/**
 * Check device biometric capabilities
 */
export async function checkBiometricCapabilities(): Promise<BiometricCapabilities> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return {
        isAvailable: false,
        supportedTypes: ['none'],
        isEnrolled: false,
      };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const types: BiometricType[] = supportedTypes.map((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'facial';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'iris';
        default:
          return 'none';
      }
    }).filter((t) => t !== 'none') as BiometricType[];

    return {
      isAvailable: hasHardware && isEnrolled,
      supportedTypes: types.length > 0 ? types : ['none'],
      isEnrolled,
    };
  } catch (error) {
    console.error('Error checking biometric capabilities:', error);
    return {
      isAvailable: false,
      supportedTypes: ['none'],
      isEnrolled: false,
    };
  }
}

/**
 * Authenticate user with biometrics
 */
export async function authenticateWithBiometrics(
  promptMessage: string = 'Authenticate to continue'
): Promise<{ success: boolean; error?: string }> {
  try {
    const capabilities = await checkBiometricCapabilities();

    if (!capabilities.isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication not available',
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use passcode',
    });

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      error: result.error || 'Authentication failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get friendly name for biometric type
 */
export function getBiometricTypeName(type: BiometricType): string {
  switch (type) {
    case 'fingerprint':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    case 'facial':
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    case 'iris':
      return 'Iris Recognition';
    default:
      return 'Biometric Authentication';
  }
}

/**
 * Check if device supports Face ID (iOS only)
 */
export async function supportsFaceID(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
}

/**
 * Check if device supports Touch ID / Fingerprint
 */
export async function supportsTouchID(): Promise<boolean> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
}

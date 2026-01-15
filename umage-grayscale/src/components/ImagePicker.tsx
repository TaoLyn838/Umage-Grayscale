import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { WebView } from 'react-native-webview';

type MutableRef<T> = {
  current: T;
};

type UseImagePickerOptions = {
  webViewRef: RefObject<WebView | null>;
  webViewReadyRef: MutableRef<boolean>;
  processingTimeoutRef: MutableRef<ReturnType<typeof setTimeout> | null>;
  setLoading?: (loading: boolean) => void;
  onOriginalImage?: (uri: string) => void;
  onProcessedImage?: (uri: string | null) => void;
  maxDimension?: number;
  enabled?: boolean;
};

export const useImagePicker = ({
  webViewRef,
  webViewReadyRef,
  processingTimeoutRef,
  setLoading,
  onOriginalImage,
  onProcessedImage,
  maxDimension = 800,
  enabled = true,
}: UseImagePickerOptions) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied');
      }
    })();
  }, [enabled]);

  const pickImage = async () => {
    if (!enabled) {
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.6,
        base64: true,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageUri = asset.uri;
        const imageBase64 = asset.base64;

        if (!imageBase64) {
          Alert.alert('Error', 'Unable to read image data.');
          return;
        }

        if (asset.width > maxDimension * 2 || asset.height > maxDimension * 2) {
          Alert.alert(
            'Large Image Detected',
            `Image is ${asset.width}x${asset.height}px. It will be automatically resized to ${maxDimension}px for faster processing.`,
            [{ text: 'OK' }]
          );
        }

        onOriginalImage?.(imageUri);
        onProcessedImage?.(null);

        if (!webViewReadyRef.current) {
          Alert.alert(
            'Not Ready',
            'WebView is still initializing Pyodide. Please wait a moment and try again.'
          );
          setLoading?.(false);
          return;
        }

        setLoading?.(true);

        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }

        processingTimeoutRef.current = setTimeout(() => {
          setLoading?.(false);
          Alert.alert(
            'Processing Timeout',
            'Image processing is taking too long. The image may be too large. Please try a smaller image (max 800x800px recommended).'
          );
        }, 30000);

        const message = {
          type: 'processImage',
          data: imageBase64,
          filter: 'grayscale',
          maxDimension,
        };

        if (webViewRef.current) {
          webViewRef.current.postMessage(JSON.stringify(message));
        } else {
          Alert.alert('Error', 'WebView reference is not available');
          setLoading?.(false);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick image: ' + (error?.message || error));
      setLoading?.(false);
    }
  };

  return { pickImage };
};
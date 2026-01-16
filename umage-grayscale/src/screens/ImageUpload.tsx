import { useRef, useState, useEffect } from 'react';
import { Alert, Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Header, useImagePicker } from '../components';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';

interface ImageUploadScreenProps {
    imageURL: string | null;
    setImageURL: (url: string | null) => void;
    setHasImage: (hasImage: boolean) => void;
    setOriginalImageURL: (url: string | null) => void;
}

const ImageUploadScreen = ({
    imageURL,
    setImageURL,
    setHasImage,
    setOriginalImageURL,
}: ImageUploadScreenProps) => {
    const webViewRef = useRef<WebView>(null);
    const webViewReadyRef = useRef(false);
    const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [loading, setLoading] = useState(false);
    const [webStatus, setWebStatus] = useState<string | null>(null);
    const isWeb = Platform.OS === 'web';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webviewHtmlUri = Asset.fromModule(require('../../public/webview.html')).uri;

    const { pickImage } = useImagePicker({
        webViewRef,
        webViewReadyRef,
        processingTimeoutRef,
        setLoading,
        onOriginalImage: setOriginalImageURL,
        onProcessedImage: setImageURL,
        enabled: true,
    });

    const notify = (title: string, message: string) => {
        if (isWeb && typeof window !== 'undefined' && window.alert) {
            window.alert(title ? `${title}: ${message}` : message);
        } else {
            Alert.alert(title || 'Notice', message);
        }
    };

    const normalizeBase64Result = (result: unknown) => {
        if (typeof result === 'string') {
            return result.trim();
        }
        return '';
    };

    const handleWebFileUpload = async (event: any) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!webViewReadyRef.current) {
            const message = 'WebView is still initializing. Please wait and try again.';
            setWebStatus(message);
            notify('Not Ready', message);
            return;
        }

        try {
            setLoading(true);
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                setOriginalImageURL(dataUrl);

                // Send to WebView for processing (Unified Logic)
                const message = {
                    type: 'processImage',
                    data: dataUrl.split(',')[1], // Send base64 part
                    filter: 'grayscale',
                    maxDimension: 800,
                };

                if (isWeb) {
                    // Post to iframe
                    const iframe = document.getElementById('pyodide-frame') as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage(JSON.stringify(message), '*');
                    } else {
                        Alert.alert('Error', 'Iframe not ready');
                        setLoading(false);
                    }
                } else if (webViewRef.current) {
                    webViewRef.current.postMessage(JSON.stringify(message));
                } else {
                    Alert.alert('Error', 'WebView reference is not available');
                    setLoading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Error', error?.message || 'Failed to process image.');
        }
    };

    const handleWebViewMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            if (message.type === 'ready') {
                webViewReadyRef.current = true;
                setWebStatus(null);
                return;
            }

            if (message.type === 'progress') {
                setWebStatus(message.message || 'Initializing image engine...');
                return;
            }

            if (message.type === 'result') {
                if (processingTimeoutRef.current) {
                    clearTimeout(processingTimeoutRef.current);
                }
                setLoading(false);
                const data = normalizeBase64Result(message.data);
                if (!data) {
                    console.error('[WebView] Empty processed image payload');
                    return;
                }
                const formatted = data.startsWith('data:')
                    ? data
                    : `data:image/jpeg;base64,${data}`;
                setImageURL(formatted);
                setHasImage(true);
                return;
            }

            if (message.type === 'error') {
                setLoading(false);
                Alert.alert('Error', message.message || 'Failed to process image.');
            }
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Error', error?.message || 'Failed to parse message.');
        }
    };

    // Listen for messages from iframe on Web
    useEffect(() => {
        if (!isWeb) return;

        const handleMessage = (event: MessageEvent) => {
            if (typeof event.data === 'string') {
                // Reuse the existing handler logic by mocking the event structure
                handleWebViewMessage({ nativeEvent: { data: event.data } });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [isWeb]);

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.centeredContent}>
                <Card style={styles.card}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.cardTitle}>Upload Image</Text>

                        <View style={styles.uploadAreaEnhanced}>
                            <View style={styles.iconOuterContainer}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="arrow-up-outline" size={32} color="#ffffff" />
                                </View>
                            </View>
                            <Text style={styles.instructionsEnhanced}>
                                Select an image to convert to grayscale
                            </Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (isWeb) {
                                        fileInputRef.current?.click();
                                        return;
                                    }
                                    pickImage();
                                }}
                            >
                                <Text style={styles.selectButtonText}>Select File</Text>
                            </TouchableOpacity>
                            {isWeb && (
                                // @ts-ignore - web only input
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleWebFileUpload}
                                />
                            )}
                        </View>

                        {isWeb && webStatus && (
                            <Text style={styles.webStatusText}>{webStatus}</Text>
                        )}
                        <Text style={styles.supportedTypes}>Supported formats: JPG, PNG, GIF</Text>
                    </View>
                </Card>
            </View>
            {isWeb ? (
                <iframe
                    id="pyodide-frame"
                    src={webviewHtmlUri}
                    style={{ width: 0, height: 0, border: 0, opacity: 0 }}
                />
            ) : (
                <WebView
                    ref={webViewRef}
                    source={{ uri: webviewHtmlUri }}
                    onMessage={handleWebViewMessage}
                    style={styles.hiddenWebView}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: '100%',
        flexDirection: 'column',
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
    },
    contentContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.91)',
        marginBottom: 30,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    uploadAreaEnhanced: {
        width: '100%',
        borderWidth: 1.5,
        borderColor: 'rgba(232, 229, 229, 0.4)',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 40,
        paddingHorizontal: 20,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconOuterContainer: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 1.5,
        borderColor: 'rgba(232, 216, 216, 0.4)',
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    instructionsEnhanced: {
        color: 'rgba(255, 255, 255, 0.81)',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 28,
        fontWeight: '500',
    },
    selectButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 14,
        paddingHorizontal: 36,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    selectButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    webStatusText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
    },
    supportedTypes: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        textAlign: 'center',
    },
    hiddenWebView: {
        width: 0,
        height: 0,
        opacity: 0,
    },
});

export default ImageUploadScreen;

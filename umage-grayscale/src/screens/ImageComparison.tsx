import { useState } from 'react';
import { Alert, Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Card, Header } from '../components';

interface ImageComparisonScreenProps {
    imageURL: string;
    originalImageURL: string;
    onReset: () => void;
}

const ImageComparisonScreen = ({
    imageURL,
    originalImageURL,
    onReset,
}: ImageComparisonScreenProps) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [showCoachMark, setShowCoachMark] = useState(true);
    const [containerWidth, setContainerWidth] = useState(0);

    const handleDownload = () => {
        if (Platform.OS === 'web') {
            const link = document.createElement('a');
            link.href = imageURL;
            link.download = 'grayscale.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        Alert.alert('Download', 'Download is only supported on web for now.');
    };

    const renderRightActions = () => (
        <View style={styles.actions}>
            <TouchableOpacity style={styles.iconButton} onPress={handleDownload}>
                <Ionicons name="download-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onReset}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.centeredContent}>
                <Card title="Result" rightAction={renderRightActions()} style={styles.card}>
                    <View
                        style={styles.imageWrapper}
                        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={(event) => {
                            if (containerWidth <= 0) {
                                return;
                            }
                            const next = Math.min(
                                100,
                                Math.max(0, (event.nativeEvent.locationX / containerWidth) * 100)
                            );
                            setSliderPosition(next);
                            setShowCoachMark(false);
                        }}
                        onResponderMove={(event) => {
                            if (containerWidth <= 0) {
                                return;
                            }
                            const next = Math.min(
                                100,
                                Math.max(0, (event.nativeEvent.locationX / containerWidth) * 100)
                            );
                            setSliderPosition(next);
                        }}
                    >
                        <View style={styles.imageLayer}>
                            <Image
                                source={{ uri: imageURL }}
                                style={styles.image}
                                contentFit="cover"
                            />
                            <View style={styles.badgeLeft}>
                                <Text style={styles.badgeText}>Grayscale</Text>
                            </View>
                        </View>

                        <View
                            style={[
                                styles.imageLayer,
                                {
                                    width: `${sliderPosition}%`,
                                    overflow: 'hidden',
                                    zIndex: 5
                                },
                            ]}
                        >
                            <Image
                                source={{ uri: originalImageURL }}
                                style={[
                                    styles.image,
                                    { width: containerWidth }
                                ]}
                                contentFit="cover"
                            />
                            <View style={styles.badgeRight}>
                                <Text style={styles.badgeText}>Original</Text>
                            </View>
                        </View>

                        <View
                            style={[
                                styles.sliderLine,
                                { left: `${sliderPosition}%` },
                            ]}
                        >
                            <View style={styles.sliderHandle}>
                                <Ionicons name="resize-outline" size={20} color="#3f1f1f" />
                            </View>
                        </View>

                        {showCoachMark && (
                            <View style={styles.coachMark}>
                                <View style={styles.coachBubble}>
                                    <Text style={styles.coachText}>
                                        Slide to compare before & after
                                    </Text>
                                    <View style={styles.coachArrow} />
                                </View>
                            </View>
                        )}
                    </View>
                </Card>
            </View>
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
        flex: 1,
        maxHeight: 600,
        maxWidth: 600,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    imageWrapper: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    imageLayer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badgeLeft: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badgeRight: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    sliderLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.8)',
        transform: [{ translateX: -1 }],
        zIndex: 10,
    },
    sliderHandle: {
        position: 'absolute',
        top: '50%',
        left: -20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY: -22 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    coachMark: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: [{ translateX: -160 }, { translateY: -90 }],
        zIndex: 20,
    },
    coachBubble: {
        backgroundColor: '#881C1C',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    coachText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    coachArrow: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        marginLeft: -6,
        width: 12,
        height: 12,
        backgroundColor: '#881C1C',
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        transform: [{ rotate: '45deg' }],
    },
});

export default ImageComparisonScreen;

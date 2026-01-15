import { ImageUploadScreen, ImageComparisonScreen } from '@/src/screens';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
    const [hasImage, setHasImage] = useState(false);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [originalImageURL, setOriginalImageURL] = useState<string | null>(null);

    const handleReset = () => {
        setHasImage(false);
        setImageURL(null);
        setOriginalImageURL(null);
    };

    return (
        <LinearGradient
            colors={['#7A1515', '#2D0505']} // Rich Maroon to Deep Dark Maroon
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.RootContainer}
        >
            <View style={styles.ScreenContainer}>
                {hasImage && imageURL ? (
                    <ImageComparisonScreen
                        imageURL={imageURL}
                        originalImageURL={originalImageURL ?? imageURL}
                        onReset={handleReset}
                    />
                ) : (
                    <ImageUploadScreen
                        imageURL={imageURL}
                        setImageURL={setImageURL}
                        setHasImage={setHasImage}
                        setOriginalImageURL={setOriginalImageURL}
                    />
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    RootContainer: {
        flex: 1,
        minHeight: '100%',
    },
    ScreenContainer: {
        flex: 1,
        position: 'relative',
        zIndex: 10,
        paddingHorizontal: 24,
        paddingBottom: 96,
        flexDirection: 'column',
        display: 'flex',
    },
});
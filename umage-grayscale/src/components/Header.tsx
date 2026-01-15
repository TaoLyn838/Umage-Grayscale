import { Text, View, StyleSheet } from 'react-native';

const Header = () => {
    return (
        <View style={styles.header}>
            <View style={styles.headerInner}>
                <Text style={styles.title}>UMage-Grayscale</Text>
            </View>
            <Text style={styles.subtitle}>
                Image Grayscale Converter
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: 'relative',
        zIndex: 10,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        backgroundColor: 'transparent',
    },
    headerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: -0.5,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginTop: 8,
    },
});

export default Header;
export type SelectedImage = {
    uri: string;
    base64: string; // includes data URL prefix
    mimeType: string;
};

export type PreviewProps = {
    label: string;
    uri: string;
    loading?: boolean;
};

export type ActionButtonProps = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
};

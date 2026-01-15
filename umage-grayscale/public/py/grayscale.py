import base64
import numpy as np

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    print("OpenCV not available, falling back to NumPy-only grayscale")


def decode_base64_image(base64_string):
    if not OPENCV_AVAILABLE:
        raise ImportError(
            "OpenCV is required for image decoding in this build.")

    if ',' in base64_string:
        base64_string = base64_string.split(",", 1)[1]

    decoded_bytes = base64.b64decode(base64_string.strip())

    decoded_bytes = np.frombuffer(decoded_bytes, np.uint8)
    opencv_format_image = cv2.imdecode(decoded_bytes, cv2.IMREAD_COLOR)

    return opencv_format_image


def encode_image_to_base64(image_array):
    if not OPENCV_AVAILABLE:
        raise ImportError(
            "OpenCV is required for image encoding in this build.")

    success, encoded_image_as_bytes = cv2.imencode('.jpg', image_array)

    if success:
        base64_string = base64.b64encode(
            encoded_image_as_bytes.tobytes()).decode('utf-8')
    else:
        raise ValueError("cv2.imencode failed")

    return base64_string


def apply_grayscale_filter(base64_string, max_dimension=800):
    opencv_format_image = decode_base64_image(base64_string)

    if opencv_format_image is None:
        raise ValueError(
            "Failed to decode image. Image may be corrupted or in unsupported format.")

    height, width = opencv_format_image.shape[:2]

    if width > max_dimension or height > max_dimension:
        aspect_ratio = width / height

        if width > height:
            new_width = max_dimension
            new_height = int(max_dimension / aspect_ratio)
        else:
            new_height = max_dimension
            new_width = int(max_dimension * aspect_ratio)

        if OPENCV_AVAILABLE:
            opencv_format_image = cv2.resize(
                opencv_format_image,
                (new_width, new_height),
                interpolation=cv2.INTER_AREA
            )
        else:
            print(
                f"Warning: Resizing without OpenCV may be slow. Image will be processed at {new_width}x{new_height}")
            pass

    if OPENCV_AVAILABLE:
        if len(opencv_format_image.shape) == 2:
            gray = opencv_format_image
        else:
            gray = cv2.cvtColor(opencv_format_image, cv2.COLOR_BGR2GRAY)
    else:
        if len(opencv_format_image.shape) == 2:
            gray = opencv_format_image
        else:
            gray = np.dot(opencv_format_image, [
                          0.114, 0.587, 0.299]).astype(np.uint8)

    return encode_image_to_base64(gray)


def apply_edge_detection_filter(base64_string):
    if not OPENCV_AVAILABLE:
        return apply_grayscale_filter(base64_string)

    img = decode_base64_image(base64_string)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, threshold1=100, threshold2=200)

    return encode_image_to_base64(edges)

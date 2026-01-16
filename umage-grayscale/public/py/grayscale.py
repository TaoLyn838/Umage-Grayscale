import base64
import io
from PIL import Image, ImageFilter


def decode_base64_image(base64_string):
    if ',' in base64_string:
        base64_string = base64_string.split(",", 1)[1]

    decoded_bytes = base64.b64decode(base64_string.strip())
    image = Image.open(io.BytesIO(decoded_bytes))
    return image


def encode_image_to_base64(image_array):
    buffer = io.BytesIO()
    image_array.save(buffer, format='JPEG', quality=90)
    return base64.b64encode(buffer.getvalue()).decode('utf-8')


def apply_grayscale_filter(base64_string, max_dimension=800):
    image = decode_base64_image(base64_string)

    if image is None:
        raise ValueError(
            "Failed to decode image. Image may be corrupted or in unsupported format.")

    if image.mode not in ("RGB", "RGBA", "L"):
        image = image.convert("RGB")

    width, height = image.size
    if width > max_dimension or height > max_dimension:
        resampling = getattr(Image, "Resampling", Image).LANCZOS
        image.thumbnail((max_dimension, max_dimension), resampling)

    gray = image.convert("L")
    return encode_image_to_base64(gray)


def apply_edge_detection_filter(base64_string):
    image = decode_base64_image(base64_string)
    edges = image.convert("L").filter(ImageFilter.FIND_EDGES)
    return encode_image_to_base64(edges)

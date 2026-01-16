# Technical Assessment: Browser-Side Image Processor

The project is built using **Expo** with **React Native** and **TypeScript**, utilizing **Expo Router** for file-based routing. The application follows a component-based architecture with a clear separation between UI components, screens, and the image processing logic that runs in Python via **Pyodide**.

Coding Time spent: **2** hours

Design + Readme + Deploy Time spent: around one hour

## Technical Requirements

### 1. Pyodide Integration

- [x] All image processing logic must be written in Python and executed via the Pyodide runtime. You should leverage Python libraries (like Pillow or numpy) to handle the conversion.

### 2. Required Features and UI

**Features:**

- [x] Image upload via file picker or drag-and-drop.
- [x] A clear "Convert to Grayscale" action.
- [x] A side-by-side or "before/after" comparison of the original and processed images.
- [x] An option to download the final grayscale image.

## Design

This section describes the technical solution and code design choices for the Browser-Side Image Processor. Here is the **Figma** link for the UI design of this app: https://www.figma.com/board/utAsgVKRT5XR1ZQ48M4FhP/Umage-Scale?node-id=0-1&t=Z7Af5aRDuI7HgrlS-1

### Technical solution and code design choices

The main reason I chose this technical solution is that it covers all the technical questions from the previous **Google Form**, allowing me to demonstrate my coding skills, code quality, and architectural style through this assessment.

### Handled the JS-Python bridge and UI State Management

The app is built around a simple three-part setup that connects **JavaScript** and **Python**.  
It uses **React Native** for the UI — such as picking and displaying images — while a **WebView** runs **Pyodide** and handles communication between the two sides.

Image processing is done in Python inside `public/py/grayscale.py`, which uses the **Pillow** library to apply filters and produce results.

Data exchange between React and Pyodide happens through **JSON messages**, keeping the interface responsive and interactions smooth.

UI state is managed with a custom React hook called `useImagePicker`, which takes care of:

- Selecting images
- Converting them to base64
- Updating the state
- Handling errors

This approach keeps logic organized and makes it easy to switch between uploading and comparing images while keeping components clear and independent. You can see more details in the Project Architecture section below.

## Get started

1. Set up Python environment (optional, for local testing)

   For local Python development and testing outside of Pyodide:

   ```bash
   # Create a virtual environment
   python -m venv venv

   # Activate the virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   # venv\Scripts\activate

   # Install Python dependencies
   pip install -r requirements.txt
   ```

   **Note:** The Python code runs in Pyodide (browser-based runtime) in the actual application, so this step is only necessary if you want to test the Python code locally.

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Project Architecture

### Directory Structure

```
umage-grayscale/
├── app/                    # Expo Router file-based routing
│   ├── (tabs)/            # Tab navigation layout
│   │   ├── _layout.tsx    # Tab layout configuration
│   │   └── index.tsx      # Main screen (home)
│   ├── _layout.tsx        # Root layout with navigation
│   └── modal.tsx          # Modal screen
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Card.tsx       # Card component for UI elements
│   │   ├── Header.tsx     # App header component
│   │   ├── ImagePicker.tsx # Image selection and processing hook
│   │   └── index.tsx      # Component exports
│   ├── screens/           # Screen components
│   │   ├── ImageUpload.tsx      # Image upload/selection screen
│   │   ├── ImageComparison.tsx  # Before/after comparison screen
│   │   └── index.tsx            # Screen exports
│   ├── styles/            # Global styles
│   │   └── index.css
│   └── types/             # TypeScript type definitions
│       └── index.ts
├── public/
│   ├── py/                # Python scripts for Pyodide
│   │   └── grayscale.py   # Image processing logic (Pillow)
│   └── webview.html       # WebView HTML for Pyodide bridge
├── assets/                # Static assets (images, icons)
└── scripts/               # Build and utility scripts
```

### Architecture Components

#### 1. **Frontend (React Native / Expo)**

- **Framework**: React Native with Expo SDK
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript
- **State Management**: React Hooks (useState, useRef)

#### 2. **Image Processing (Python/Pyodide)**

- **Runtime**: Pyodide (Python in the browser)
- **Location**: `public/py/grayscale.py`
- **Libraries**:
  - Pillow for image decoding/encoding, resize, and grayscale conversion
  - Base64 for data encoding/decoding
- **Bridge**: WebView (`public/webview.html`) handles communication between React Native and Pyodide

#### 3. **Data Flow**

1. **Image Selection**: User selects an image via `ImagePicker` component
2. **Image Upload**: Image is converted to base64 and passed to WebView
3. **WebView Bridge**: `webview.html` receives the image data via `postMessage`
4. **Python Processing**: Pyodide executes `grayscale.py` functions to process the image
5. **Result Return**: Processed image (base64) is sent back via `postMessage`
6. **UI Update**: React Native state is updated with processed image URL
7. **Display**: User sees before/after comparison in `ImageComparisonScreen`

## OpenCV Removal (Web Performance)

OpenCV has been removed from the Pyodide pipeline and replaced with Pillow for decoding, resizing, and grayscale conversion. The reason is performance: the `opencv-python` package is very large in Pyodide, which significantly increases first-load time on GitHub Pages. Pillow is much smaller and still satisfies the requirement to use Python libraries for the conversion, so startup is faster while keeping the same features.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

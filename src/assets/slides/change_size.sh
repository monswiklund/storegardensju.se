#!/bin/bash

# A script to resize all images in the current directory
# You need to have ImageMagick installed: brew install imagemagick (on macOS)

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Install with: brew install imagemagick"
    exit 1
fi

# Default values
WIDTH=800
HEIGHT=1200
CURRENT_DIR=$(pwd)
SOURCE_DIR="$CURRENT_DIR"
TARGET_DIR="$CURRENT_DIR/resized"
FORMAT="jpg"

# Help display
function show_help {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -w WIDTH     Set width (default: $WIDTH)"
    echo "  -h HEIGHT    Set height (default: $HEIGHT)"
    echo "  -d TARGET_DIR Set target directory (default: $TARGET_DIR)"
    echo "  -f FORMAT    Set output format (default: $FORMAT)"
    echo "  -help        Show this help"
    exit 0
}

# Parse command line arguments
while getopts "w:h:d:f:help" opt; do
    case $opt in
        w) WIDTH=$OPTARG ;;
        h) HEIGHT=$OPTARG ;;
        d) TARGET_DIR=$OPTARG ;;
        f) FORMAT=$OPTARG ;;
        help) show_help ;;
        \?) echo "Invalid option: -$OPTARG" >&2; show_help ;;
    esac
done

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Count the number of files to be processed
NUM_FILES=$(find "$SOURCE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" \) | wc -l)
echo "Found $NUM_FILES images to process."

# Counter for processed files
PROCESSED=0

# Loop through all image files in the source directory
find "$SOURCE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" \) -print0 | while IFS= read -r -d '' image; do
    # Extract the filename
    filename=$(basename "$image")
    name="${filename%.*}"

    # Convert the image and maintain proportions (with center crop to fit exact dimensions)
    convert "$image" -resize ${WIDTH}x${HEIGHT}^ -gravity center -extent ${WIDTH}x${HEIGHT} "$TARGET_DIR/${name}.${FORMAT}"

    # Update counter and show progress
    PROCESSED=$((PROCESSED + 1))
    echo -ne "Processing... $PROCESSED/$NUM_FILES ($(( PROCESSED * 100 / NUM_FILES ))%)\r"
done

echo -e "\nDone! All images have been resized to ${WIDTH}x${HEIGHT} and saved in $TARGET_DIR"
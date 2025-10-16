#!/bin/bash

# Compare reviews from different models
# Usage: ./scripts/compare-reviews.sh <chapter-file>

set -e

CHAPTER_FILE="${1}"

if [ -z "$CHAPTER_FILE" ]; then
    echo "Usage: $0 <chapter-file>"
    echo ""
    echo "Example: $0 manuscript/chapter-01-history.md"
    exit 1
fi

if [ ! -f "$CHAPTER_FILE" ]; then
    echo "Error: File not found: $CHAPTER_FILE"
    exit 1
fi

CHAPTER_NAME=$(basename "$CHAPTER_FILE" .md)
OUTPUT_DIR="reviews/comparisons"
mkdir -p "$OUTPUT_DIR"

echo "========================================"
echo "  Comparing Editorial Reviews"
echo "========================================"
echo ""
echo "Chapter: $CHAPTER_NAME"
echo ""
echo "Requesting reviews from multiple models..."
echo ""

# Review with Claude Sonnet (fast, good balance)
echo "[1/3] Claude 3.5 Sonnet..."
./scripts/review-chapter.sh "$CHAPTER_FILE" comprehensive claude-3-5-sonnet-20241022
mv "reviews/${CHAPTER_NAME}-comprehensive-review.md" "$OUTPUT_DIR/${CHAPTER_NAME}-sonnet-review.md"
sleep 1

# Review with Claude Opus (best creative feedback)
echo ""
echo "[2/3] Claude 3 Opus..."
./scripts/review-chapter.sh "$CHAPTER_FILE" comprehensive claude-3-opus-20240229
mv "reviews/${CHAPTER_NAME}-comprehensive-review.md" "$OUTPUT_DIR/${CHAPTER_NAME}-opus-review.md"
sleep 1

# Review with GPT-4 (alternative perspective)
echo ""
echo "[3/3] GPT-4 Turbo..."
./scripts/review-chapter.sh "$CHAPTER_FILE" comprehensive gpt-4-turbo
mv "reviews/${CHAPTER_NAME}-comprehensive-review.md" "$OUTPUT_DIR/${CHAPTER_NAME}-gpt4-review.md"

echo ""
echo "========================================"
echo "  Comparison Complete!"
echo "========================================"
echo ""
echo "Reviews saved to: $OUTPUT_DIR/"
echo ""
echo "Files:"
echo "  - ${CHAPTER_NAME}-sonnet-review.md (Claude 3.5 Sonnet)"
echo "  - ${CHAPTER_NAME}-opus-review.md   (Claude 3 Opus)"
echo "  - ${CHAPTER_NAME}-gpt4-review.md   (GPT-4 Turbo)"
echo ""
echo "To view side-by-side:"
echo "  code --diff $OUTPUT_DIR/${CHAPTER_NAME}-sonnet-review.md $OUTPUT_DIR/${CHAPTER_NAME}-opus-review.md"
echo ""

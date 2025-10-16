#!/bin/bash

# Review all chapters with editorial feedback
# Usage: ./scripts/review-all-chapters.sh [review-type] [model]

set -e

REVIEW_TYPE="${1:-comprehensive}"
MODEL="${2:-o1}"  # Use o1 reasoning model for best editorial feedback

echo "========================================"
echo "  Drain Salad - Batch Chapter Review"
echo "========================================"
echo ""
echo "Review type: $REVIEW_TYPE"
echo "Model: $MODEL"
echo ""

# Find all chapter files
CHAPTERS=$(ls manuscript/chapter-*.md | sort)
TOTAL=$(echo "$CHAPTERS" | wc -l | tr -d ' ')
CURRENT=0

for chapter in $CHAPTERS; do
    CURRENT=$((CURRENT + 1))
    echo ""
    echo "[$CURRENT/$TOTAL] Reviewing $(basename "$chapter")..."
    echo "---"

    ./scripts/review-chapter.sh "$chapter" "$REVIEW_TYPE" "$MODEL"

    # Rate limit to avoid API throttling (1 second between requests)
    if [ $CURRENT -lt $TOTAL ]; then
        sleep 1
    fi
done

echo ""
echo "========================================"
echo "  All reviews complete!"
echo "========================================"
echo ""
echo "Review summaries saved in: reviews/"
echo ""
echo "To view all reviews:"
echo "  ls -la reviews/"
echo ""

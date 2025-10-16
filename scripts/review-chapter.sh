#!/bin/bash

# Editorial Review Script for Drain Salad Chapters
# Usage: ./scripts/review-chapter.sh <chapter-file> [review-type] [model]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if llm is installed
if ! command -v llm &> /dev/null; then
    echo -e "${RED}Error: 'llm' command not found${NC}"
    echo "Install with: brew install llm (or pip install llm)"
    echo "Then configure: llm keys set anthropic"
    exit 1
fi

# Parse arguments
CHAPTER_FILE="${1}"
REVIEW_TYPE="${2:-comprehensive}"
MODEL="${3:-claude-3-5-sonnet-20241022}"

if [ -z "$CHAPTER_FILE" ]; then
    echo "Usage: $0 <chapter-file> [review-type] [model]"
    echo ""
    echo "Review types:"
    echo "  comprehensive  - Full editorial review (default)"
    echo "  tone           - Voice and style consistency"
    echo "  structure      - Organization and flow"
    echo "  recipes        - Recipe accuracy and clarity"
    echo "  facts          - Fact-checking and citations"
    echo "  readability    - Clarity and accessibility"
    echo ""
    echo "Models:"
    echo "  claude-3-5-sonnet-20241022 (default, fastest)"
    echo "  claude-3-opus-20240229 (best for creative feedback)"
    echo "  gpt-4-turbo (alternative)"
    exit 1
fi

if [ ! -f "$CHAPTER_FILE" ]; then
    echo -e "${RED}Error: File not found: $CHAPTER_FILE${NC}"
    exit 1
fi

# Extract chapter name
CHAPTER_NAME=$(basename "$CHAPTER_FILE" .md)
OUTPUT_DIR="reviews"
mkdir -p "$OUTPUT_DIR"
OUTPUT_FILE="$OUTPUT_DIR/${CHAPTER_NAME}-${REVIEW_TYPE}-review.md"

echo -e "${GREEN}Reviewing: $CHAPTER_NAME${NC}"
echo -e "${YELLOW}Review type: $REVIEW_TYPE${NC}"
echo -e "${YELLOW}Model: $MODEL${NC}"
echo ""

# Load the appropriate system prompt
case $REVIEW_TYPE in
    comprehensive)
        SYSTEM_PROMPT="You are an experienced cookbook editor reviewing a chapter from 'Drain Salad', a cookbook about transforming kitchen scraps into culinary art. Provide comprehensive editorial feedback covering: (1) Tone and voice consistency (should be serious chef with philosophical wit), (2) Structure and flow, (3) Factual accuracy, (4) Recipe clarity if recipes are present, (5) Readability and engagement, (6) Suggestions for improvement. Be honest but constructive."
        ;;
    tone)
        SYSTEM_PROMPT="You are a voice and style editor. Review this cookbook chapter for consistency with the established voice: serious culinary expertise with philosophical depth, occasional wit, but never jokey or condescending. Flag any passages that feel off-brand. Suggest improvements."
        ;;
    structure)
        SYSTEM_PROMPT="You are a structural editor. Review this chapter for: logical flow, clear section transitions, proper pacing, information hierarchy, and reader navigation. Suggest restructuring where needed."
        ;;
    recipes)
        SYSTEM_PROMPT="You are a recipe editor and test kitchen manager. Review all recipes in this chapter for: clarity of instructions, completeness of ingredients, proper measurements, realistic timing and temperatures, food safety, and potential failure points. Flag any recipes that seem untested or unclear."
        ;;
    facts)
        SYSTEM_PROMPT="You are a fact-checker and culinary researcher. Verify all factual claims in this chapter: historical references, scientific explanations, cooking temperatures, food safety guidelines, and cited sources. Flag anything that seems inaccurate or needs verification."
        ;;
    readability)
        SYSTEM_PROMPT="You are a clarity editor focused on making complex information accessible. Review this chapter for: sentence clarity, jargon usage, paragraph length, transitions, and overall readability. Suggest simplifications where the prose is unnecessarily dense."
        ;;
    *)
        echo -e "${RED}Unknown review type: $REVIEW_TYPE${NC}"
        exit 1
        ;;
esac

# Build the prompt
USER_PROMPT="Please review the following chapter from the cookbook 'Drain Salad':

---
$(cat "$CHAPTER_FILE")
---

Provide detailed editorial feedback formatted in markdown."

# Call the LLM
echo -e "${GREEN}Requesting review from $MODEL...${NC}"
echo ""

llm -m "$MODEL" \
    -s "$SYSTEM_PROMPT" \
    "$USER_PROMPT" \
    > "$OUTPUT_FILE"

# Check if successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Review complete!${NC}"
    echo -e "Saved to: ${YELLOW}$OUTPUT_FILE${NC}"
    echo ""
    echo "Preview:"
    echo "---"
    head -n 20 "$OUTPUT_FILE"
    echo "..."
    echo ""
    echo -e "View full review: ${YELLOW}cat $OUTPUT_FILE${NC}"
else
    echo -e "${RED}✗ Review failed${NC}"
    exit 1
fi

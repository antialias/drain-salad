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

# Load .env if it exists (for OPENAI_API_KEY)
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Parse arguments
CHAPTER_FILE="${1}"
REVIEW_TYPE="${2:-comprehensive}"
MODEL="${3:-o1}"  # Use o1 reasoning model for best editorial feedback

# Read creative intention from file if it exists
CREATIVE_INTENTION_FILE=".creative-intention.md"
STATED_INTENTION=""
if [ -f "$CREATIVE_INTENTION_FILE" ]; then
    STATED_INTENTION=$(cat "$CREATIVE_INTENTION_FILE")
fi

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
    echo "  creative       - Creative consultant feedback (use with GPT-5 pro)"
    echo ""
    echo "Models:"
    echo "  o1 (default, best reasoning for editorial work)"
    echo "  gpt-4.5-preview (latest GPT model)"
    echo "  gpt-4o (fast, balanced)"
    echo "  o1-mini (faster reasoning)"
    echo "  gpt-4o-mini (fastest, cheapest)"
    echo ""
    echo "Creative Intention (for 'creative' reviews):"
    echo "  Create a file named '.creative-intention.md' in the project root with your"
    echo "  creative goal. The creative consultant will align feedback with this intention."
    echo ""
    echo "  Example .creative-intention.md contents:"
    echo "    'Make this cookbook feel more intimate and personal, as if the"
    echo "     author is speaking directly to a close friend in their kitchen.'"
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
    creative)
        if [ -n "$STATED_INTENTION" ]; then
            SYSTEM_PROMPT="You are a creative consultant and editorial advisor working with an author on their cookbook 'Drain Salad'. The author has shared this specific creative intention for the chapter: \"${STATED_INTENTION}\". Your role is to provide constructive creative feedback aligned with this intention. Consider: (1) How effectively the chapter achieves the stated creative goal, (2) Specific passages or techniques that support the intention, (3) Areas where the intention could be strengthened, (4) Creative suggestions for better realizing the author's vision, (5) Any potential conflicts between the stated intention and the chapter's current execution. Be supportive but honest, and offer concrete suggestions for improvement."
        else
            SYSTEM_PROMPT="You are a creative consultant and editorial advisor working with an author on their cookbook 'Drain Salad'. Provide creative feedback on this chapter focusing on: (1) The chapter's creative voice and emotional resonance, (2) Narrative flow and storytelling elements, (3) How effectively the writing engages and moves the reader, (4) Creative opportunities to enhance the chapter, (5) Balance between information and artistry. Be supportive but honest, offering concrete creative suggestions."
        fi
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

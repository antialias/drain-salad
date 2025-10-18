# Editorial Review System

**Professional chapter-level review workflows using GPT-5 pro with extended reasoning for cookbook manuscripts.**

---

## Overview

The Drain Salad platform includes a sophisticated editorial review system that analyzes chapter content using AI models specialized for extended reasoning. This system provides professional-grade feedback on tone, structure, factual accuracy, recipe clarity, and readability.

---

## Review Types

### 1. **Comprehensive Review** (Recommended)
**Purpose**: Complete editorial analysis covering all aspects

**Analyzes**:
- Tone and voice consistency
- Structure and flow
- Factual accuracy (historical, scientific, culinary)
- Recipe clarity and completeness
- Readability and engagement
- Specific improvement suggestions

**Use when**: You want complete feedback before publication

```bash
./scripts/review-chapter.sh manuscript/chapter-01-history.md comprehensive
```

---

### 2. **Tone Review**
**Purpose**: Voice and brand consistency check

**Analyzes**:
- Maintains "serious chef with wit" voice
- Balances profundity with playfulness
- Flags overly casual or academic passages
- Checks narrative consistency

**Use when**: Ensuring voice consistency across chapters

```bash
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md tone
```

---

### 3. **Structure Review**
**Purpose**: Organization and flow analysis

**Analyzes**:
- Logical progression
- Section transitions
- Information hierarchy
- Pacing and rhythm
- Reader navigation

**Use when**: Concerned about chapter flow or organization

```bash
./scripts/review-chapter.sh manuscript/chapter-02-anatomy.md structure
```

---

### 4. **Recipe Review**
**Purpose**: Technical recipe validation

**Analyzes**:
- Instruction clarity
- Ingredient list completeness
- Measurement accuracy
- Timing realism
- Safety considerations
- Common failure points

**Use when**: Validating recipes for publication

```bash
./scripts/review-chapter.sh manuscript/chapter-07-salads-small-plates.md recipes
```

---

### 5. **Facts Review**
**Purpose**: Accuracy verification

**Analyzes**:
- Historical references
- Scientific claims
- Cooking temperatures
- Food safety information
- Fermentation timelines

**Use when**: Verifying technical or historical accuracy

```bash
./scripts/review-chapter.sh manuscript/chapter-03-clean-catch-method.md facts
```

---

### 6. **Readability Review**
**Purpose**: Accessibility and clarity check

**Analyzes**:
- Sentence clarity
- Paragraph length
- Jargon usage
- Transitions
- Engagement level

**Use when**: Ensuring content is accessible to target audience

```bash
./scripts/review-chapter.sh manuscript/chapter-10-taxonomy.md readability
```

---

## Available Review Models

### **o1** (Best - Extended Reasoning)
- **Strengths**: Deep analysis, multi-step reasoning, catches subtle issues
- **Cost**: ~$15 per 1M input tokens
- **Use for**: Final pre-publication comprehensive reviews

### **o1-mini** (Fast Reasoning)
- **Strengths**: Faster, still uses reasoning, good value
- **Cost**: ~$3 per 1M input tokens
- **Use for**: Iterative reviews during drafting

### **gpt-4.5-preview** (Latest GPT)
- **Strengths**: Up-to-date training, good general analysis
- **Cost**: Standard GPT-5 pricing
- **Use for**: General reviews

### **gpt-4o** (Balanced)
- **Strengths**: Fast, multimodal, good for most tasks
- **Cost**: Standard pricing
- **Use for**: Quick checks

### **gpt-4o-mini** (Cheapest)
- **Strengths**: Very fast, very cheap
- **Cost**: ~$0.15 per 1M input tokens
- **Use for**: Quick tone/readability checks

---

## Review Workflows

### Single Chapter Review

```bash
# Basic comprehensive review
./scripts/review-chapter.sh manuscript/chapter-01-history.md comprehensive

# Specify model
./scripts/review-chapter.sh manuscript/chapter-01-history.md comprehensive o1

# Multiple review types
./scripts/review-chapter.sh manuscript/chapter-07-salads-small-plates.md recipes
./scripts/review-chapter.sh manuscript/chapter-07-salads-small-plates.md readability
```

### Batch Review (All Chapters)

```bash
# Review all chapters systematically
./scripts/review-all-chapters.sh

# Reviews all 12 chapters with comprehensive analysis
# Output: reviews/chapter-NN-name-comprehensive-review.md
```

### Pro Review (GPT-5 with Extended Reasoning)

```bash
# Use GPT-5 pro for deep analysis
npm run review:pro manuscript/chapter-01-history.md comprehensive

# Background processing for longer analysis
# Output: reviews/chapter-01-history-comprehensive-pro-review.md
```

### Compare Reviews

```bash
# Compare review outputs across versions
./scripts/compare-reviews.sh

# Useful for tracking changes after revisions
```

---

## System Prompts

### Comprehensive Review Prompt
```
You are a professional cookbook editor reviewing "Drain Salad," a cookbook about
transforming kitchen scraps into gourmet food.

Voice: Serious chef with philosophical wit (Bourdain meets Michael Pollan)
Audience: Home cooks interested in sustainability and technique

Analyze:
1. TONE: Is the voice consistent? Flag passages that feel off-brand.
2. STRUCTURE: Does the chapter flow logically? Are transitions smooth?
3. FACTS: Are historical/scientific/culinary claims accurate?
4. RECIPES: Are instructions clear, measurements complete, timing realistic?
5. READABILITY: Is it engaging and accessible?
6. SUGGESTIONS: Provide specific, actionable improvements.

Be direct. Flag issues clearly. Praise what works.
```

### Tone Review Prompt
```
You are a voice consistency editor for "Drain Salad."

The voice is: Serious chef with philosophical wit
- NOT: Overly casual or academic
- NOT: Preachy about sustainability
- NOT: Overly technical

Flag any passages that break this voice.
Provide specific examples of what to change.
```

### Recipe Review Prompt
```
You are a test kitchen editor reviewing recipes for publication.

Check:
- Instructions: Are they clear and complete?
- Ingredients: Any missing from the list?
- Measurements: Accurate and consistent?
- Timing: Realistic for home cooks?
- Safety: Any food safety concerns?
- Failures: Common mistakes addressed?

Flag anything that would confuse or mislead a home cook.
```

---

## Review Output Format

Reviews are saved as **Markdown** files in `reviews/`:

```
reviews/
├── chapter-01-history-comprehensive-review.md
├── chapter-01-history-tone-review.md
├── chapter-07-salads-comprehensive-pro-review.md
└── (etc.)
```

### Example Review Structure

```markdown
# Chapter Review: Chapter 01 - History

**Type**: Comprehensive
**Model**: o1
**Date**: 2025-10-18

---

## Overall Assessment

The chapter effectively establishes the historical context...

---

## Tone & Voice

✅ **Strengths**:
- The opening story about medieval kitchens is engaging
- Wit balances well with serious culinary history

⚠️ **Issues**:
- Page 3, paragraph 2: "totally rad" feels anachronistic
- Page 5: Academic tone in fermentation section breaks voice

---

## Structure & Flow

✅ **Strengths**:
- Clear progression from medieval to modern
- Good transitions between sections

⚠️ **Issues**:
- Section on Depression-era cooking feels abrupt
- Consider moving "Why Now?" section earlier

---

## Factual Accuracy

✅ **Accurate**:
- Maillard reaction explanation
- Fermentation timeline

⚠️ **Verify**:
- "Medieval kitchens used every part" - needs citation
- Temperature for browning butter (check: 250°F vs 275°F)

---

## Recipes

N/A (No recipes in this chapter)

---

## Readability

✅ **Strengths**:
- Engaging storytelling
- Good paragraph length variety

⚠️ **Issues**:
- Some sentences exceed 40 words (flag for breaking up)
- "Alliumacious" - jargon without definition

---

## Specific Suggestions

1. **Page 3, Line 15**: Replace "totally rad" with "remarkably effective"
2. **Page 5, Paragraph 3**: Simplify fermentation explanation or add story
3. **Page 8**: Add citation for medieval kitchen claim
4. **Page 12**: Break up 45-word sentence about composting

---

## Conclusion

Strong chapter. Voice is mostly consistent. Address factual verification
and simplify academic passages. Ready for publication after minor revisions.

**Recommendation**: Revise and re-review tone section.
```

---

## Cookbook-Specific Review Frameworks

### Voice Consistency Check
- ✅ **Good**: "The garlic was burned. This was not a creative choice. This was Tuesday."
- ❌ **Off-brand**: "OMG this garlic is like totally ruined lol"
- ❌ **Too academic**: "The Maillard reaction cessation point was exceeded"

### Recipe Safety Validation
- **Red flags**:
  - Room temperature raw eggs > 2 hours
  - Fermentation without safety guidance
  - Unclear cook temperatures for meat
  - No mention of allergens

### Scrap-Specific Concerns
- Are scraps properly defined as safe?
- Is "Clean-Catch" system referenced?
- Are food safety boundaries clear?
- Any liability issues flagged?

---

## Integration with Writing Workflow

### Pre-Draft (Planning)
```bash
# Not applicable - review requires completed text
```

### During Drafting (Iterative)
```bash
# Quick readability checks
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md readability

# Tone checks after major revisions
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md tone
```

### Pre-Publication (Final)
```bash
# Comprehensive review with GPT-5 pro
npm run review:pro manuscript/chapter-05-techniques.md comprehensive

# Recipe-specific validation
./scripts/review-chapter.sh manuscript/chapter-07-salads-small-plates.md recipes

# Batch review all chapters
./scripts/review-all-chapters.sh

# Compare reviews to ensure consistency
./scripts/compare-reviews.sh
```

---

## Cost Estimates

### Per Chapter (~3,000 words)

| Review Type | Model | Cost per Chapter |
|-------------|-------|------------------|
| Comprehensive | o1 | ~$0.15-0.30 |
| Comprehensive | o1-mini | ~$0.03-0.05 |
| Tone | gpt-4o-mini | ~$0.01 |
| Recipe | gpt-4o | ~$0.05 |
| Batch (all 12) | o1-mini | ~$0.50 total |

### Full Manuscript (37,711 words)

| Workflow | Cost |
|----------|------|
| **Comprehensive (all chapters, o1)** | ~$3.00 |
| **Comprehensive (all chapters, o1-mini)** | ~$0.60 |
| **Iterative reviews during drafting** | ~$5-10 total |

---

## Review Script Usage

### `review-chapter.sh` (Single Chapter)

```bash
# Syntax
./scripts/review-chapter.sh <chapter-file> <review-type> [model]

# Examples
./scripts/review-chapter.sh manuscript/chapter-01-history.md comprehensive
./scripts/review-chapter.sh manuscript/chapter-07-salads.md recipes o1
./scripts/review-chapter.sh manuscript/chapter-10-taxonomy.md readability gpt-4o-mini

# Review types: comprehensive, tone, structure, recipes, facts, readability
# Models: o1, o1-mini, gpt-4.5-preview, gpt-4o, gpt-4o-mini (default: o1-mini)
```

### `review-all-chapters.sh` (Batch)

```bash
# Reviews all chapters with comprehensive analysis
./scripts/review-all-chapters.sh

# Output saved to reviews/ directory
```

### `review-pro.js` (GPT-5 Pro)

```bash
# Node.js script for deep analysis
npm run review:pro manuscript/chapter-01-history.md comprehensive

# Uses GPT-5 pro background mode for extended reasoning
# Takes longer but provides deepest analysis
```

### `compare-reviews.sh` (Version Comparison)

```bash
# Compare review outputs to track changes
./scripts/compare-reviews.sh

# Useful after making revisions based on feedback
```

---

## Advanced Usage

### Custom Review Prompts

Edit `/scripts/review-chapter.sh` system prompts for specific needs:

```bash
# Example: Add allergen-specific review
CUSTOM_PROMPT="In addition to standard review, flag any recipes
with tree nuts, gluten, or dairy without clear labeling."
```

### Combining Reviews

```bash
# Run multiple review types and compare
./scripts/review-chapter.sh manuscript/chapter-07-salads.md comprehensive
./scripts/review-chapter.sh manuscript/chapter-07-salads.md recipes
./scripts/review-chapter.sh manuscript/chapter-07-salads.md facts

# Combine insights from all three
```

### Automated Review Pipeline

```bash
# Add to your git pre-commit hook
npm run review:all  # Reviews all chapters before commit
```

---

## Troubleshooting

### Reviews Are Too Generic
**Solution**: Use more specific review types (recipes, facts) or GPT-5 pro

### Reviews Miss Subtle Issues
**Solution**: Use `o1` model with extended reasoning

### Reviews Are Too Expensive
**Solution**: Use `o1-mini` or `gpt-4o-mini` for iterative reviews

### Reviews Don't Understand Cookbook Context
**Solution**: Enhance system prompts with more cookbook-specific guidance

---

## Best Practices

1. **Iterative Reviews**: Review often during drafting with cheaper models
2. **Final Reviews**: Use GPT-5 pro comprehensive reviews before publication
3. **Specialized Reviews**: Use recipe/facts reviews for technical chapters
4. **Version Control**: Commit reviews to git to track changes
5. **Multiple Perspectives**: Run both tone and readability for difficult chapters
6. **Batch Processing**: Review all chapters together to ensure consistency

---

## Integration with Quality Loop

Editorial review complements the **image quality loop**:

```bash
# Full quality assurance workflow
npm run lint                          # Check markdown syntax
./scripts/review-all-chapters.sh      # Editorial review
npm run quality:loop                  # Image quality loop
npm run build:all                     # Build all formats
```

---

## Next Steps

After receiving reviews:

1. **Address critical issues** (facts, safety, clarity)
2. **Revise based on feedback**
3. **Re-review changed sections**
4. **Run batch review** to ensure consistency
5. **Proceed to image generation** and build

---

**Editorial Review System** - Professional cookbook feedback at scale

*Part of the Drain Salad Publishing Platform*

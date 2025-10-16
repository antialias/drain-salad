.PHONY: all build clean lint wordcount help

# Default target
all: build

# Build all formats
build: build-epub build-pdf build-html

# Individual format builds
build-epub:
	@echo "Building EPUB..."
	@mkdir -p build
	@pandoc manuscript/metadata.yaml manuscript/chapter-*.md \
		-o build/drain-salad.epub \
		--toc --toc-depth=2 \
		--epub-cover-image=cover-ideas/cover-final.jpg 2>/dev/null || \
	pandoc manuscript/metadata.yaml manuscript/chapter-*.md \
		-o build/drain-salad.epub \
		--toc --toc-depth=2
	@echo "✓ EPUB created: build/drain-salad.epub"

build-pdf:
	@echo "Building PDF..."
	@mkdir -p build
	@pandoc manuscript/metadata.yaml manuscript/chapter-*.md \
		-o build/drain-salad.pdf \
		--toc --toc-depth=2 \
		-V geometry:margin=1in
	@echo "✓ PDF created: build/drain-salad.pdf"

build-html:
	@echo "Building HTML..."
	@mkdir -p build
	@pandoc manuscript/metadata.yaml manuscript/chapter-*.md \
		-o build/drain-salad.html \
		--toc --toc-depth=2 \
		--standalone \
		--css=../styles/book.css
	@echo "✓ HTML created: build/drain-salad.html"

# Lint markdown files
lint:
	@command -v markdownlint >/dev/null 2>&1 && \
		markdownlint manuscript/**/*.md drafts/**/*.md || \
		echo "⚠ markdownlint not installed. Run: npm install"

# Word count
wordcount:
	@echo "Word count by chapter:"
	@for file in manuscript/chapter-*.md; do \
		count=$$(wc -w < "$$file"); \
		echo "  $$(basename $$file): $$count words"; \
	done
	@echo "---"
	@echo "Total: $$(cat manuscript/chapter-*.md | wc -w) words"

# Clean build artifacts
clean:
	@rm -rf build/*
	@echo "✓ Build directory cleaned"

# Show help
help:
	@echo "Drain Salad - Build System"
	@echo ""
	@echo "Available targets:"
	@echo "  make build       - Build all formats (EPUB, PDF, HTML)"
	@echo "  make build-epub  - Build EPUB only"
	@echo "  make build-pdf   - Build PDF only"
	@echo "  make build-html  - Build HTML only"
	@echo "  make lint        - Lint markdown files"
	@echo "  make wordcount   - Show word count per chapter"
	@echo "  make clean       - Remove build artifacts"
	@echo "  make help        - Show this help message"

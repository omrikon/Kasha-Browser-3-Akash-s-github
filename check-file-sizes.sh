#!/bin/bash
# File Size Checker - Ensures no file exceeds 2000 lines

echo "=== FILE SIZE CHECK ==="
echo ""
echo "Checking all .js files..."
echo ""

MAX_LINES=2000
VIOLATIONS=0
WARNINGS=0

# Find all .js files and check their sizes
while IFS= read -r file; do
    lines=$(wc -l < "$file")
    
    if [ "$lines" -gt "$MAX_LINES" ]; then
        echo "❌ VIOLATION: $file has $lines lines (exceeds $MAX_LINES)"
        VIOLATIONS=$((VIOLATIONS + 1))
    elif [ "$lines" -gt 1800 ]; then
        echo "⚠️  WARNING: $file has $lines lines (approaching $MAX_LINES limit)"
        WARNINGS=$((WARNINGS + 1))
    fi
done < <(find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./Kasha Browser 2 copy/*")

echo ""
echo "=== SUMMARY ==="
echo "Violations (>$MAX_LINES lines): $VIOLATIONS"
echo "Warnings (>1800 lines): $WARNINGS"

if [ "$VIOLATIONS" -gt 0 ]; then
    echo ""
    echo "❌ FAILED: Files exceed the 2000 line limit!"
    echo "Please split these files into smaller modules."
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo ""
    echo "⚠️  WARNING: Some files are approaching the limit."
    echo "Consider splitting them soon."
    exit 0
else
    echo ""
    echo "✅ PASSED: All files are under the limit!"
    exit 0
fi


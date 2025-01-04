#!/usr/bin/env bash
#
# Example usage:
#   ./generate-business.sh "Hardware Store" "A large hardware store with a garden section" 5 50
#
# Requirements:
#   - OPENAI_API_KEY must be set in the environment (e.g., export OPENAI_API_KEY="xyz")
#   - jq must be installed
#
# Process:
#   1) Generate categories -> categories.txt
#   2) For each category, directly create JSON with items -> items_<Category>.json
#   3) Merge all JSON files -> <ShopType>.json

# --- Parameter validation ---
if [ $# -ne 4 ]; then
  echo "Usage: $0 \"<Shop Type>\" \"<Shop Description>\" <Number of Categories> <Number of Items>"
  exit 1
fi

SHOP_TYPE="$1"
SHOP_DESC="$2"
NUM_CATEGORIES="$3"
NUM_ITEMS="$4"

API_KEY="${OPENAI_API_KEY}"
API_ENDPOINT="https://api.openai.com/v1/chat/completions"
MODEL="gpt-4o"

# --- Check: Is OPENAI_API_KEY available? ---
if [ -z "$API_KEY" ]; then
  echo "Error: OPENAI_API_KEY is not set."
  exit 1
fi

# --- GPT helper function (extracted curl call) ---
call_openai() {
  local prompt="$1"
  local escaped_prompt=$(jq -Rn --arg prompt "$prompt" '$prompt')

  local payload="{
      \"model\": \"$MODEL\",
      \"messages\": [
        {
          \"role\": \"user\",
          \"content\": $escaped_prompt
        }
      ]
    }"

   curl -s "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d "$payload"
}

# --- Step 1: Generate categories ---
generate_categories() {
  echo "Generating $NUM_CATEGORIES categories for '$SHOP_TYPE'..."

  local prompt="
  Generate a list of $NUM_CATEGORIES categories for the shop: '$SHOP_TYPE'.
  Here is the shop description: '$SHOP_DESC'.
  Each category name should be on a new line without prefixes like numbering or markdown bullet points.
  Provide no additional explanation, just the categories.
  "

  local response
  response=$(call_openai "$prompt")

  # Save to categories.txt
  echo "$response" | jq -r '.choices[0].message.content' > categories.txt
  echo "Categories saved to categories.txt"
}

# --- Steps 2+3: Generate items and output as JSON ---
generate_items_for_category() {
  local category="$1"
  # Adjust filename (e.g., remove spaces)
  local sanitized
  sanitized=$(echo "$category" | tr ' /' '_' | tr -d "'\"" )

  echo "Generating JSON for shop '$SHOP_TYPE' in category '$category' with '$NUM_ITEMS' items..."

  # Generate JSON object directly
  local prompt="
  Please generate $NUM_ITEMS items (with low prices) for the category '$category' in a shop of type '$SHOP_TYPE'.
  Here is the shop description: '$SHOP_DESC'.

  The result should be a JSON object with the following schema:
  {
    \"category\": \"<Category>\",
    \"items\": [
      {
        \"name\": \"...\",
        \"price\": <number>,
        \"vat\": \"A\"|\"B\"|\"C\"
      },
      ...
    ]
  }

  Provide no explanation, only pure JSON (no code blocks or text).
  VAT (vat) may vary: \"A\" corresponds to 19% VAT, \"B\" to 7% VAT, and \"C\" to 0% VAT.
  Prices should be low.
  "

  local response
  response=$(call_openai "$prompt")

  local json_output
  json_output=$(echo "$response" | jq -r '.choices[0].message.content')

  # Save to items_<Category>.json
  echo "$json_output" > "items_${sanitized}.json"
  echo "JSON for category '$category' -> items_${sanitized}.json"
}

# --- Step 4: Merge all JSON files into <ShopType>.json ---
combine_json_files() {
  local out_file="${SHOP_TYPE}.json"
  local result="[]"

  if [ ! -f categories.txt ]; then
    echo "Error: categories.txt not found. Cannot combine JSON files."
    exit 1
  fi

  while IFS= read -r category; do
    [ -n "$category" ] || continue
    local sanitized
    sanitized=$(echo "$category" | tr ' /' '_' | tr -d "'\"")
    local file="items_${sanitized}.json"

    if [ ! -f "$file" ]; then
      echo "Warning: File $file does not exist, skipping."
      continue
    fi

    # Load file content with --slurpfile and add to the result
    result=$(echo "$result" | jq --slurpfile obj "$file" '. + [$obj[]]')
  done < categories.txt

  echo "$result" > "$out_file"
  echo "Final JSON saved to: $out_file"
}

# --- Main process ---
main() {
  # Remove possible leftovers
  rm -f categories.txt items_*.json "${SHOP_TYPE}.json"

  # 1) Generate categories
  generate_categories

  # 2+3) For each category: Generate items + directly output as JSON
  while IFS= read -r CATEGORY; do
    # Only continue if the line is not empty
    [ -n "$CATEGORY" ] || continue
    generate_items_for_category "$CATEGORY"
  done < categories.txt

  # 4) Combine
  combine_json_files
}

main
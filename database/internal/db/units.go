package db

import (
	"encoding/json"
	"strings"
)

var allowedUnitTypes = map[string]bool{
	"paragraph":      true,
	"list":           true,
	"key_idea":       true,
	"biblical_quote": true,
	"image":          true,
	"video":          true,
	"audio":          true,
	"link":           true,
}

func isAllowedUnitType(unitType string) bool {
	return allowedUnitTypes[strings.ToLower(strings.TrimSpace(unitType))]
}

func resolveUnitType(block map[string]any) string {
	if block == nil {
		return "paragraph"
	}
	explicit := strings.ToLower(strings.TrimSpace(fmtAny(block["type"])))
	if isAllowedUnitType(explicit) {
		return explicit
	}
	return detectUnitType(block)
}

func stripTypeField(block map[string]any) map[string]any {
	if block == nil {
		return map[string]any{}
	}
	out := make(map[string]any, len(block))
	for key, value := range block {
		if key == "type" {
			continue
		}
		out[key] = value
	}
	return out
}

func contentBlockForStorage(unitType string, block map[string]any) map[string]any {
	stripped := stripTypeField(block)
	switch unitType {
	case "image", "video", "audio":
		return normalizeMediaBlock(stripped)
	default:
		return stripped
	}
}

func detectUnitType(block map[string]any) string {
	if block == nil {
		return "paragraph"
	}
	if _, ok := block["list"]; ok {
		return "list"
	}
	if _, ok := block["biblical_reference"]; ok {
		return "biblical_quote"
	}
	if _, ok := block["image"]; ok {
		return "image"
	}
	if _, ok := block["video"]; ok {
		return "video"
	}
	if _, ok := block["audio"]; ok {
		return "audio"
	}
	if _, ok := block["href"]; ok {
		return "link"
	}
	if _, ok := block["fileName"]; ok {
		if _, hasVideo := block["video"]; hasVideo {
			return "video"
		}
		if _, hasAudio := block["audio"]; hasAudio {
			return "audio"
		}
		return "image"
	}
	return "paragraph"
}

func normalizeMediaBlock(block map[string]any) map[string]any {
	out := map[string]any{}
	for _, key := range []string{"image", "video", "audio", "text", "alt", "href", "name", "url"} {
		if value, ok := block[key]; ok && value != nil && strings.TrimSpace(fmtAny(value)) != "" {
			out[key] = value
		}
	}

	mediaKey := ""
	if _, ok := block["image"]; ok {
		mediaKey = "image"
	} else if _, ok := block["video"]; ok {
		mediaKey = "video"
	} else if _, ok := block["audio"]; ok {
		mediaKey = "audio"
	}

	if mediaKey != "" {
		url := strings.TrimSpace(fmtAny(block[mediaKey]))
		if url == "" {
			url = strings.TrimSpace(fmtAny(block["url"]))
		}
		if url != "" {
			out[mediaKey] = url
		}
		name := strings.TrimSpace(fmtAny(block["name"]))
		if name == "" {
			name = strings.TrimSpace(fmtAny(block["fileName"]))
		}
		if name != "" {
			out["name"] = name
		}
	}

	return out
}

func blockFromUnit(unitType string, raw string) (map[string]any, error) {
	var block map[string]any
	if err := json.Unmarshal([]byte(raw), &block); err != nil {
		return nil, err
	}
	if block == nil {
		block = map[string]any{}
	}

	switch unitType {
	case "paragraph", "key_idea":
		text := strings.TrimSpace(fmtAny(block["text"]))
		if text == "" {
			text = strings.TrimSpace(fmtAny(block["content"]))
		}
		out := map[string]any{"text": text}
		if phrases, ok := block["emphasized_phrases"].([]any); ok && len(phrases) > 0 {
			out["emphasized_phrases"] = phrases
		}
		return out, nil
	case "biblical_quote":
		out := map[string]any{
			"text":               strings.TrimSpace(fmtAny(block["text"])),
			"biblical_reference": strings.TrimSpace(fmtAny(block["biblical_reference"])),
		}
		if phrases, ok := block["emphasized_phrases"].([]any); ok && len(phrases) > 0 {
			out["emphasized_phrases"] = phrases
		}
		return out, nil
	case "list":
		out := map[string]any{}
		if list, ok := block["list"]; ok {
			out["list"] = list
		}
		if ordered, ok := block["ordered"].(bool); ok && ordered {
			out["ordered"] = true
		}
		return out, nil
	case "image", "video", "audio":
		return normalizeMediaBlock(block), nil
	case "link":
		return map[string]any{
			"href": strings.TrimSpace(fmtAny(block["href"])),
			"text": strings.TrimSpace(fmtAny(block["text"])),
		}, nil
	default:
		return block, nil
	}
}

func fmtAny(value any) string {
	if value == nil {
		return ""
	}
	switch typed := value.(type) {
	case string:
		return typed
	default:
		return strings.TrimSpace(string(mustJSON(typed)))
	}
}

func mustJSON(value any) []byte {
	raw, _ := json.Marshal(value)
	return raw
}

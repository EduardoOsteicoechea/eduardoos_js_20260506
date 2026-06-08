package db

import "encoding/json"

// SectionsToAPI converts stored section documents to the editor/article JSON shape.
func SectionsToAPI(sections []SaveSectionInput) []map[string]any {
	var out []map[string]any
	for _, section := range sections {
		content := make([]map[string]any, 0, len(section.Units))
		for _, unit := range section.Units {
			raw, err := json.Marshal(unit.Content)
			if err != nil {
				continue
			}
			block, err := blockFromUnit(unit.Type, string(raw))
			if err != nil || len(block) == 0 {
				continue
			}
			block["type"] = unit.Type
			content = append(content, block)
		}

		item := map[string]any{
			"heading": section.Heading,
			"content": content,
		}
		if len(section.Quiz) > 0 {
			item["quiz"] = section.Quiz
		}
		out = append(out, item)
	}
	if out == nil {
		out = []map[string]any{}
	}
	return out
}

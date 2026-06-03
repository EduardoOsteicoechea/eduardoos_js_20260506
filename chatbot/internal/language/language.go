package language

import "encoding/json"

// Instruction returns an explicit reply-language rule from global context JSON.
func Instruction(globalContext []byte) string {
	if len(globalContext) == 0 {
		return ""
	}
	var parsed struct {
		ReplyLanguageInstruction string `json:"replyLanguageInstruction"`
		PreferredLanguage        string `json:"preferredLanguage"`
		ReplyLanguage            string `json:"replyLanguage"`
	}
	if err := json.Unmarshal(globalContext, &parsed); err != nil {
		return ""
	}
	if parsed.ReplyLanguageInstruction != "" {
		return "## Reply language (required)\n\n" + parsed.ReplyLanguageInstruction
	}
	if parsed.PreferredLanguage != "" {
		label := parsed.ReplyLanguage
		if label == "" {
			label = parsed.PreferredLanguage
		}
		return "## Reply language (required)\n\nYou MUST write every reply in " + label + " only."
	}
	return ""
}

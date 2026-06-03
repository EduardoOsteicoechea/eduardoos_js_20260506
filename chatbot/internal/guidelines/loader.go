package guidelines

import (
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/eduardoos/chatbot/internal/config"
)

// Bundle is loaded once at startup (reload requires service restart).
type Bundle struct {
	GuidelinesPath   string
	GuidelinesText   string
	KnowledgeDir     string
	KnowledgeFiles   []string
	KnowledgeText    string
	KnowledgeTruncated bool
}

func Load(cfg config.Config) Bundle {
	bundle := Bundle{
		GuidelinesPath: cfg.GuidelinesPath,
		KnowledgeDir:   cfg.KnowledgeDir,
	}

	bundle.GuidelinesText = readFile(cfg.GuidelinesPath)
	bundle.KnowledgeText, bundle.KnowledgeFiles, bundle.KnowledgeTruncated = loadKnowledge(
		cfg.KnowledgeDir,
		cfg.KnowledgeMaxChars,
	)

	return bundle
}

func readFile(path string) string {
	if path == "" {
		return ""
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(raw))
}

func loadKnowledge(dir string, maxChars int) (combined string, files []string, truncated bool) {
	if dir == "" || maxChars <= 0 {
		return "", nil, false
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return "", nil, false
	}

	var names []string
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if strings.HasSuffix(strings.ToLower(entry.Name()), ".md") {
			names = append(names, entry.Name())
		}
	}
	sort.Strings(names)

	var builder strings.Builder
	for _, name := range names {
		path := filepath.Join(dir, name)
		text := readFile(path)
		if text == "" {
			continue
		}
		chunk := "## " + strings.TrimSuffix(name, filepath.Ext(name)) + "\n\n" + text + "\n\n"
		if builder.Len()+len(chunk) > maxChars {
			truncated = true
			remaining := maxChars - builder.Len()
			if remaining > 200 {
				builder.WriteString(chunk[:remaining])
				builder.WriteString("\n\n[... knowledge truncated ...]\n")
			}
			files = append(files, name)
			return strings.TrimSpace(builder.String()), files, truncated
		}
		builder.WriteString(chunk)
		files = append(files, name)
	}

	return strings.TrimSpace(builder.String()), files, false
}

// BuildSystemPrompt merges guidelines, knowledge, and request context.
func BuildSystemPrompt(bundle Bundle, model string, pageContext, globalContext []byte) string {
	var parts []string

	if bundle.GuidelinesText != "" {
		parts = append(parts, bundle.GuidelinesText)
	} else {
		parts = append(parts,
			"You represent Eduardo Osteicoechea professionally. Answer in the user's language. "+
				"Speak in a relaxed but formal tone. Only use facts from the knowledge base; say when you do not know.",
		)
	}

	if model != "" {
		parts = append(parts, "Configured model id: "+model+".")
	}

	if bundle.KnowledgeText != "" {
		parts = append(parts, "Knowledge base:\n"+bundle.KnowledgeText)
	}

	if len(pageContext) > 0 {
		parts = append(parts, "Page context (current page):\n"+string(pageContext))
	}

	if len(globalContext) > 0 {
		parts = append(parts, "Global context:\n"+string(globalContext))
	}

	return strings.Join(parts, "\n\n")
}

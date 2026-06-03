package navigation

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

const navMarkerPrefix = "@@NAV@@"
const navMarkerSuffix = "@@"

var navBlockRe = regexp.MustCompile(`(?m)^@@NAV@@(.+?)@@\s*$`)

type SiteNavigation struct {
	Routes         []NavRoute `json:"routes"`
	PathPatterns   []string   `json:"pathPatterns"`
	CurrentPathname string    `json:"currentPathname"`
}

type NavRoute struct {
	Path        string `json:"path"`
	Label       string `json:"label"`
	Description string `json:"description,omitempty"`
}

type NavigatePayload struct {
	Path  string `json:"path"`
	Label string `json:"label,omitempty"`
}

type Action struct {
	Type  string `json:"type"`
	Path  string `json:"path"`
	Label string `json:"label,omitempty"`
}

func Instructions() string {
	return `## Site navigation

You can send the user to pages on this site. When they ask to open, go to, or be shown a page, include a short helpful reply and end with exactly one line (nothing else on that line):

@@NAV@@{"path":"/series","label":"Estudios bíblicos"}@@

Rules:
- Use only paths from "Site navigation" in global context (routes + pathPatterns).
- For a specific article already in page context, use its pathname as path.
- path must start with /, no full URLs, no "..".
- Omit the @@NAV@@ line if you are not navigating.
- Keep the human-readable reply above the marker; the marker is stripped before display.`
}

func ExtractSiteNavigation(globalContext []byte) SiteNavigation {
	if len(globalContext) == 0 {
		return SiteNavigation{}
	}
	var parsed struct {
		SiteNavigation SiteNavigation `json:"siteNavigation"`
	}
	if err := json.Unmarshal(globalContext, &parsed); err != nil {
		return SiteNavigation{}
	}
	return parsed.SiteNavigation
}

func ParseReply(raw string, nav SiteNavigation) (reply string, actions []Action) {
	reply = strings.TrimSpace(raw)
	matches := navBlockRe.FindStringSubmatch(reply)
	if len(matches) < 2 {
		return reply, nil
	}

	reply = strings.TrimSpace(navBlockRe.ReplaceAllString(reply, ""))

	var payload NavigatePayload
	if err := json.Unmarshal([]byte(strings.TrimSpace(matches[1])), &payload); err != nil {
		return reply, nil
	}

	path := normalizePath(payload.Path)
	if path == "" || !IsAllowed(path, nav) {
		return reply, nil
	}

	label := strings.TrimSpace(payload.Label)
	if label == "" {
		label = routeLabel(path, nav)
	}

	return reply, []Action{{
		Type:  "navigate",
		Path:  path,
		Label: label,
	}}
}

func normalizePath(path string) string {
	path = strings.TrimSpace(path)
	if path == "" {
		return ""
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	if strings.Contains(path, "://") || strings.Contains(path, "..") {
		return ""
	}
	if idx := strings.Index(path, "?"); idx >= 0 {
		path = path[:idx]
	}
	if idx := strings.Index(path, "#"); idx >= 0 {
		path = path[:idx]
	}
	if path != "/" {
		path = strings.TrimSuffix(path, "/")
	}
	return path
}

func IsAllowed(path string, nav SiteNavigation) bool {
	for _, route := range nav.Routes {
		if normalizePath(route.Path) == path {
			return true
		}
	}
	for _, pattern := range nav.PathPatterns {
		if matchPattern(pattern, path) {
			return true
		}
	}
	return false
}

func matchPattern(pattern, path string) bool {
	pattern = strings.TrimSpace(pattern)
	if pattern == "" {
		return false
	}
	if strings.HasSuffix(pattern, "/*") {
		base := strings.TrimSuffix(pattern, "/*")
		if path == base {
			return true
		}
		return strings.HasPrefix(path, base+"/")
	}
	return path == pattern
}

func routeLabel(path string, nav SiteNavigation) string {
	for _, route := range nav.Routes {
		if normalizePath(route.Path) == path && route.Label != "" {
			return route.Label
		}
	}
	return path
}

func AppendToSystemPrompt(base string) string {
	if base == "" {
		return Instructions()
	}
	return base + "\n\n" + Instructions()
}

// FormatMarker builds a navigation marker for tests or stubs.
func FormatMarker(path, label string) string {
	payload, _ := json.Marshal(NavigatePayload{Path: path, Label: label})
	return fmt.Sprintf("%s%s%s", navMarkerPrefix, string(payload), navMarkerSuffix)
}

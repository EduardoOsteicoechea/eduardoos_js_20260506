package navigation

import "testing"

func TestParseReply_validMarker(t *testing.T) {
	nav := SiteNavigation{
		Routes: []NavRoute{{Path: "/series", Label: "Series"}},
		PathPatterns: []string{"/series/*"},
	}
	raw := "Te llevo allí.\n@@NAV@@{\"path\":\"/series\",\"label\":\"Estudios\"}@@"
	reply, actions := ParseReply(raw, nav)
	if reply != "Te llevo allí." {
		t.Fatalf("reply = %q", reply)
	}
	if len(actions) != 1 || actions[0].Path != "/series" {
		t.Fatalf("actions = %+v", actions)
	}
}

func TestParseReply_rejectsExternal(t *testing.T) {
	nav := SiteNavigation{Routes: []NavRoute{{Path: "/", Label: "Home"}}}
	raw := "Ok\n@@NAV@@{\"path\":\"https://evil.test\"}@@"
	reply, actions := ParseReply(raw, nav)
	if len(actions) != 0 {
		t.Fatalf("expected no actions, got %+v", actions)
	}
	if reply == "" {
		t.Fatal("reply should remain")
	}
}

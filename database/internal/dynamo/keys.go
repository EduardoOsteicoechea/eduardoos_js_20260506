package dynamo

import (
	"fmt"
	"strings"
)

const (
	skMeta     = "META"
	skVersion  = "V#CURRENT"
	gsiChapter = "chapter_index"
)

func seriesPK(slug string) string {
	return "SERIES#" + strings.TrimSpace(slug)
}

func chapterSK(chapter string) string {
	return "CHAPTER#" + strings.TrimSpace(chapter)
}

func postPK(seriesSlug, chapter, slug string) string {
	return fmt.Sprintf("POST#%s#%s#%s",
		strings.TrimSpace(seriesSlug),
		strings.TrimSpace(chapter),
		strings.TrimSpace(slug),
	)
}

func chapterGSI1PK(seriesSlug, chapter string) string {
	return fmt.Sprintf("SERIES#%s#CHAPTER#%s",
		strings.TrimSpace(seriesSlug),
		strings.TrimSpace(chapter),
	)
}

func sortGSI1SK(sortOrder int, slug string) string {
	return fmt.Sprintf("SORT#%03d#%s", sortOrder, strings.TrimSpace(slug))
}

func seriesSlugFromPK(pk string) string {
	return strings.TrimPrefix(pk, "SERIES#")
}

func chapterFromSK(sk string) string {
	return strings.TrimPrefix(sk, "CHAPTER#")
}

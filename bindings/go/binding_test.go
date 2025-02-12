package tree_sitter_epics_db_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_epics_db "github.com/tree-sitter-grammars/tree-sitter-epics-db/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_epics_db.Language())
	if language == nil {
		t.Errorf("Error loading EpicsDb grammar")
	}
}

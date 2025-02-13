from unittest import TestCase

import tree_sitter
import tree_sitter_epics_db


class TestLanguage(TestCase):
    def test_can_load_grammar(self):
        try:
            tree_sitter.Language(tree_sitter_epics_db.language())
        except Exception:
            self.fail("Error loading EpicsDb grammar")

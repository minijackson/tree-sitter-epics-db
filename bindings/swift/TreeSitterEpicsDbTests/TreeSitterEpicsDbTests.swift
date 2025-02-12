import XCTest
import SwiftTreeSitter
import TreeSitterEpicsDb

final class TreeSitterEpicsDbTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_epics_db())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading EpicsDb grammar")
    }
}

// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterEpicsDb",
    products: [
        .library(name: "TreeSitterEpicsDb", targets: ["TreeSitterEpicsDb"]),
    ],
    dependencies: [
        .package(url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterEpicsDb",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterEpicsDbTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterEpicsDb",
            ],
            path: "bindings/swift/TreeSitterEpicsDbTests"
        )
    ],
    cLanguageStandard: .c11
)

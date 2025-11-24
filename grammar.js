/**
 * @file Grammar for EPICS' database and database definition files
 * @author Rémi NICOLE <remi.nicole@cea.fr>
 * @license MIT
 *
 * Specifications:
 * https://docs.epics-controls.org/en/latest/appdevguide/databaseDefinition.html
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "epics_db",

  extras: ($) => [/\s/, $.comment, $.macro_expansion],

  rules: {
    source_file: ($) => repeat($._statements),

    _statements: ($) =>
      choice(
        $.path_definition,
        $.include_statement,
        $.menu_definition,
        $.record_type_definition,
        $.device_support_declaration,
        $.driver_declaration,
        $.link_declaration,
        $.registrar_declaration,
        $.variable_declaration,
        $.function_declaration,
        $.breakpoint_table,
        $.record_instance,
        $.alias_statement
      ),

    path_definition: ($) => seq(choice("path", "addpath"), $._string),

    include_statement: ($) => seq("include", $._string),

    menu_definition: ($) =>
      seq(
        "menu",
        "(",
        field("name", $._string),
        ")",
        "{",
        repeat(choice($.menu_choice, $.include_statement)),
        "}"
      ),

    menu_choice: ($) =>
      seq(
        "choice",
        "(",
        field("name", $._string),
        ",",
        field("string", $._string),
        ")"
      ),

    record_type_definition: ($) =>
      seq(
        "recordtype",
        "(",
        field("name", $.record_type),
        ")",
        "{",
        repeat(choice($.field_definition, $.include_statement, $.cdef)),
        "}"
      ),

    field_definition: ($) =>
      seq(
        "field",
        "(",
        field("name", $.field_name),
        ",",
        field("type", $._string),
        ")",
        "{",
        repeat($.field_descriptor),
        "}"
      ),

    field_descriptor: ($) =>
      seq($.field_item, "(", field("value", $._string), ")"),

    field_item: ($) => alias($.word, "field_item"),

    cdef: ($) => seq("%", field("code", $.ccode)),

    ccode: ($) => /.*/,

    device_support_declaration: ($) =>
      seq(
        "device",
        "(",
        field("record_type", $.record_type),
        ",",
        field("link_type", $._string),
        ",",
        field("dset_name", $._string),
        ",",
        field("choice", $._string),
        ")"
      ),

    driver_declaration: ($) => seq("driver", "(", field("name", $._string), ")"),

    // Not documented, but present
    link_declaration: ($) =>
      seq(
        "link",
        "(",
        field("name", $._string),
        ",",
        field("jlif_name", $._string),
        ")"
      ),

    registrar_declaration: ($) =>
      seq("registrar", "(", field("name", $._string), ")"),
    variable_declaration: ($) =>
      seq(
        "variable",
        "(",
        field("name", $._string),
        optional(seq(",", field("type", $._string))),
        ")"
      ),
    function_declaration: ($) =>
      seq("function", "(", field("name", $._string), ")"),

    breakpoint_table: ($) =>
      seq(
        "breaktable",
        "(",
        field("name", $._string),
        ")",
        "{",
        repeat($.breakpoint_item),
        "}"
      ),
    breakpoint_item: ($) =>
      seq(
        field("raw_value", $.number),
        optional(","),
        field("eng_value", $.number),
        optional(",")
      ),

    // According to the strtod(3) manpage
    number: ($) =>
      /[+-]?(([0-9]+(\.[0-9]*)?|\.[0-9]+)(e[+-]?[0-9]+)?|0x[0-9a-f]+(\.[0-9a-f]*)?(p[+-]?[0-9]+)?|inf(inity)?|nan)/i,

    record_instance: ($) =>
      seq(
        choice("record", "grecord"),
        "(",
        field("type", $.record_type),
        ",",
        field("name", $.record_name),
        ")",
        optional(
          seq(
            "{",
            repeat(choice($.alias, $.field, $.info, $.include_statement)),
            "}"
          )
        )
      ),

    alias: ($) => seq("alias", "(", field("alias_name", $.record_name), ")"),

    field: ($) =>
      seq(
        "field",
        "(",
        field("name", $.field_name),
        ",",
        field("value", $._field_value),
        ")"
      ),

    info: ($) =>
      seq(
        "info",
        "(",
        field("name", $._string),
        ",",
        field("value", $._field_value),
        ")"
      ),

    _field_value: ($) =>
      choice(
        $._string,
        $.number,
        $.json_value,
      ),

    alias_statement: ($) =>
      seq(
        "alias",
        "(",
        field("record_name", $.record_name),
        ",",
        field("alias_name", $.record_name),
        ")"
      ),

    _type: ($) => /\w+/,

    comment: ($) => seq("#", /.*/),

    _string: ($) => choice($.string, $.word),

    string: ($) =>
      seq(
        '"',
        repeat(choice($.escape_sequence, $.string_text_fragment)),
        '"'
      ),

    string_text_fragment: ($) =>
      prec.right(
        repeat1(
          choice(token.immediate(prec(1, /[^"\\$]+/)), token.immediate("\\"))
        )
      ),

    // https://docs.epics-controls.org/en/latest/appdevguide/databaseDefinition.html#escape-sequences
    escape_sequence: ($) =>
      token.immediate(/\\([abfnrtv\\'"$]|[0-7]{3}|x[0-9a-fA-F]{2})/),

    // Not exactly true, the EPICS version of JSON is slightly different.
    // e.g. object keys don't have to be quoted.
    // See:
    // - `modules/database/src/ioc/dbStatic/dbLex.l`
    // - `modules/database/src/ioc/dbStatic/dbYacc.y`
    json_value: ($) =>
      choice($._json_object, $._json_array, "null", "true", "false"),
    // Just match balanced delimiters
    _json_object: ($) => seq("{", repeat(choice(/[^{}]/, $._json_object)), "}"),
    _json_array: ($) => seq("[", repeat(choice(/[^\[\]]/, $._json_array)), "]"),

    word: ($) => /[a-zA-Z0-9_+:.\[\]<>;-]+/,

    record_type: ($) => $._string,
    record_name: ($) => $._string,
    field_name: ($) => $._string,

    macro_expansion: ($) =>
      choice(
        seq("${", repeat1(choice(/[^}]+/, $.macro_expansion)), "}"),
        seq("$(", repeat1(choice(/[^)]+/, $.macro_expansion)), ")")
      ),
  },
});

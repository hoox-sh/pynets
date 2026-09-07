// Generated from /home/jango/Git/pynescript/src/pynescript/ast/grammar/antlr4/resource/PinescriptParser.g4 by ANTLR 4.13.2
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
	ATN,
	ATNDeserializer, DecisionState, DFA, FailedPredicateException,
	RecognitionException, NoViableAltException, BailErrorStrategy,
	Parser, ParserATNSimulator,
	RuleContext, ParserRuleContext, PredictionMode, PredictionContextCache,
	TerminalNode, RuleNode,
	Token, TokenStream,
	Interval, IntervalSet
} from 'antlr4';
import PinescriptParserVisitor from "./PinescriptParserVisitor.ts";

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

import PinescriptParserBase from './PinescriptParserBase.ts';

export default class PinescriptParser extends PinescriptParserBase {
	public static readonly INDENT = 1;
	public static readonly DEDENT = 2;
	public static readonly AND = 3;
	public static readonly AS = 4;
	public static readonly BREAK = 5;
	public static readonly BY = 6;
	public static readonly CONST = 7;
	public static readonly CONTINUE = 8;
	public static readonly ELSE = 9;
	public static readonly ENUM = 10;
	public static readonly EXPORT = 11;
	public static readonly FALSE = 12;
	public static readonly FOR = 13;
	public static readonly IF = 14;
	public static readonly IMPORT = 15;
	public static readonly IN = 16;
	public static readonly INPUT = 17;
	public static readonly METHOD = 18;
	public static readonly NOT = 19;
	public static readonly OR = 20;
	public static readonly SERIES = 21;
	public static readonly SIMPLE = 22;
	public static readonly SWITCH = 23;
	public static readonly TO = 24;
	public static readonly TYPE = 25;
	public static readonly TRUE = 26;
	public static readonly VAR = 27;
	public static readonly VARIP = 28;
	public static readonly WHILE = 29;
	public static readonly LPAR = 30;
	public static readonly RPAR = 31;
	public static readonly LSQB = 32;
	public static readonly RSQB = 33;
	public static readonly LSHIFT = 34;
	public static readonly RSHIFT = 35;
	public static readonly LESSEQUAL = 36;
	public static readonly GREATEREQUAL = 37;
	public static readonly EQEQUAL = 38;
	public static readonly NOTEQUAL = 39;
	public static readonly LESS = 40;
	public static readonly GREATER = 41;
	public static readonly EQUAL = 42;
	public static readonly RARROW = 43;
	public static readonly DOT = 44;
	public static readonly COMMA = 45;
	public static readonly COLON = 46;
	public static readonly QUESTION = 47;
	public static readonly TILDE = 48;
	public static readonly AMP = 49;
	public static readonly PIPE = 50;
	public static readonly CARET = 51;
	public static readonly PLUS = 52;
	public static readonly MINUS = 53;
	public static readonly STAR = 54;
	public static readonly SLASH = 55;
	public static readonly PERCENT = 56;
	public static readonly PLUSEQUAL = 57;
	public static readonly MINEQUAL = 58;
	public static readonly STAREQUAL = 59;
	public static readonly SLASHEQUAL = 60;
	public static readonly PERCENTEQUAL = 61;
	public static readonly COLONEQUAL = 62;
	public static readonly NAME = 63;
	public static readonly NUMBER = 64;
	public static readonly STRING = 65;
	public static readonly COLOR = 66;
	public static readonly NEWLINE = 67;
	public static readonly WS = 68;
	public static readonly COMMENT = 69;
	public static readonly UNICODE_NOISE = 70;
	public static readonly ERROR_TOKEN = 71;
	public static override readonly EOF = Token.EOF;
	public static readonly RULE_start = 0;
	public static readonly RULE_start_script = 1;
	public static readonly RULE_start_expression = 2;
	public static readonly RULE_start_comments = 3;
	public static readonly RULE_statements = 4;
	public static readonly RULE_statement = 5;
	public static readonly RULE_compound_statement = 6;
	public static readonly RULE_simple_statements = 7;
	public static readonly RULE_trailing_structure_statements = 8;
	public static readonly RULE_simple_statement = 9;
	public static readonly RULE_compound_assignment = 10;
	public static readonly RULE_compound_variable_initialization = 11;
	public static readonly RULE_compound_name_initialization = 12;
	public static readonly RULE_compound_tuple_initialization = 13;
	public static readonly RULE_compound_reassignment = 14;
	public static readonly RULE_compound_augassignment = 15;
	public static readonly RULE_function_declaration = 16;
	public static readonly RULE_parameter_list = 17;
	public static readonly RULE_parameter_definition = 18;
	public static readonly RULE_method_declaration = 19;
	public static readonly RULE_method_parameter_list = 20;
	public static readonly RULE_method_parameter_definition = 21;
	public static readonly RULE_type_declaration = 22;
	public static readonly RULE_field_definitions = 23;
	public static readonly RULE_field_definition = 24;
	public static readonly RULE_enum_declaration = 25;
	public static readonly RULE_enum_definitions = 26;
	public static readonly RULE_enum_definition = 27;
	public static readonly RULE_structure = 28;
	public static readonly RULE_structure_statement = 29;
	public static readonly RULE_structure_expression = 30;
	public static readonly RULE_if_structure = 31;
	public static readonly RULE_elif_structure = 32;
	public static readonly RULE_if_tail = 33;
	public static readonly RULE_else_block = 34;
	public static readonly RULE_for_structure = 35;
	public static readonly RULE_for_structure_to = 36;
	public static readonly RULE_for_structure_in = 37;
	public static readonly RULE_for_iterator = 38;
	public static readonly RULE_while_structure = 39;
	public static readonly RULE_switch_structure = 40;
	public static readonly RULE_switch_cases = 41;
	public static readonly RULE_switch_pattern_case = 42;
	public static readonly RULE_switch_default_case = 43;
	public static readonly RULE_local_block = 44;
	public static readonly RULE_indented_local_block = 45;
	public static readonly RULE_inline_local_block = 46;
	public static readonly RULE_simple_assignment = 47;
	public static readonly RULE_simple_variable_initialization = 48;
	public static readonly RULE_simple_name_initialization = 49;
	public static readonly RULE_simple_tuple_initialization = 50;
	public static readonly RULE_simple_reassignment = 51;
	public static readonly RULE_simple_augassignment = 52;
	public static readonly RULE_expression = 53;
	public static readonly RULE_expression_statement = 54;
	public static readonly RULE_conditional_expression = 55;
	public static readonly RULE_disjunction_expression = 56;
	public static readonly RULE_conjunction_expression = 57;
	public static readonly RULE_bitwise_or_expression = 58;
	public static readonly RULE_bitwise_xor_expression = 59;
	public static readonly RULE_bitwise_and_expression = 60;
	public static readonly RULE_equality_expression = 61;
	public static readonly RULE_equality_trailing_pair = 62;
	public static readonly RULE_equal_trailing_pair = 63;
	public static readonly RULE_not_equal_trailing_pair = 64;
	public static readonly RULE_inequality_expression = 65;
	public static readonly RULE_inequality_trailing_pair = 66;
	public static readonly RULE_less_than_equal_trailing_pair = 67;
	public static readonly RULE_less_than_trailing_pair = 68;
	public static readonly RULE_greater_than_equal_trailing_pair = 69;
	public static readonly RULE_greater_than_trailing_pair = 70;
	public static readonly RULE_shift_expression = 71;
	public static readonly RULE_shift_op = 72;
	public static readonly RULE_additive_expression = 73;
	public static readonly RULE_additive_op = 74;
	public static readonly RULE_multiplicative_expression = 75;
	public static readonly RULE_multiplicative_op = 76;
	public static readonly RULE_unary_expression = 77;
	public static readonly RULE_unary_op = 78;
	public static readonly RULE_primary_expression = 79;
	public static readonly RULE_argument_list = 80;
	public static readonly RULE_argument_definition = 81;
	public static readonly RULE_subscript_slice = 82;
	public static readonly RULE_atomic_expression = 83;
	public static readonly RULE_literal_expression = 84;
	public static readonly RULE_literal_number = 85;
	public static readonly RULE_literal_string = 86;
	public static readonly RULE_literal_bool = 87;
	public static readonly RULE_literal_color = 88;
	public static readonly RULE_grouped_expression = 89;
	public static readonly RULE_tuple_expression = 90;
	public static readonly RULE_import_statement = 91;
	public static readonly RULE_break_statement = 92;
	public static readonly RULE_continue_statement = 93;
	public static readonly RULE_variable_declaration = 94;
	public static readonly RULE_tuple_declaration = 95;
	public static readonly RULE_declaration_mode = 96;
	public static readonly RULE_assignment_target = 97;
	public static readonly RULE_assignment_target_attribute = 98;
	public static readonly RULE_assignment_target_subscript = 99;
	public static readonly RULE_assignment_target_name = 100;
	public static readonly RULE_assignment_target_group = 101;
	public static readonly RULE_augassign_op = 102;
	public static readonly RULE_type_specification = 103;
	public static readonly RULE_type_qualifier = 104;
	public static readonly RULE_attributed_type_name = 105;
	public static readonly RULE_template_spec_suffix = 106;
	public static readonly RULE_array_type_suffix = 107;
	public static readonly RULE_type_argument_list = 108;
	public static readonly RULE_name = 109;
	public static readonly RULE_name_load = 110;
	public static readonly RULE_name_store = 111;
	public static readonly RULE_comments = 112;
	public static readonly RULE_comment = 113;
	public static readonly literalNames: (string | null)[] = [ null, null, 
                                                            null, "'and'", 
                                                            "'as'", "'break'", 
                                                            "'by'", "'const'", 
                                                            "'continue'", 
                                                            "'else'", "'enum'", 
                                                            "'export'", 
                                                            "'false'", "'for'", 
                                                            "'if'", "'import'", 
                                                            "'in'", "'input'", 
                                                            "'method'", 
                                                            "'not'", "'or'", 
                                                            "'series'", 
                                                            "'simple'", 
                                                            "'switch'", 
                                                            "'to'", "'type'", 
                                                            "'true'", "'var'", 
                                                            "'varip'", "'while'", 
                                                            "'('", "')'", 
                                                            "'['", "']'", 
                                                            "'<<'", "'>>'", 
                                                            "'<='", "'>='", 
                                                            "'=='", "'!='", 
                                                            "'<'", "'>'", 
                                                            "'='", "'=>'", 
                                                            "'.'", "','", 
                                                            "':'", "'?'", 
                                                            "'~'", "'&'", 
                                                            "'|'", "'^'", 
                                                            "'+'", "'-'", 
                                                            "'*'", "'/'", 
                                                            "'%'", "'+='", 
                                                            "'-='", "'*='", 
                                                            "'/='", "'%='", 
                                                            "':='" ];
	public static readonly symbolicNames: (string | null)[] = [ null, "INDENT", 
                                                             "DEDENT", "AND", 
                                                             "AS", "BREAK", 
                                                             "BY", "CONST", 
                                                             "CONTINUE", 
                                                             "ELSE", "ENUM", 
                                                             "EXPORT", "FALSE", 
                                                             "FOR", "IF", 
                                                             "IMPORT", "IN", 
                                                             "INPUT", "METHOD", 
                                                             "NOT", "OR", 
                                                             "SERIES", "SIMPLE", 
                                                             "SWITCH", "TO", 
                                                             "TYPE", "TRUE", 
                                                             "VAR", "VARIP", 
                                                             "WHILE", "LPAR", 
                                                             "RPAR", "LSQB", 
                                                             "RSQB", "LSHIFT", 
                                                             "RSHIFT", "LESSEQUAL", 
                                                             "GREATEREQUAL", 
                                                             "EQEQUAL", 
                                                             "NOTEQUAL", 
                                                             "LESS", "GREATER", 
                                                             "EQUAL", "RARROW", 
                                                             "DOT", "COMMA", 
                                                             "COLON", "QUESTION", 
                                                             "TILDE", "AMP", 
                                                             "PIPE", "CARET", 
                                                             "PLUS", "MINUS", 
                                                             "STAR", "SLASH", 
                                                             "PERCENT", 
                                                             "PLUSEQUAL", 
                                                             "MINEQUAL", 
                                                             "STAREQUAL", 
                                                             "SLASHEQUAL", 
                                                             "PERCENTEQUAL", 
                                                             "COLONEQUAL", 
                                                             "NAME", "NUMBER", 
                                                             "STRING", "COLOR", 
                                                             "NEWLINE", 
                                                             "WS", "COMMENT", 
                                                             "UNICODE_NOISE", 
                                                             "ERROR_TOKEN" ];
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"start", "start_script", "start_expression", "start_comments", "statements", 
		"statement", "compound_statement", "simple_statements", "trailing_structure_statements", 
		"simple_statement", "compound_assignment", "compound_variable_initialization", 
		"compound_name_initialization", "compound_tuple_initialization", "compound_reassignment", 
		"compound_augassignment", "function_declaration", "parameter_list", "parameter_definition", 
		"method_declaration", "method_parameter_list", "method_parameter_definition", 
		"type_declaration", "field_definitions", "field_definition", "enum_declaration", 
		"enum_definitions", "enum_definition", "structure", "structure_statement", 
		"structure_expression", "if_structure", "elif_structure", "if_tail", "else_block", 
		"for_structure", "for_structure_to", "for_structure_in", "for_iterator", 
		"while_structure", "switch_structure", "switch_cases", "switch_pattern_case", 
		"switch_default_case", "local_block", "indented_local_block", "inline_local_block", 
		"simple_assignment", "simple_variable_initialization", "simple_name_initialization", 
		"simple_tuple_initialization", "simple_reassignment", "simple_augassignment", 
		"expression", "expression_statement", "conditional_expression", "disjunction_expression", 
		"conjunction_expression", "bitwise_or_expression", "bitwise_xor_expression", 
		"bitwise_and_expression", "equality_expression", "equality_trailing_pair", 
		"equal_trailing_pair", "not_equal_trailing_pair", "inequality_expression", 
		"inequality_trailing_pair", "less_than_equal_trailing_pair", "less_than_trailing_pair", 
		"greater_than_equal_trailing_pair", "greater_than_trailing_pair", "shift_expression", 
		"shift_op", "additive_expression", "additive_op", "multiplicative_expression", 
		"multiplicative_op", "unary_expression", "unary_op", "primary_expression", 
		"argument_list", "argument_definition", "subscript_slice", "atomic_expression", 
		"literal_expression", "literal_number", "literal_string", "literal_bool", 
		"literal_color", "grouped_expression", "tuple_expression", "import_statement", 
		"break_statement", "continue_statement", "variable_declaration", "tuple_declaration", 
		"declaration_mode", "assignment_target", "assignment_target_attribute", 
		"assignment_target_subscript", "assignment_target_name", "assignment_target_group", 
		"augassign_op", "type_specification", "type_qualifier", "attributed_type_name", 
		"template_spec_suffix", "array_type_suffix", "type_argument_list", "name", 
		"name_load", "name_store", "comments", "comment",
	];
	public get grammarFileName(): string { return "PinescriptParser.g4"; }
	public get literalNames(): (string | null)[] { return PinescriptParser.literalNames; }
	public get symbolicNames(): (string | null)[] { return PinescriptParser.symbolicNames; }
	public get ruleNames(): string[] { return PinescriptParser.ruleNames; }
	public get serializedATN(): number[] { return PinescriptParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(this, PinescriptParser._ATN, PinescriptParser.DecisionsToDFA, new PredictionContextCache());
	}
	// @RuleVersion(0)
	public start(): StartContext {
		let localctx: StartContext = new StartContext(this, this._ctx, this.state);
		this.enterRule(localctx, 0, PinescriptParser.RULE_start);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 228;
			this.start_script();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public start_script(): Start_scriptContext {
		let localctx: Start_scriptContext = new Start_scriptContext(this, this._ctx, this.state);
		this.enterRule(localctx, 2, PinescriptParser.RULE_start_script);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 231;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 402583519) !== 0) || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 491569) !== 0)) {
				{
				this.state = 230;
				this.statements();
				}
			}

			this.state = 233;
			this.match(PinescriptParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public start_expression(): Start_expressionContext {
		let localctx: Start_expressionContext = new Start_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 4, PinescriptParser.RULE_start_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 235;
			this.expression();
			this.state = 237;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===67) {
				{
				this.state = 236;
				this.match(PinescriptParser.NEWLINE);
				}
			}

			this.state = 239;
			this.match(PinescriptParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public start_comments(): Start_commentsContext {
		let localctx: Start_commentsContext = new Start_commentsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 6, PinescriptParser.RULE_start_comments);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 242;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===69) {
				{
				this.state = 241;
				this.comments();
				}
			}

			this.state = 244;
			this.match(PinescriptParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public statements(): StatementsContext {
		let localctx: StatementsContext = new StatementsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 8, PinescriptParser.RULE_statements);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 247;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 246;
				this.statement();
				}
				}
				this.state = 249;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 402583519) !== 0) || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 491569) !== 0));
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public statement(): StatementContext {
		let localctx: StatementContext = new StatementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 10, PinescriptParser.RULE_statement);
		try {
			this.state = 254;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 251;
				this.compound_statement();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 252;
				this.simple_statements();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 253;
				this.trailing_structure_statements();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public compound_statement(): Compound_statementContext {
		let localctx: Compound_statementContext = new Compound_statementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 12, PinescriptParser.RULE_compound_statement);
		try {
			this.state = 262;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 256;
				this.compound_assignment();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 257;
				this.type_declaration();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 258;
				this.enum_declaration();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 259;
				this.structure_statement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 260;
				this.method_declaration();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 261;
				this.function_declaration();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_statements(): Simple_statementsContext {
		let localctx: Simple_statementsContext = new Simple_statementsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 14, PinescriptParser.RULE_simple_statements);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 264;
			this.simple_statement();
			this.state = 269;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 265;
					this.match(PinescriptParser.COMMA);
					this.state = 266;
					this.simple_statement();
					}
					}
				}
				this.state = 271;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
			}
			this.state = 273;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===45) {
				{
				this.state = 272;
				this.match(PinescriptParser.COMMA);
				}
			}

			this.state = 275;
			this.match(PinescriptParser.NEWLINE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public trailing_structure_statements(): Trailing_structure_statementsContext {
		let localctx: Trailing_structure_statementsContext = new Trailing_structure_statementsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 16, PinescriptParser.RULE_trailing_structure_statements);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 277;
			this.simple_statement();
			this.state = 282;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 278;
					this.match(PinescriptParser.COMMA);
					this.state = 279;
					this.simple_statement();
					}
					}
				}
				this.state = 284;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
			}
			this.state = 285;
			this.match(PinescriptParser.COMMA);
			this.state = 286;
			this.structure();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_statement(): Simple_statementContext {
		let localctx: Simple_statementContext = new Simple_statementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 18, PinescriptParser.RULE_simple_statement);
		try {
			this.state = 293;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 288;
				this.simple_assignment();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 289;
				this.expression_statement();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 290;
				this.import_statement();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 291;
				this.break_statement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 292;
				this.continue_statement();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public compound_assignment(): Compound_assignmentContext {
		let localctx: Compound_assignmentContext = new Compound_assignmentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 20, PinescriptParser.RULE_compound_assignment);
		try {
			this.state = 298;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 295;
				this.compound_variable_initialization();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 296;
				this.compound_reassignment();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 297;
				this.compound_augassignment();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public compound_variable_initialization(): Compound_variable_initializationContext {
		let localctx: Compound_variable_initializationContext = new Compound_variable_initializationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 22, PinescriptParser.RULE_compound_variable_initialization);
		try {
			this.state = 302;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 6:
			case 7:
			case 10:
			case 11:
			case 17:
			case 18:
			case 21:
			case 22:
			case 24:
			case 25:
			case 27:
			case 28:
			case 63:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 300;
				this.compound_name_initialization();
				}
				break;
			case 32:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 301;
				this.compound_tuple_initialization();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public compound_name_initialization(): Compound_name_initializationContext {
		let localctx: Compound_name_initializationContext = new Compound_name_initializationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 24, PinescriptParser.RULE_compound_name_initialization);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 305;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 304;
				this.match(PinescriptParser.EXPORT);
				}
			}

			this.state = 307;
			this.variable_declaration();
			this.state = 308;
			this.match(PinescriptParser.EQUAL);
			this.state = 309;
			this.structure_expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public compound_tuple_initialization(): Compound_tuple_initializationContext {
		let localctx: Compound_tuple_initializationContext = new Compound_tuple_initializationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 26, PinescriptParser.RULE_compound_tuple_initialization);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 311;
			this.tuple_declaration();
			this.state = 312;
			this.match(PinescriptParser.EQUAL);
			this.state = 313;
			this.structure_expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public compound_reassignment(): Compound_reassignmentContext {
		let localctx: Compound_reassignmentContext = new Compound_reassignmentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 28, PinescriptParser.RULE_compound_reassignment);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 315;
			this.primary_expression(0);
			this.state = 316;
			this.match(PinescriptParser.COLONEQUAL);
			this.state = 317;
			this.structure_expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public compound_augassignment(): Compound_augassignmentContext {
		let localctx: Compound_augassignmentContext = new Compound_augassignmentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 30, PinescriptParser.RULE_compound_augassignment);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 319;
			this.primary_expression(0);
			this.state = 320;
			this.augassign_op();
			this.state = 321;
			this.structure_expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public function_declaration(): Function_declarationContext {
		let localctx: Function_declarationContext = new Function_declarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 32, PinescriptParser.RULE_function_declaration);
		let _la: number;
		try {
			this.state = 348;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 17, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 324;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11) {
					{
					this.state = 323;
					this.match(PinescriptParser.EXPORT);
					}
				}

				this.state = 326;
				this.type_specification();
				this.state = 327;
				this.name();
				this.state = 328;
				this.match(PinescriptParser.LPAR);
				this.state = 330;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 57017552) !== 0) || _la===63) {
					{
					this.state = 329;
					this.parameter_list();
					}
				}

				this.state = 332;
				this.match(PinescriptParser.RPAR);
				this.state = 333;
				this.match(PinescriptParser.RARROW);
				this.state = 334;
				this.local_block();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 337;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11) {
					{
					this.state = 336;
					this.match(PinescriptParser.EXPORT);
					}
				}

				this.state = 339;
				this.name();
				this.state = 340;
				this.match(PinescriptParser.LPAR);
				this.state = 342;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 57017552) !== 0) || _la===63) {
					{
					this.state = 341;
					this.parameter_list();
					}
				}

				this.state = 344;
				this.match(PinescriptParser.RPAR);
				this.state = 345;
				this.match(PinescriptParser.RARROW);
				this.state = 346;
				this.local_block();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public parameter_list(): Parameter_listContext {
		let localctx: Parameter_listContext = new Parameter_listContext(this, this._ctx, this.state);
		this.enterRule(localctx, 34, PinescriptParser.RULE_parameter_list);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 350;
			this.parameter_definition();
			this.state = 355;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 351;
					this.match(PinescriptParser.COMMA);
					this.state = 352;
					this.parameter_definition();
					}
					}
				}
				this.state = 357;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
			}
			this.state = 359;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===45) {
				{
				this.state = 358;
				this.match(PinescriptParser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public parameter_definition(): Parameter_definitionContext {
		let localctx: Parameter_definitionContext = new Parameter_definitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 36, PinescriptParser.RULE_parameter_definition);
		let _la: number;
		try {
			this.state = 372;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 22, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 361;
				this.type_specification();
				this.state = 362;
				this.name_store();
				this.state = 365;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===42) {
					{
					this.state = 363;
					this.match(PinescriptParser.EQUAL);
					this.state = 364;
					this.expression();
					}
				}

				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 367;
				this.name_store();
				this.state = 370;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===42) {
					{
					this.state = 368;
					this.match(PinescriptParser.EQUAL);
					this.state = 369;
					this.expression();
					}
				}

				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public method_declaration(): Method_declarationContext {
		let localctx: Method_declarationContext = new Method_declarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 38, PinescriptParser.RULE_method_declaration);
		let _la: number;
		try {
			this.state = 401;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 375;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11) {
					{
					this.state = 374;
					this.match(PinescriptParser.EXPORT);
					}
				}

				this.state = 377;
				this.match(PinescriptParser.METHOD);
				this.state = 378;
				this.type_specification();
				this.state = 379;
				this.name();
				this.state = 380;
				this.match(PinescriptParser.LPAR);
				this.state = 382;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 57017552) !== 0) || _la===63) {
					{
					this.state = 381;
					this.method_parameter_list();
					}
				}

				this.state = 384;
				this.match(PinescriptParser.RPAR);
				this.state = 385;
				this.match(PinescriptParser.RARROW);
				this.state = 386;
				this.local_block();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 389;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11) {
					{
					this.state = 388;
					this.match(PinescriptParser.EXPORT);
					}
				}

				this.state = 391;
				this.match(PinescriptParser.METHOD);
				this.state = 392;
				this.name();
				this.state = 393;
				this.match(PinescriptParser.LPAR);
				this.state = 395;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 57017552) !== 0) || _la===63) {
					{
					this.state = 394;
					this.method_parameter_list();
					}
				}

				this.state = 397;
				this.match(PinescriptParser.RPAR);
				this.state = 398;
				this.match(PinescriptParser.RARROW);
				this.state = 399;
				this.local_block();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public method_parameter_list(): Method_parameter_listContext {
		let localctx: Method_parameter_listContext = new Method_parameter_listContext(this, this._ctx, this.state);
		this.enterRule(localctx, 40, PinescriptParser.RULE_method_parameter_list);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 403;
			this.method_parameter_definition();
			this.state = 408;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 28, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 404;
					this.match(PinescriptParser.COMMA);
					this.state = 405;
					this.method_parameter_definition();
					}
					}
				}
				this.state = 410;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 28, this._ctx);
			}
			this.state = 412;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===45) {
				{
				this.state = 411;
				this.match(PinescriptParser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public method_parameter_definition(): Method_parameter_definitionContext {
		let localctx: Method_parameter_definitionContext = new Method_parameter_definitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 42, PinescriptParser.RULE_method_parameter_definition);
		try {
			this.state = 418;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 414;
				this.type_specification();
				this.state = 415;
				this.name_store();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 417;
				this.parameter_definition();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public type_declaration(): Type_declarationContext {
		let localctx: Type_declarationContext = new Type_declarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 44, PinescriptParser.RULE_type_declaration);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 421;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 420;
				this.match(PinescriptParser.EXPORT);
				}
			}

			this.state = 423;
			this.match(PinescriptParser.TYPE);
			this.state = 424;
			this.name();
			this.state = 425;
			this.match(PinescriptParser.NEWLINE);
			this.state = 426;
			this.match(PinescriptParser.INDENT);
			this.state = 427;
			this.field_definitions();
			this.state = 428;
			this.match(PinescriptParser.DEDENT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public field_definitions(): Field_definitionsContext {
		let localctx: Field_definitionsContext = new Field_definitionsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 46, PinescriptParser.RULE_field_definitions);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 431;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 430;
				this.field_definition();
				}
				}
				this.state = 433;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 325453008) !== 0) || _la===63);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public field_definition(): Field_definitionContext {
		let localctx: Field_definitionContext = new Field_definitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 48, PinescriptParser.RULE_field_definition);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 436;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===28) {
				{
				this.state = 435;
				this.match(PinescriptParser.VARIP);
				}
			}

			this.state = 438;
			this.type_specification();
			this.state = 439;
			this.name_store();
			this.state = 442;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===42) {
				{
				this.state = 440;
				this.match(PinescriptParser.EQUAL);
				this.state = 441;
				this.expression();
				}
			}

			this.state = 444;
			this.match(PinescriptParser.NEWLINE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public enum_declaration(): Enum_declarationContext {
		let localctx: Enum_declarationContext = new Enum_declarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 50, PinescriptParser.RULE_enum_declaration);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 447;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 446;
				this.match(PinescriptParser.EXPORT);
				}
			}

			this.state = 449;
			this.match(PinescriptParser.ENUM);
			this.state = 450;
			this.name();
			this.state = 451;
			this.match(PinescriptParser.NEWLINE);
			this.state = 452;
			this.match(PinescriptParser.INDENT);
			this.state = 453;
			this.enum_definitions();
			this.state = 454;
			this.match(PinescriptParser.DEDENT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public enum_definitions(): Enum_definitionsContext {
		let localctx: Enum_definitionsContext = new Enum_definitionsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 52, PinescriptParser.RULE_enum_definitions);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 457;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 456;
				this.enum_definition();
				}
				}
				this.state = 459;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 57017552) !== 0) || _la===63);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public enum_definition(): Enum_definitionContext {
		let localctx: Enum_definitionContext = new Enum_definitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 54, PinescriptParser.RULE_enum_definition);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 461;
			this.name_store();
			this.state = 464;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===42) {
				{
				this.state = 462;
				this.match(PinescriptParser.EQUAL);
				this.state = 463;
				this.expression();
				}
			}

			this.state = 466;
			this.match(PinescriptParser.NEWLINE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public structure(): StructureContext {
		let localctx: StructureContext = new StructureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 56, PinescriptParser.RULE_structure);
		try {
			this.state = 472;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 14:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 468;
				this.if_structure();
				}
				break;
			case 13:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 469;
				this.for_structure();
				}
				break;
			case 29:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 470;
				this.while_structure();
				}
				break;
			case 23:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 471;
				this.switch_structure();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public structure_statement(): Structure_statementContext {
		let localctx: Structure_statementContext = new Structure_statementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 58, PinescriptParser.RULE_structure_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 474;
			this.structure();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public structure_expression(): Structure_expressionContext {
		let localctx: Structure_expressionContext = new Structure_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 60, PinescriptParser.RULE_structure_expression);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 476;
			this.structure();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public if_structure(): If_structureContext {
		let localctx: If_structureContext = new If_structureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 62, PinescriptParser.RULE_if_structure);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 478;
			this.match(PinescriptParser.IF);
			this.state = 479;
			this.expression();
			this.state = 480;
			this.local_block();
			this.state = 482;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 39, this._ctx) ) {
			case 1:
				{
				this.state = 481;
				this.if_tail();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public elif_structure(): Elif_structureContext {
		let localctx: Elif_structureContext = new Elif_structureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 64, PinescriptParser.RULE_elif_structure);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 484;
			this.match(PinescriptParser.ELSE);
			this.state = 485;
			this.match(PinescriptParser.IF);
			this.state = 486;
			this.expression();
			this.state = 487;
			this.local_block();
			this.state = 489;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 40, this._ctx) ) {
			case 1:
				{
				this.state = 488;
				this.if_tail();
				}
				break;
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public if_tail(): If_tailContext {
		let localctx: If_tailContext = new If_tailContext(this, this._ctx, this.state);
		this.enterRule(localctx, 66, PinescriptParser.RULE_if_tail);
		try {
			this.state = 493;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 41, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 491;
				this.elif_structure();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 492;
				this.else_block();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public else_block(): Else_blockContext {
		let localctx: Else_blockContext = new Else_blockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 68, PinescriptParser.RULE_else_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 495;
			this.match(PinescriptParser.ELSE);
			this.state = 496;
			this.local_block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public for_structure(): For_structureContext {
		let localctx: For_structureContext = new For_structureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 70, PinescriptParser.RULE_for_structure);
		try {
			this.state = 500;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 42, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 498;
				this.for_structure_to();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 499;
				this.for_structure_in();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public for_structure_to(): For_structure_toContext {
		let localctx: For_structure_toContext = new For_structure_toContext(this, this._ctx, this.state);
		this.enterRule(localctx, 72, PinescriptParser.RULE_for_structure_to);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 502;
			this.match(PinescriptParser.FOR);
			this.state = 503;
			this.for_iterator();
			this.state = 504;
			this.match(PinescriptParser.EQUAL);
			this.state = 505;
			this.expression();
			this.state = 506;
			this.match(PinescriptParser.TO);
			this.state = 507;
			this.expression();
			this.state = 510;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 43, this._ctx) ) {
			case 1:
				{
				this.state = 508;
				this.match(PinescriptParser.BY);
				this.state = 509;
				this.expression();
				}
				break;
			}
			this.state = 512;
			this.local_block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public for_structure_in(): For_structure_inContext {
		let localctx: For_structure_inContext = new For_structure_inContext(this, this._ctx, this.state);
		this.enterRule(localctx, 74, PinescriptParser.RULE_for_structure_in);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 514;
			this.match(PinescriptParser.FOR);
			this.state = 515;
			this.for_iterator();
			this.state = 516;
			this.match(PinescriptParser.IN);
			this.state = 517;
			this.expression();
			this.state = 518;
			this.local_block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public for_iterator(): For_iteratorContext {
		let localctx: For_iteratorContext = new For_iteratorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 76, PinescriptParser.RULE_for_iterator);
		try {
			this.state = 525;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 44, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 520;
				this.type_specification();
				this.state = 521;
				this.name_store();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 523;
				this.name_store();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 524;
				this.tuple_declaration();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public while_structure(): While_structureContext {
		let localctx: While_structureContext = new While_structureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 78, PinescriptParser.RULE_while_structure);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 527;
			this.match(PinescriptParser.WHILE);
			this.state = 528;
			this.expression();
			this.state = 529;
			this.local_block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public switch_structure(): Switch_structureContext {
		let localctx: Switch_structureContext = new Switch_structureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 80, PinescriptParser.RULE_switch_structure);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 531;
			this.match(PinescriptParser.SWITCH);
			this.state = 533;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 343335245) !== 0) || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 491569) !== 0)) {
				{
				this.state = 532;
				this.expression();
				}
			}

			this.state = 535;
			this.match(PinescriptParser.NEWLINE);
			this.state = 536;
			this.match(PinescriptParser.INDENT);
			this.state = 537;
			this.switch_cases();
			this.state = 538;
			this.match(PinescriptParser.DEDENT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public switch_cases(): Switch_casesContext {
		let localctx: Switch_casesContext = new Switch_casesContext(this, this._ctx, this.state);
		this.enterRule(localctx, 82, PinescriptParser.RULE_switch_cases);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 541;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 540;
				this.switch_pattern_case();
				}
				}
				this.state = 543;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 343335245) !== 0) || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 491569) !== 0));
			this.state = 546;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===43) {
				{
				this.state = 545;
				this.switch_default_case();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public switch_pattern_case(): Switch_pattern_caseContext {
		let localctx: Switch_pattern_caseContext = new Switch_pattern_caseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 84, PinescriptParser.RULE_switch_pattern_case);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 548;
			this.expression();
			this.state = 549;
			this.match(PinescriptParser.RARROW);
			this.state = 550;
			this.local_block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public switch_default_case(): Switch_default_caseContext {
		let localctx: Switch_default_caseContext = new Switch_default_caseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 86, PinescriptParser.RULE_switch_default_case);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 552;
			this.match(PinescriptParser.RARROW);
			this.state = 553;
			this.local_block();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public local_block(): Local_blockContext {
		let localctx: Local_blockContext = new Local_blockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 88, PinescriptParser.RULE_local_block);
		try {
			this.state = 557;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 67:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 555;
				this.indented_local_block();
				}
				break;
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
			case 17:
			case 18:
			case 19:
			case 21:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 27:
			case 28:
			case 29:
			case 30:
			case 32:
			case 48:
			case 52:
			case 53:
			case 63:
			case 64:
			case 65:
			case 66:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 556;
				this.inline_local_block();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public indented_local_block(): Indented_local_blockContext {
		let localctx: Indented_local_blockContext = new Indented_local_blockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 90, PinescriptParser.RULE_indented_local_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 559;
			this.match(PinescriptParser.NEWLINE);
			this.state = 560;
			this.match(PinescriptParser.INDENT);
			this.state = 561;
			this.statements();
			this.state = 562;
			this.match(PinescriptParser.DEDENT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public inline_local_block(): Inline_local_blockContext {
		let localctx: Inline_local_blockContext = new Inline_local_blockContext(this, this._ctx, this.state);
		this.enterRule(localctx, 92, PinescriptParser.RULE_inline_local_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 564;
			this.statement();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_assignment(): Simple_assignmentContext {
		let localctx: Simple_assignmentContext = new Simple_assignmentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 94, PinescriptParser.RULE_simple_assignment);
		try {
			this.state = 569;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 49, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 566;
				this.simple_variable_initialization();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 567;
				this.simple_reassignment();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 568;
				this.simple_augassignment();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_variable_initialization(): Simple_variable_initializationContext {
		let localctx: Simple_variable_initializationContext = new Simple_variable_initializationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 96, PinescriptParser.RULE_simple_variable_initialization);
		try {
			this.state = 573;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 6:
			case 7:
			case 10:
			case 11:
			case 17:
			case 18:
			case 21:
			case 22:
			case 24:
			case 25:
			case 27:
			case 28:
			case 63:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 571;
				this.simple_name_initialization();
				}
				break;
			case 32:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 572;
				this.simple_tuple_initialization();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_name_initialization(): Simple_name_initializationContext {
		let localctx: Simple_name_initializationContext = new Simple_name_initializationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 98, PinescriptParser.RULE_simple_name_initialization);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 576;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 575;
				this.match(PinescriptParser.EXPORT);
				}
			}

			this.state = 578;
			this.variable_declaration();
			this.state = 579;
			this.match(PinescriptParser.EQUAL);
			this.state = 580;
			this.expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_tuple_initialization(): Simple_tuple_initializationContext {
		let localctx: Simple_tuple_initializationContext = new Simple_tuple_initializationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 100, PinescriptParser.RULE_simple_tuple_initialization);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 582;
			this.tuple_declaration();
			this.state = 583;
			this.match(PinescriptParser.EQUAL);
			this.state = 584;
			this.expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_reassignment(): Simple_reassignmentContext {
		let localctx: Simple_reassignmentContext = new Simple_reassignmentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 102, PinescriptParser.RULE_simple_reassignment);
		try {
			this.state = 598;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 52, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 586;
				this.assignment_target_attribute();
				this.state = 587;
				this.match(PinescriptParser.EQUAL);
				this.state = 588;
				this.expression();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 590;
				this.assignment_target_subscript();
				this.state = 591;
				this.match(PinescriptParser.EQUAL);
				this.state = 592;
				this.expression();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 594;
				this.primary_expression(0);
				this.state = 595;
				this.match(PinescriptParser.COLONEQUAL);
				this.state = 596;
				this.expression();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public simple_augassignment(): Simple_augassignmentContext {
		let localctx: Simple_augassignmentContext = new Simple_augassignmentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 104, PinescriptParser.RULE_simple_augassignment);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 600;
			this.primary_expression(0);
			this.state = 601;
			this.augassign_op();
			this.state = 602;
			this.expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public expression(): ExpressionContext {
		let localctx: ExpressionContext = new ExpressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 106, PinescriptParser.RULE_expression);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 604;
			this.conditional_expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public expression_statement(): Expression_statementContext {
		let localctx: Expression_statementContext = new Expression_statementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 108, PinescriptParser.RULE_expression_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 606;
			this.expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public conditional_expression(): Conditional_expressionContext {
		let localctx: Conditional_expressionContext = new Conditional_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 110, PinescriptParser.RULE_conditional_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 608;
			this.disjunction_expression();
			this.state = 614;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===47) {
				{
				this.state = 609;
				this.match(PinescriptParser.QUESTION);
				this.state = 610;
				this.expression();
				this.state = 611;
				this.match(PinescriptParser.COLON);
				this.state = 612;
				this.expression();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public disjunction_expression(): Disjunction_expressionContext {
		let localctx: Disjunction_expressionContext = new Disjunction_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 112, PinescriptParser.RULE_disjunction_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 616;
			this.conjunction_expression();
			this.state = 621;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===20) {
				{
				{
				this.state = 617;
				this.match(PinescriptParser.OR);
				this.state = 618;
				this.conjunction_expression();
				}
				}
				this.state = 623;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public conjunction_expression(): Conjunction_expressionContext {
		let localctx: Conjunction_expressionContext = new Conjunction_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 114, PinescriptParser.RULE_conjunction_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 624;
			this.bitwise_or_expression(0);
			this.state = 629;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===3) {
				{
				{
				this.state = 625;
				this.match(PinescriptParser.AND);
				this.state = 626;
				this.bitwise_or_expression(0);
				}
				}
				this.state = 631;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public bitwise_or_expression(): Bitwise_or_expressionContext;
	public bitwise_or_expression(_p: number): Bitwise_or_expressionContext;
	// @RuleVersion(0)
	public bitwise_or_expression(_p?: number): Bitwise_or_expressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Bitwise_or_expressionContext = new Bitwise_or_expressionContext(this, this._ctx, _parentState);
		let _prevctx: Bitwise_or_expressionContext = localctx;
		let _startState: number = 116;
		this.enterRecursionRule(localctx, 116, PinescriptParser.RULE_bitwise_or_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 633;
			this.bitwise_xor_expression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 640;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 56, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new Bitwise_or_expressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_bitwise_or_expression);
					this.state = 635;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 636;
					this.match(PinescriptParser.PIPE);
					this.state = 637;
					this.bitwise_xor_expression(0);
					}
					}
				}
				this.state = 642;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 56, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}

	public bitwise_xor_expression(): Bitwise_xor_expressionContext;
	public bitwise_xor_expression(_p: number): Bitwise_xor_expressionContext;
	// @RuleVersion(0)
	public bitwise_xor_expression(_p?: number): Bitwise_xor_expressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Bitwise_xor_expressionContext = new Bitwise_xor_expressionContext(this, this._ctx, _parentState);
		let _prevctx: Bitwise_xor_expressionContext = localctx;
		let _startState: number = 118;
		this.enterRecursionRule(localctx, 118, PinescriptParser.RULE_bitwise_xor_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 644;
			this.bitwise_and_expression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 651;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 57, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new Bitwise_xor_expressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_bitwise_xor_expression);
					this.state = 646;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 647;
					this.match(PinescriptParser.CARET);
					this.state = 648;
					this.bitwise_and_expression(0);
					}
					}
				}
				this.state = 653;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 57, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}

	public bitwise_and_expression(): Bitwise_and_expressionContext;
	public bitwise_and_expression(_p: number): Bitwise_and_expressionContext;
	// @RuleVersion(0)
	public bitwise_and_expression(_p?: number): Bitwise_and_expressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Bitwise_and_expressionContext = new Bitwise_and_expressionContext(this, this._ctx, _parentState);
		let _prevctx: Bitwise_and_expressionContext = localctx;
		let _startState: number = 120;
		this.enterRecursionRule(localctx, 120, PinescriptParser.RULE_bitwise_and_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 655;
			this.equality_expression();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 662;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new Bitwise_and_expressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_bitwise_and_expression);
					this.state = 657;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 658;
					this.match(PinescriptParser.AMP);
					this.state = 659;
					this.equality_expression();
					}
					}
				}
				this.state = 664;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 58, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public equality_expression(): Equality_expressionContext {
		let localctx: Equality_expressionContext = new Equality_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 122, PinescriptParser.RULE_equality_expression);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 665;
			this.inequality_expression();
			this.state = 669;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 59, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 666;
					this.equality_trailing_pair();
					}
					}
				}
				this.state = 671;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 59, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public equality_trailing_pair(): Equality_trailing_pairContext {
		let localctx: Equality_trailing_pairContext = new Equality_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 124, PinescriptParser.RULE_equality_trailing_pair);
		try {
			this.state = 674;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 38:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 672;
				this.equal_trailing_pair();
				}
				break;
			case 39:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 673;
				this.not_equal_trailing_pair();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public equal_trailing_pair(): Equal_trailing_pairContext {
		let localctx: Equal_trailing_pairContext = new Equal_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 126, PinescriptParser.RULE_equal_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 676;
			this.match(PinescriptParser.EQEQUAL);
			this.state = 677;
			this.inequality_expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public not_equal_trailing_pair(): Not_equal_trailing_pairContext {
		let localctx: Not_equal_trailing_pairContext = new Not_equal_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 128, PinescriptParser.RULE_not_equal_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 679;
			this.match(PinescriptParser.NOTEQUAL);
			this.state = 680;
			this.inequality_expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public inequality_expression(): Inequality_expressionContext {
		let localctx: Inequality_expressionContext = new Inequality_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 130, PinescriptParser.RULE_inequality_expression);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 682;
			this.shift_expression(0);
			this.state = 686;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 61, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 683;
					this.inequality_trailing_pair();
					}
					}
				}
				this.state = 688;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 61, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public inequality_trailing_pair(): Inequality_trailing_pairContext {
		let localctx: Inequality_trailing_pairContext = new Inequality_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 132, PinescriptParser.RULE_inequality_trailing_pair);
		try {
			this.state = 693;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 36:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 689;
				this.less_than_equal_trailing_pair();
				}
				break;
			case 40:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 690;
				this.less_than_trailing_pair();
				}
				break;
			case 37:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 691;
				this.greater_than_equal_trailing_pair();
				}
				break;
			case 41:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 692;
				this.greater_than_trailing_pair();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public less_than_equal_trailing_pair(): Less_than_equal_trailing_pairContext {
		let localctx: Less_than_equal_trailing_pairContext = new Less_than_equal_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 134, PinescriptParser.RULE_less_than_equal_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 695;
			this.match(PinescriptParser.LESSEQUAL);
			this.state = 696;
			this.shift_expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public less_than_trailing_pair(): Less_than_trailing_pairContext {
		let localctx: Less_than_trailing_pairContext = new Less_than_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 136, PinescriptParser.RULE_less_than_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 698;
			this.match(PinescriptParser.LESS);
			this.state = 699;
			this.shift_expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public greater_than_equal_trailing_pair(): Greater_than_equal_trailing_pairContext {
		let localctx: Greater_than_equal_trailing_pairContext = new Greater_than_equal_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 138, PinescriptParser.RULE_greater_than_equal_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 701;
			this.match(PinescriptParser.GREATEREQUAL);
			this.state = 702;
			this.shift_expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public greater_than_trailing_pair(): Greater_than_trailing_pairContext {
		let localctx: Greater_than_trailing_pairContext = new Greater_than_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 140, PinescriptParser.RULE_greater_than_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 704;
			this.match(PinescriptParser.GREATER);
			this.state = 705;
			this.shift_expression(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public shift_expression(): Shift_expressionContext;
	public shift_expression(_p: number): Shift_expressionContext;
	// @RuleVersion(0)
	public shift_expression(_p?: number): Shift_expressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Shift_expressionContext = new Shift_expressionContext(this, this._ctx, _parentState);
		let _prevctx: Shift_expressionContext = localctx;
		let _startState: number = 142;
		this.enterRecursionRule(localctx, 142, PinescriptParser.RULE_shift_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 708;
			this.additive_expression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 716;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new Shift_expressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_shift_expression);
					this.state = 710;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 711;
					this.shift_op();
					this.state = 712;
					this.additive_expression(0);
					}
					}
				}
				this.state = 718;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public shift_op(): Shift_opContext {
		let localctx: Shift_opContext = new Shift_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 144, PinescriptParser.RULE_shift_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 719;
			_la = this._input.LA(1);
			if(!(_la===34 || _la===35)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public additive_expression(): Additive_expressionContext;
	public additive_expression(_p: number): Additive_expressionContext;
	// @RuleVersion(0)
	public additive_expression(_p?: number): Additive_expressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Additive_expressionContext = new Additive_expressionContext(this, this._ctx, _parentState);
		let _prevctx: Additive_expressionContext = localctx;
		let _startState: number = 146;
		this.enterRecursionRule(localctx, 146, PinescriptParser.RULE_additive_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 722;
			this.multiplicative_expression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 730;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 64, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new Additive_expressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_additive_expression);
					this.state = 724;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 725;
					this.additive_op();
					this.state = 726;
					this.multiplicative_expression(0);
					}
					}
				}
				this.state = 732;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 64, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public additive_op(): Additive_opContext {
		let localctx: Additive_opContext = new Additive_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 148, PinescriptParser.RULE_additive_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 733;
			_la = this._input.LA(1);
			if(!(_la===52 || _la===53)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public multiplicative_expression(): Multiplicative_expressionContext;
	public multiplicative_expression(_p: number): Multiplicative_expressionContext;
	// @RuleVersion(0)
	public multiplicative_expression(_p?: number): Multiplicative_expressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Multiplicative_expressionContext = new Multiplicative_expressionContext(this, this._ctx, _parentState);
		let _prevctx: Multiplicative_expressionContext = localctx;
		let _startState: number = 150;
		this.enterRecursionRule(localctx, 150, PinescriptParser.RULE_multiplicative_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 736;
			this.unary_expression();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 744;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					{
					localctx = new Multiplicative_expressionContext(this, _parentctx, _parentState);
					this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_multiplicative_expression);
					this.state = 738;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 739;
					this.multiplicative_op();
					this.state = 740;
					this.unary_expression();
					}
					}
				}
				this.state = 746;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public multiplicative_op(): Multiplicative_opContext {
		let localctx: Multiplicative_opContext = new Multiplicative_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 152, PinescriptParser.RULE_multiplicative_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 747;
			_la = this._input.LA(1);
			if(!(((((_la - 54)) & ~0x1F) === 0 && ((1 << (_la - 54)) & 7) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unary_expression(): Unary_expressionContext {
		let localctx: Unary_expressionContext = new Unary_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 154, PinescriptParser.RULE_unary_expression);
		try {
			this.state = 753;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 19:
			case 48:
			case 52:
			case 53:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 749;
				this.unary_op();
				this.state = 750;
				this.unary_expression();
				}
				break;
			case 4:
			case 6:
			case 7:
			case 10:
			case 12:
			case 17:
			case 18:
			case 21:
			case 22:
			case 24:
			case 25:
			case 26:
			case 30:
			case 32:
			case 63:
			case 64:
			case 65:
			case 66:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 752;
				this.primary_expression(0);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public unary_op(): Unary_opContext {
		let localctx: Unary_opContext = new Unary_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 156, PinescriptParser.RULE_unary_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 755;
			_la = this._input.LA(1);
			if(!(_la===19 || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 49) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public primary_expression(): Primary_expressionContext;
	public primary_expression(_p: number): Primary_expressionContext;
	// @RuleVersion(0)
	public primary_expression(_p?: number): Primary_expressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let localctx: Primary_expressionContext = new Primary_expressionContext(this, this._ctx, _parentState);
		let _prevctx: Primary_expressionContext = localctx;
		let _startState: number = 158;
		this.enterRecursionRule(localctx, 158, PinescriptParser.RULE_primary_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			localctx = new Primary_expression_fallbackContext(this, localctx);
			this._ctx = localctx;
			_prevctx = localctx;

			this.state = 758;
			this.atomic_expression();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 779;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 70, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 777;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 69, this._ctx) ) {
					case 1:
						{
						localctx = new Primary_expression_attributeContext(this, new Primary_expressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_primary_expression);
						this.state = 760;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 761;
						this.match(PinescriptParser.DOT);
						this.state = 762;
						this.name_load();
						}
						break;
					case 2:
						{
						localctx = new Primary_expression_callContext(this, new Primary_expressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_primary_expression);
						this.state = 763;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 765;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la===40) {
							{
							this.state = 764;
							this.template_spec_suffix();
							}
						}

						this.state = 767;
						this.match(PinescriptParser.LPAR);
						this.state = 769;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 343335245) !== 0) || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 491569) !== 0)) {
							{
							this.state = 768;
							this.argument_list();
							}
						}

						this.state = 771;
						this.match(PinescriptParser.RPAR);
						}
						break;
					case 3:
						{
						localctx = new Primary_expression_subscriptContext(this, new Primary_expressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_primary_expression);
						this.state = 772;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 773;
						this.match(PinescriptParser.LSQB);
						this.state = 774;
						this.subscript_slice();
						this.state = 775;
						this.match(PinescriptParser.RSQB);
						}
						break;
					}
					}
				}
				this.state = 781;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 70, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return localctx;
	}
	// @RuleVersion(0)
	public argument_list(): Argument_listContext {
		let localctx: Argument_listContext = new Argument_listContext(this, this._ctx, this.state);
		this.enterRule(localctx, 160, PinescriptParser.RULE_argument_list);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 782;
			this.argument_definition();
			this.state = 787;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 71, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 783;
					this.match(PinescriptParser.COMMA);
					this.state = 784;
					this.argument_definition();
					}
					}
				}
				this.state = 789;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 71, this._ctx);
			}
			this.state = 791;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===45) {
				{
				this.state = 790;
				this.match(PinescriptParser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public argument_definition(): Argument_definitionContext {
		let localctx: Argument_definitionContext = new Argument_definitionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 162, PinescriptParser.RULE_argument_definition);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 796;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 73, this._ctx) ) {
			case 1:
				{
				this.state = 793;
				this.name_store();
				this.state = 794;
				this.match(PinescriptParser.EQUAL);
				}
				break;
			}
			this.state = 798;
			this.expression();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public subscript_slice(): Subscript_sliceContext {
		let localctx: Subscript_sliceContext = new Subscript_sliceContext(this, this._ctx, this.state);
		this.enterRule(localctx, 164, PinescriptParser.RULE_subscript_slice);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 800;
			this.expression();
			this.state = 805;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 74, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 801;
					this.match(PinescriptParser.COMMA);
					this.state = 802;
					this.expression();
					}
					}
				}
				this.state = 807;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 74, this._ctx);
			}
			this.state = 809;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===45) {
				{
				this.state = 808;
				this.match(PinescriptParser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public atomic_expression(): Atomic_expressionContext {
		let localctx: Atomic_expressionContext = new Atomic_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 166, PinescriptParser.RULE_atomic_expression);
		try {
			this.state = 815;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 6:
			case 7:
			case 10:
			case 17:
			case 18:
			case 21:
			case 22:
			case 24:
			case 25:
			case 63:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 811;
				this.name_load();
				}
				break;
			case 12:
			case 26:
			case 64:
			case 65:
			case 66:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 812;
				this.literal_expression();
				}
				break;
			case 30:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 813;
				this.grouped_expression();
				}
				break;
			case 32:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 814;
				this.tuple_expression();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public literal_expression(): Literal_expressionContext {
		let localctx: Literal_expressionContext = new Literal_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 168, PinescriptParser.RULE_literal_expression);
		try {
			this.state = 821;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 64:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 817;
				this.literal_number();
				}
				break;
			case 65:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 818;
				this.literal_string();
				}
				break;
			case 12:
			case 26:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 819;
				this.literal_bool();
				}
				break;
			case 66:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 820;
				this.literal_color();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public literal_number(): Literal_numberContext {
		let localctx: Literal_numberContext = new Literal_numberContext(this, this._ctx, this.state);
		this.enterRule(localctx, 170, PinescriptParser.RULE_literal_number);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 823;
			this.match(PinescriptParser.NUMBER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public literal_string(): Literal_stringContext {
		let localctx: Literal_stringContext = new Literal_stringContext(this, this._ctx, this.state);
		this.enterRule(localctx, 172, PinescriptParser.RULE_literal_string);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 825;
			this.match(PinescriptParser.STRING);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public literal_bool(): Literal_boolContext {
		let localctx: Literal_boolContext = new Literal_boolContext(this, this._ctx, this.state);
		this.enterRule(localctx, 174, PinescriptParser.RULE_literal_bool);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 827;
			_la = this._input.LA(1);
			if(!(_la===12 || _la===26)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public literal_color(): Literal_colorContext {
		let localctx: Literal_colorContext = new Literal_colorContext(this, this._ctx, this.state);
		this.enterRule(localctx, 176, PinescriptParser.RULE_literal_color);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 829;
			this.match(PinescriptParser.COLOR);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public grouped_expression(): Grouped_expressionContext {
		let localctx: Grouped_expressionContext = new Grouped_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 178, PinescriptParser.RULE_grouped_expression);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 831;
			this.match(PinescriptParser.LPAR);
			this.state = 832;
			this.expression();
			this.state = 833;
			this.match(PinescriptParser.RPAR);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public tuple_expression(): Tuple_expressionContext {
		let localctx: Tuple_expressionContext = new Tuple_expressionContext(this, this._ctx, this.state);
		this.enterRule(localctx, 180, PinescriptParser.RULE_tuple_expression);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 835;
			this.match(PinescriptParser.LSQB);
			this.state = 847;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 343335245) !== 0) || ((((_la - 48)) & ~0x1F) === 0 && ((1 << (_la - 48)) & 491569) !== 0)) {
				{
				this.state = 836;
				this.expression();
				this.state = 841;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 78, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 837;
						this.match(PinescriptParser.COMMA);
						this.state = 838;
						this.expression();
						}
						}
					}
					this.state = 843;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 78, this._ctx);
				}
				this.state = 845;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===45) {
					{
					this.state = 844;
					this.match(PinescriptParser.COMMA);
					}
				}

				}
			}

			this.state = 849;
			this.match(PinescriptParser.RSQB);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public import_statement(): Import_statementContext {
		let localctx: Import_statementContext = new Import_statementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 182, PinescriptParser.RULE_import_statement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 851;
			this.match(PinescriptParser.IMPORT);
			this.state = 852;
			this.name();
			this.state = 853;
			this.match(PinescriptParser.SLASH);
			this.state = 854;
			this.name();
			this.state = 855;
			this.match(PinescriptParser.SLASH);
			this.state = 856;
			this.literal_number();
			this.state = 859;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===4) {
				{
				this.state = 857;
				this.match(PinescriptParser.AS);
				this.state = 858;
				this.name();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public break_statement(): Break_statementContext {
		let localctx: Break_statementContext = new Break_statementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 184, PinescriptParser.RULE_break_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 861;
			this.match(PinescriptParser.BREAK);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public continue_statement(): Continue_statementContext {
		let localctx: Continue_statementContext = new Continue_statementContext(this, this._ctx, this.state);
		this.enterRule(localctx, 186, PinescriptParser.RULE_continue_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 863;
			this.match(PinescriptParser.CONTINUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public variable_declaration(): Variable_declarationContext {
		let localctx: Variable_declarationContext = new Variable_declarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 188, PinescriptParser.RULE_variable_declaration);
		let _la: number;
		try {
			this.state = 875;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 84, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 866;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===27 || _la===28) {
					{
					this.state = 865;
					this.declaration_mode();
					}
				}

				this.state = 868;
				this.type_specification();
				this.state = 869;
				this.name_store();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 872;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===27 || _la===28) {
					{
					this.state = 871;
					this.declaration_mode();
					}
				}

				this.state = 874;
				this.name_store();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public tuple_declaration(): Tuple_declarationContext {
		let localctx: Tuple_declarationContext = new Tuple_declarationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 190, PinescriptParser.RULE_tuple_declaration);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 877;
			this.match(PinescriptParser.LSQB);
			this.state = 878;
			this.name_store();
			this.state = 883;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 85, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 879;
					this.match(PinescriptParser.COMMA);
					this.state = 880;
					this.name_store();
					}
					}
				}
				this.state = 885;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 85, this._ctx);
			}
			this.state = 887;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===45) {
				{
				this.state = 886;
				this.match(PinescriptParser.COMMA);
				}
			}

			this.state = 889;
			this.match(PinescriptParser.RSQB);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public declaration_mode(): Declaration_modeContext {
		let localctx: Declaration_modeContext = new Declaration_modeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 192, PinescriptParser.RULE_declaration_mode);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 891;
			_la = this._input.LA(1);
			if(!(_la===27 || _la===28)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assignment_target(): Assignment_targetContext {
		let localctx: Assignment_targetContext = new Assignment_targetContext(this, this._ctx, this.state);
		this.enterRule(localctx, 194, PinescriptParser.RULE_assignment_target);
		try {
			this.state = 897;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 87, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 893;
				this.assignment_target_attribute();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 894;
				this.assignment_target_subscript();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 895;
				this.assignment_target_name();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 896;
				this.assignment_target_group();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assignment_target_attribute(): Assignment_target_attributeContext {
		let localctx: Assignment_target_attributeContext = new Assignment_target_attributeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 196, PinescriptParser.RULE_assignment_target_attribute);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 899;
			this.primary_expression(0);
			this.state = 900;
			this.match(PinescriptParser.DOT);
			this.state = 901;
			this.name_store();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assignment_target_subscript(): Assignment_target_subscriptContext {
		let localctx: Assignment_target_subscriptContext = new Assignment_target_subscriptContext(this, this._ctx, this.state);
		this.enterRule(localctx, 198, PinescriptParser.RULE_assignment_target_subscript);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 903;
			this.primary_expression(0);
			this.state = 904;
			this.match(PinescriptParser.LSQB);
			this.state = 905;
			this.subscript_slice();
			this.state = 906;
			this.match(PinescriptParser.RSQB);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assignment_target_name(): Assignment_target_nameContext {
		let localctx: Assignment_target_nameContext = new Assignment_target_nameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 200, PinescriptParser.RULE_assignment_target_name);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 908;
			this.name_store();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public assignment_target_group(): Assignment_target_groupContext {
		let localctx: Assignment_target_groupContext = new Assignment_target_groupContext(this, this._ctx, this.state);
		this.enterRule(localctx, 202, PinescriptParser.RULE_assignment_target_group);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 910;
			this.match(PinescriptParser.LPAR);
			this.state = 911;
			this.assignment_target();
			this.state = 912;
			this.match(PinescriptParser.RPAR);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public augassign_op(): Augassign_opContext {
		let localctx: Augassign_opContext = new Augassign_opContext(this, this._ctx, this.state);
		this.enterRule(localctx, 204, PinescriptParser.RULE_augassign_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 914;
			_la = this._input.LA(1);
			if(!(((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & 31) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public type_specification(): Type_specificationContext {
		let localctx: Type_specificationContext = new Type_specificationContext(this, this._ctx, this.state);
		this.enterRule(localctx, 206, PinescriptParser.RULE_type_specification);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 917;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 88, this._ctx) ) {
			case 1:
				{
				this.state = 916;
				this.type_qualifier();
				}
				break;
			}
			this.state = 919;
			this.attributed_type_name();
			this.state = 921;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===40) {
				{
				this.state = 920;
				this.template_spec_suffix();
				}
			}

			this.state = 924;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===32) {
				{
				this.state = 923;
				this.array_type_suffix();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public type_qualifier(): Type_qualifierContext {
		let localctx: Type_qualifierContext = new Type_qualifierContext(this, this._ctx, this.state);
		this.enterRule(localctx, 208, PinescriptParser.RULE_type_qualifier);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 926;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 6422656) !== 0))) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public attributed_type_name(): Attributed_type_nameContext {
		let localctx: Attributed_type_nameContext = new Attributed_type_nameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 210, PinescriptParser.RULE_attributed_type_name);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 928;
			this.name_load();
			this.state = 933;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===44) {
				{
				{
				this.state = 929;
				this.match(PinescriptParser.DOT);
				this.state = 930;
				this.name_load();
				}
				}
				this.state = 935;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public template_spec_suffix(): Template_spec_suffixContext {
		let localctx: Template_spec_suffixContext = new Template_spec_suffixContext(this, this._ctx, this.state);
		this.enterRule(localctx, 212, PinescriptParser.RULE_template_spec_suffix);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 936;
			this.match(PinescriptParser.LESS);
			this.state = 938;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 57017552) !== 0) || _la===63) {
				{
				this.state = 937;
				this.type_argument_list();
				}
			}

			this.state = 940;
			this.match(PinescriptParser.GREATER);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public array_type_suffix(): Array_type_suffixContext {
		let localctx: Array_type_suffixContext = new Array_type_suffixContext(this, this._ctx, this.state);
		this.enterRule(localctx, 214, PinescriptParser.RULE_array_type_suffix);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 942;
			this.match(PinescriptParser.LSQB);
			this.state = 943;
			this.match(PinescriptParser.RSQB);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public type_argument_list(): Type_argument_listContext {
		let localctx: Type_argument_listContext = new Type_argument_listContext(this, this._ctx, this.state);
		this.enterRule(localctx, 216, PinescriptParser.RULE_type_argument_list);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 945;
			this.type_specification();
			this.state = 950;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 93, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 946;
					this.match(PinescriptParser.COMMA);
					this.state = 947;
					this.type_specification();
					}
					}
				}
				this.state = 952;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 93, this._ctx);
			}
			this.state = 954;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===45) {
				{
				this.state = 953;
				this.match(PinescriptParser.COMMA);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public name(): NameContext {
		let localctx: NameContext = new NameContext(this, this._ctx, this.state);
		this.enterRule(localctx, 218, PinescriptParser.RULE_name);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 956;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 57017552) !== 0) || _la===63)) {
			this._errHandler.recoverInline(this);
			}
			else {
				this._errHandler.reportMatch(this);
			    this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public name_load(): Name_loadContext {
		let localctx: Name_loadContext = new Name_loadContext(this, this._ctx, this.state);
		this.enterRule(localctx, 220, PinescriptParser.RULE_name_load);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 958;
			this.name();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public name_store(): Name_storeContext {
		let localctx: Name_storeContext = new Name_storeContext(this, this._ctx, this.state);
		this.enterRule(localctx, 222, PinescriptParser.RULE_name_store);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 960;
			this.name();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public comments(): CommentsContext {
		let localctx: CommentsContext = new CommentsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 224, PinescriptParser.RULE_comments);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 963;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 962;
				this.comment();
				}
				}
				this.state = 965;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la===69);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public comment(): CommentContext {
		let localctx: CommentContext = new CommentContext(this, this._ctx, this.state);
		this.enterRule(localctx, 226, PinescriptParser.RULE_comment);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 967;
			this.match(PinescriptParser.COMMENT);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return localctx;
	}

	public sempred(localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 58:
			return this.bitwise_or_expression_sempred(localctx as Bitwise_or_expressionContext, predIndex);
		case 59:
			return this.bitwise_xor_expression_sempred(localctx as Bitwise_xor_expressionContext, predIndex);
		case 60:
			return this.bitwise_and_expression_sempred(localctx as Bitwise_and_expressionContext, predIndex);
		case 71:
			return this.shift_expression_sempred(localctx as Shift_expressionContext, predIndex);
		case 73:
			return this.additive_expression_sempred(localctx as Additive_expressionContext, predIndex);
		case 75:
			return this.multiplicative_expression_sempred(localctx as Multiplicative_expressionContext, predIndex);
		case 79:
			return this.primary_expression_sempred(localctx as Primary_expressionContext, predIndex);
		}
		return true;
	}
	private bitwise_or_expression_sempred(localctx: Bitwise_or_expressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}
	private bitwise_xor_expression_sempred(localctx: Bitwise_xor_expressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 1:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}
	private bitwise_and_expression_sempred(localctx: Bitwise_and_expressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 2:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}
	private shift_expression_sempred(localctx: Shift_expressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 3:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}
	private additive_expression_sempred(localctx: Additive_expressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 4:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}
	private multiplicative_expression_sempred(localctx: Multiplicative_expressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}
	private primary_expression_sempred(localctx: Primary_expressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 6:
			return this.precpred(this._ctx, 4);
		case 7:
			return this.precpred(this._ctx, 3);
		case 8:
			return this.precpred(this._ctx, 2);
		}
		return true;
	}

	public static readonly _serializedATN: number[] = [4,1,71,970,2,0,7,0,2,
	1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,2,
	10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,17,
	7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,7,
	24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,31,
	2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,2,
	39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,46,
	7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,2,53,7,
	53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,59,7,59,2,60,7,60,
	2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,65,2,66,7,66,2,67,7,67,2,
	68,7,68,2,69,7,69,2,70,7,70,2,71,7,71,2,72,7,72,2,73,7,73,2,74,7,74,2,75,
	7,75,2,76,7,76,2,77,7,77,2,78,7,78,2,79,7,79,2,80,7,80,2,81,7,81,2,82,7,
	82,2,83,7,83,2,84,7,84,2,85,7,85,2,86,7,86,2,87,7,87,2,88,7,88,2,89,7,89,
	2,90,7,90,2,91,7,91,2,92,7,92,2,93,7,93,2,94,7,94,2,95,7,95,2,96,7,96,2,
	97,7,97,2,98,7,98,2,99,7,99,2,100,7,100,2,101,7,101,2,102,7,102,2,103,7,
	103,2,104,7,104,2,105,7,105,2,106,7,106,2,107,7,107,2,108,7,108,2,109,7,
	109,2,110,7,110,2,111,7,111,2,112,7,112,2,113,7,113,1,0,1,0,1,1,3,1,232,
	8,1,1,1,1,1,1,2,1,2,3,2,238,8,2,1,2,1,2,1,3,3,3,243,8,3,1,3,1,3,1,4,4,4,
	248,8,4,11,4,12,4,249,1,5,1,5,1,5,3,5,255,8,5,1,6,1,6,1,6,1,6,1,6,1,6,3,
	6,263,8,6,1,7,1,7,1,7,5,7,268,8,7,10,7,12,7,271,9,7,1,7,3,7,274,8,7,1,7,
	1,7,1,8,1,8,1,8,5,8,281,8,8,10,8,12,8,284,9,8,1,8,1,8,1,8,1,9,1,9,1,9,1,
	9,1,9,3,9,294,8,9,1,10,1,10,1,10,3,10,299,8,10,1,11,1,11,3,11,303,8,11,
	1,12,3,12,306,8,12,1,12,1,12,1,12,1,12,1,13,1,13,1,13,1,13,1,14,1,14,1,
	14,1,14,1,15,1,15,1,15,1,15,1,16,3,16,325,8,16,1,16,1,16,1,16,1,16,3,16,
	331,8,16,1,16,1,16,1,16,1,16,1,16,3,16,338,8,16,1,16,1,16,1,16,3,16,343,
	8,16,1,16,1,16,1,16,1,16,3,16,349,8,16,1,17,1,17,1,17,5,17,354,8,17,10,
	17,12,17,357,9,17,1,17,3,17,360,8,17,1,18,1,18,1,18,1,18,3,18,366,8,18,
	1,18,1,18,1,18,3,18,371,8,18,3,18,373,8,18,1,19,3,19,376,8,19,1,19,1,19,
	1,19,1,19,1,19,3,19,383,8,19,1,19,1,19,1,19,1,19,1,19,3,19,390,8,19,1,19,
	1,19,1,19,1,19,3,19,396,8,19,1,19,1,19,1,19,1,19,3,19,402,8,19,1,20,1,20,
	1,20,5,20,407,8,20,10,20,12,20,410,9,20,1,20,3,20,413,8,20,1,21,1,21,1,
	21,1,21,3,21,419,8,21,1,22,3,22,422,8,22,1,22,1,22,1,22,1,22,1,22,1,22,
	1,22,1,23,4,23,432,8,23,11,23,12,23,433,1,24,3,24,437,8,24,1,24,1,24,1,
	24,1,24,3,24,443,8,24,1,24,1,24,1,25,3,25,448,8,25,1,25,1,25,1,25,1,25,
	1,25,1,25,1,25,1,26,4,26,458,8,26,11,26,12,26,459,1,27,1,27,1,27,3,27,465,
	8,27,1,27,1,27,1,28,1,28,1,28,1,28,3,28,473,8,28,1,29,1,29,1,30,1,30,1,
	31,1,31,1,31,1,31,3,31,483,8,31,1,32,1,32,1,32,1,32,1,32,3,32,490,8,32,
	1,33,1,33,3,33,494,8,33,1,34,1,34,1,34,1,35,1,35,3,35,501,8,35,1,36,1,36,
	1,36,1,36,1,36,1,36,1,36,1,36,3,36,511,8,36,1,36,1,36,1,37,1,37,1,37,1,
	37,1,37,1,37,1,38,1,38,1,38,1,38,1,38,3,38,526,8,38,1,39,1,39,1,39,1,39,
	1,40,1,40,3,40,534,8,40,1,40,1,40,1,40,1,40,1,40,1,41,4,41,542,8,41,11,
	41,12,41,543,1,41,3,41,547,8,41,1,42,1,42,1,42,1,42,1,43,1,43,1,43,1,44,
	1,44,3,44,558,8,44,1,45,1,45,1,45,1,45,1,45,1,46,1,46,1,47,1,47,1,47,3,
	47,570,8,47,1,48,1,48,3,48,574,8,48,1,49,3,49,577,8,49,1,49,1,49,1,49,1,
	49,1,50,1,50,1,50,1,50,1,51,1,51,1,51,1,51,1,51,1,51,1,51,1,51,1,51,1,51,
	1,51,1,51,3,51,599,8,51,1,52,1,52,1,52,1,52,1,53,1,53,1,54,1,54,1,55,1,
	55,1,55,1,55,1,55,1,55,3,55,615,8,55,1,56,1,56,1,56,5,56,620,8,56,10,56,
	12,56,623,9,56,1,57,1,57,1,57,5,57,628,8,57,10,57,12,57,631,9,57,1,58,1,
	58,1,58,1,58,1,58,1,58,5,58,639,8,58,10,58,12,58,642,9,58,1,59,1,59,1,59,
	1,59,1,59,1,59,5,59,650,8,59,10,59,12,59,653,9,59,1,60,1,60,1,60,1,60,1,
	60,1,60,5,60,661,8,60,10,60,12,60,664,9,60,1,61,1,61,5,61,668,8,61,10,61,
	12,61,671,9,61,1,62,1,62,3,62,675,8,62,1,63,1,63,1,63,1,64,1,64,1,64,1,
	65,1,65,5,65,685,8,65,10,65,12,65,688,9,65,1,66,1,66,1,66,1,66,3,66,694,
	8,66,1,67,1,67,1,67,1,68,1,68,1,68,1,69,1,69,1,69,1,70,1,70,1,70,1,71,1,
	71,1,71,1,71,1,71,1,71,1,71,5,71,715,8,71,10,71,12,71,718,9,71,1,72,1,72,
	1,73,1,73,1,73,1,73,1,73,1,73,1,73,5,73,729,8,73,10,73,12,73,732,9,73,1,
	74,1,74,1,75,1,75,1,75,1,75,1,75,1,75,1,75,5,75,743,8,75,10,75,12,75,746,
	9,75,1,76,1,76,1,77,1,77,1,77,1,77,3,77,754,8,77,1,78,1,78,1,79,1,79,1,
	79,1,79,1,79,1,79,1,79,1,79,3,79,766,8,79,1,79,1,79,3,79,770,8,79,1,79,
	1,79,1,79,1,79,1,79,1,79,5,79,778,8,79,10,79,12,79,781,9,79,1,80,1,80,1,
	80,5,80,786,8,80,10,80,12,80,789,9,80,1,80,3,80,792,8,80,1,81,1,81,1,81,
	3,81,797,8,81,1,81,1,81,1,82,1,82,1,82,5,82,804,8,82,10,82,12,82,807,9,
	82,1,82,3,82,810,8,82,1,83,1,83,1,83,1,83,3,83,816,8,83,1,84,1,84,1,84,
	1,84,3,84,822,8,84,1,85,1,85,1,86,1,86,1,87,1,87,1,88,1,88,1,89,1,89,1,
	89,1,89,1,90,1,90,1,90,1,90,5,90,840,8,90,10,90,12,90,843,9,90,1,90,3,90,
	846,8,90,3,90,848,8,90,1,90,1,90,1,91,1,91,1,91,1,91,1,91,1,91,1,91,1,91,
	3,91,860,8,91,1,92,1,92,1,93,1,93,1,94,3,94,867,8,94,1,94,1,94,1,94,1,94,
	3,94,873,8,94,1,94,3,94,876,8,94,1,95,1,95,1,95,1,95,5,95,882,8,95,10,95,
	12,95,885,9,95,1,95,3,95,888,8,95,1,95,1,95,1,96,1,96,1,97,1,97,1,97,1,
	97,3,97,898,8,97,1,98,1,98,1,98,1,98,1,99,1,99,1,99,1,99,1,99,1,100,1,100,
	1,101,1,101,1,101,1,101,1,102,1,102,1,103,3,103,918,8,103,1,103,1,103,3,
	103,922,8,103,1,103,3,103,925,8,103,1,104,1,104,1,105,1,105,1,105,5,105,
	932,8,105,10,105,12,105,935,9,105,1,106,1,106,3,106,939,8,106,1,106,1,106,
	1,107,1,107,1,107,1,108,1,108,1,108,5,108,949,8,108,10,108,12,108,952,9,
	108,1,108,3,108,955,8,108,1,109,1,109,1,110,1,110,1,111,1,111,1,112,4,112,
	964,8,112,11,112,12,112,965,1,113,1,113,1,113,0,7,116,118,120,142,146,150,
	158,114,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,
	46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,
	94,96,98,100,102,104,106,108,110,112,114,116,118,120,122,124,126,128,130,
	132,134,136,138,140,142,144,146,148,150,152,154,156,158,160,162,164,166,
	168,170,172,174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,
	204,206,208,210,212,214,216,218,220,222,224,226,0,9,1,0,34,35,1,0,52,53,
	1,0,54,56,3,0,19,19,48,48,52,53,2,0,12,12,26,26,1,0,27,28,1,0,57,61,3,0,
	7,7,17,17,21,22,7,0,4,4,6,7,10,10,17,18,21,22,24,25,63,63,974,0,228,1,0,
	0,0,2,231,1,0,0,0,4,235,1,0,0,0,6,242,1,0,0,0,8,247,1,0,0,0,10,254,1,0,
	0,0,12,262,1,0,0,0,14,264,1,0,0,0,16,277,1,0,0,0,18,293,1,0,0,0,20,298,
	1,0,0,0,22,302,1,0,0,0,24,305,1,0,0,0,26,311,1,0,0,0,28,315,1,0,0,0,30,
	319,1,0,0,0,32,348,1,0,0,0,34,350,1,0,0,0,36,372,1,0,0,0,38,401,1,0,0,0,
	40,403,1,0,0,0,42,418,1,0,0,0,44,421,1,0,0,0,46,431,1,0,0,0,48,436,1,0,
	0,0,50,447,1,0,0,0,52,457,1,0,0,0,54,461,1,0,0,0,56,472,1,0,0,0,58,474,
	1,0,0,0,60,476,1,0,0,0,62,478,1,0,0,0,64,484,1,0,0,0,66,493,1,0,0,0,68,
	495,1,0,0,0,70,500,1,0,0,0,72,502,1,0,0,0,74,514,1,0,0,0,76,525,1,0,0,0,
	78,527,1,0,0,0,80,531,1,0,0,0,82,541,1,0,0,0,84,548,1,0,0,0,86,552,1,0,
	0,0,88,557,1,0,0,0,90,559,1,0,0,0,92,564,1,0,0,0,94,569,1,0,0,0,96,573,
	1,0,0,0,98,576,1,0,0,0,100,582,1,0,0,0,102,598,1,0,0,0,104,600,1,0,0,0,
	106,604,1,0,0,0,108,606,1,0,0,0,110,608,1,0,0,0,112,616,1,0,0,0,114,624,
	1,0,0,0,116,632,1,0,0,0,118,643,1,0,0,0,120,654,1,0,0,0,122,665,1,0,0,0,
	124,674,1,0,0,0,126,676,1,0,0,0,128,679,1,0,0,0,130,682,1,0,0,0,132,693,
	1,0,0,0,134,695,1,0,0,0,136,698,1,0,0,0,138,701,1,0,0,0,140,704,1,0,0,0,
	142,707,1,0,0,0,144,719,1,0,0,0,146,721,1,0,0,0,148,733,1,0,0,0,150,735,
	1,0,0,0,152,747,1,0,0,0,154,753,1,0,0,0,156,755,1,0,0,0,158,757,1,0,0,0,
	160,782,1,0,0,0,162,796,1,0,0,0,164,800,1,0,0,0,166,815,1,0,0,0,168,821,
	1,0,0,0,170,823,1,0,0,0,172,825,1,0,0,0,174,827,1,0,0,0,176,829,1,0,0,0,
	178,831,1,0,0,0,180,835,1,0,0,0,182,851,1,0,0,0,184,861,1,0,0,0,186,863,
	1,0,0,0,188,875,1,0,0,0,190,877,1,0,0,0,192,891,1,0,0,0,194,897,1,0,0,0,
	196,899,1,0,0,0,198,903,1,0,0,0,200,908,1,0,0,0,202,910,1,0,0,0,204,914,
	1,0,0,0,206,917,1,0,0,0,208,926,1,0,0,0,210,928,1,0,0,0,212,936,1,0,0,0,
	214,942,1,0,0,0,216,945,1,0,0,0,218,956,1,0,0,0,220,958,1,0,0,0,222,960,
	1,0,0,0,224,963,1,0,0,0,226,967,1,0,0,0,228,229,3,2,1,0,229,1,1,0,0,0,230,
	232,3,8,4,0,231,230,1,0,0,0,231,232,1,0,0,0,232,233,1,0,0,0,233,234,5,0,
	0,1,234,3,1,0,0,0,235,237,3,106,53,0,236,238,5,67,0,0,237,236,1,0,0,0,237,
	238,1,0,0,0,238,239,1,0,0,0,239,240,5,0,0,1,240,5,1,0,0,0,241,243,3,224,
	112,0,242,241,1,0,0,0,242,243,1,0,0,0,243,244,1,0,0,0,244,245,5,0,0,1,245,
	7,1,0,0,0,246,248,3,10,5,0,247,246,1,0,0,0,248,249,1,0,0,0,249,247,1,0,
	0,0,249,250,1,0,0,0,250,9,1,0,0,0,251,255,3,12,6,0,252,255,3,14,7,0,253,
	255,3,16,8,0,254,251,1,0,0,0,254,252,1,0,0,0,254,253,1,0,0,0,255,11,1,0,
	0,0,256,263,3,20,10,0,257,263,3,44,22,0,258,263,3,50,25,0,259,263,3,58,
	29,0,260,263,3,38,19,0,261,263,3,32,16,0,262,256,1,0,0,0,262,257,1,0,0,
	0,262,258,1,0,0,0,262,259,1,0,0,0,262,260,1,0,0,0,262,261,1,0,0,0,263,13,
	1,0,0,0,264,269,3,18,9,0,265,266,5,45,0,0,266,268,3,18,9,0,267,265,1,0,
	0,0,268,271,1,0,0,0,269,267,1,0,0,0,269,270,1,0,0,0,270,273,1,0,0,0,271,
	269,1,0,0,0,272,274,5,45,0,0,273,272,1,0,0,0,273,274,1,0,0,0,274,275,1,
	0,0,0,275,276,5,67,0,0,276,15,1,0,0,0,277,282,3,18,9,0,278,279,5,45,0,0,
	279,281,3,18,9,0,280,278,1,0,0,0,281,284,1,0,0,0,282,280,1,0,0,0,282,283,
	1,0,0,0,283,285,1,0,0,0,284,282,1,0,0,0,285,286,5,45,0,0,286,287,3,56,28,
	0,287,17,1,0,0,0,288,294,3,94,47,0,289,294,3,108,54,0,290,294,3,182,91,
	0,291,294,3,184,92,0,292,294,3,186,93,0,293,288,1,0,0,0,293,289,1,0,0,0,
	293,290,1,0,0,0,293,291,1,0,0,0,293,292,1,0,0,0,294,19,1,0,0,0,295,299,
	3,22,11,0,296,299,3,28,14,0,297,299,3,30,15,0,298,295,1,0,0,0,298,296,1,
	0,0,0,298,297,1,0,0,0,299,21,1,0,0,0,300,303,3,24,12,0,301,303,3,26,13,
	0,302,300,1,0,0,0,302,301,1,0,0,0,303,23,1,0,0,0,304,306,5,11,0,0,305,304,
	1,0,0,0,305,306,1,0,0,0,306,307,1,0,0,0,307,308,3,188,94,0,308,309,5,42,
	0,0,309,310,3,60,30,0,310,25,1,0,0,0,311,312,3,190,95,0,312,313,5,42,0,
	0,313,314,3,60,30,0,314,27,1,0,0,0,315,316,3,158,79,0,316,317,5,62,0,0,
	317,318,3,60,30,0,318,29,1,0,0,0,319,320,3,158,79,0,320,321,3,204,102,0,
	321,322,3,60,30,0,322,31,1,0,0,0,323,325,5,11,0,0,324,323,1,0,0,0,324,325,
	1,0,0,0,325,326,1,0,0,0,326,327,3,206,103,0,327,328,3,218,109,0,328,330,
	5,30,0,0,329,331,3,34,17,0,330,329,1,0,0,0,330,331,1,0,0,0,331,332,1,0,
	0,0,332,333,5,31,0,0,333,334,5,43,0,0,334,335,3,88,44,0,335,349,1,0,0,0,
	336,338,5,11,0,0,337,336,1,0,0,0,337,338,1,0,0,0,338,339,1,0,0,0,339,340,
	3,218,109,0,340,342,5,30,0,0,341,343,3,34,17,0,342,341,1,0,0,0,342,343,
	1,0,0,0,343,344,1,0,0,0,344,345,5,31,0,0,345,346,5,43,0,0,346,347,3,88,
	44,0,347,349,1,0,0,0,348,324,1,0,0,0,348,337,1,0,0,0,349,33,1,0,0,0,350,
	355,3,36,18,0,351,352,5,45,0,0,352,354,3,36,18,0,353,351,1,0,0,0,354,357,
	1,0,0,0,355,353,1,0,0,0,355,356,1,0,0,0,356,359,1,0,0,0,357,355,1,0,0,0,
	358,360,5,45,0,0,359,358,1,0,0,0,359,360,1,0,0,0,360,35,1,0,0,0,361,362,
	3,206,103,0,362,365,3,222,111,0,363,364,5,42,0,0,364,366,3,106,53,0,365,
	363,1,0,0,0,365,366,1,0,0,0,366,373,1,0,0,0,367,370,3,222,111,0,368,369,
	5,42,0,0,369,371,3,106,53,0,370,368,1,0,0,0,370,371,1,0,0,0,371,373,1,0,
	0,0,372,361,1,0,0,0,372,367,1,0,0,0,373,37,1,0,0,0,374,376,5,11,0,0,375,
	374,1,0,0,0,375,376,1,0,0,0,376,377,1,0,0,0,377,378,5,18,0,0,378,379,3,
	206,103,0,379,380,3,218,109,0,380,382,5,30,0,0,381,383,3,40,20,0,382,381,
	1,0,0,0,382,383,1,0,0,0,383,384,1,0,0,0,384,385,5,31,0,0,385,386,5,43,0,
	0,386,387,3,88,44,0,387,402,1,0,0,0,388,390,5,11,0,0,389,388,1,0,0,0,389,
	390,1,0,0,0,390,391,1,0,0,0,391,392,5,18,0,0,392,393,3,218,109,0,393,395,
	5,30,0,0,394,396,3,40,20,0,395,394,1,0,0,0,395,396,1,0,0,0,396,397,1,0,
	0,0,397,398,5,31,0,0,398,399,5,43,0,0,399,400,3,88,44,0,400,402,1,0,0,0,
	401,375,1,0,0,0,401,389,1,0,0,0,402,39,1,0,0,0,403,408,3,42,21,0,404,405,
	5,45,0,0,405,407,3,42,21,0,406,404,1,0,0,0,407,410,1,0,0,0,408,406,1,0,
	0,0,408,409,1,0,0,0,409,412,1,0,0,0,410,408,1,0,0,0,411,413,5,45,0,0,412,
	411,1,0,0,0,412,413,1,0,0,0,413,41,1,0,0,0,414,415,3,206,103,0,415,416,
	3,222,111,0,416,419,1,0,0,0,417,419,3,36,18,0,418,414,1,0,0,0,418,417,1,
	0,0,0,419,43,1,0,0,0,420,422,5,11,0,0,421,420,1,0,0,0,421,422,1,0,0,0,422,
	423,1,0,0,0,423,424,5,25,0,0,424,425,3,218,109,0,425,426,5,67,0,0,426,427,
	5,1,0,0,427,428,3,46,23,0,428,429,5,2,0,0,429,45,1,0,0,0,430,432,3,48,24,
	0,431,430,1,0,0,0,432,433,1,0,0,0,433,431,1,0,0,0,433,434,1,0,0,0,434,47,
	1,0,0,0,435,437,5,28,0,0,436,435,1,0,0,0,436,437,1,0,0,0,437,438,1,0,0,
	0,438,439,3,206,103,0,439,442,3,222,111,0,440,441,5,42,0,0,441,443,3,106,
	53,0,442,440,1,0,0,0,442,443,1,0,0,0,443,444,1,0,0,0,444,445,5,67,0,0,445,
	49,1,0,0,0,446,448,5,11,0,0,447,446,1,0,0,0,447,448,1,0,0,0,448,449,1,0,
	0,0,449,450,5,10,0,0,450,451,3,218,109,0,451,452,5,67,0,0,452,453,5,1,0,
	0,453,454,3,52,26,0,454,455,5,2,0,0,455,51,1,0,0,0,456,458,3,54,27,0,457,
	456,1,0,0,0,458,459,1,0,0,0,459,457,1,0,0,0,459,460,1,0,0,0,460,53,1,0,
	0,0,461,464,3,222,111,0,462,463,5,42,0,0,463,465,3,106,53,0,464,462,1,0,
	0,0,464,465,1,0,0,0,465,466,1,0,0,0,466,467,5,67,0,0,467,55,1,0,0,0,468,
	473,3,62,31,0,469,473,3,70,35,0,470,473,3,78,39,0,471,473,3,80,40,0,472,
	468,1,0,0,0,472,469,1,0,0,0,472,470,1,0,0,0,472,471,1,0,0,0,473,57,1,0,
	0,0,474,475,3,56,28,0,475,59,1,0,0,0,476,477,3,56,28,0,477,61,1,0,0,0,478,
	479,5,14,0,0,479,480,3,106,53,0,480,482,3,88,44,0,481,483,3,66,33,0,482,
	481,1,0,0,0,482,483,1,0,0,0,483,63,1,0,0,0,484,485,5,9,0,0,485,486,5,14,
	0,0,486,487,3,106,53,0,487,489,3,88,44,0,488,490,3,66,33,0,489,488,1,0,
	0,0,489,490,1,0,0,0,490,65,1,0,0,0,491,494,3,64,32,0,492,494,3,68,34,0,
	493,491,1,0,0,0,493,492,1,0,0,0,494,67,1,0,0,0,495,496,5,9,0,0,496,497,
	3,88,44,0,497,69,1,0,0,0,498,501,3,72,36,0,499,501,3,74,37,0,500,498,1,
	0,0,0,500,499,1,0,0,0,501,71,1,0,0,0,502,503,5,13,0,0,503,504,3,76,38,0,
	504,505,5,42,0,0,505,506,3,106,53,0,506,507,5,24,0,0,507,510,3,106,53,0,
	508,509,5,6,0,0,509,511,3,106,53,0,510,508,1,0,0,0,510,511,1,0,0,0,511,
	512,1,0,0,0,512,513,3,88,44,0,513,73,1,0,0,0,514,515,5,13,0,0,515,516,3,
	76,38,0,516,517,5,16,0,0,517,518,3,106,53,0,518,519,3,88,44,0,519,75,1,
	0,0,0,520,521,3,206,103,0,521,522,3,222,111,0,522,526,1,0,0,0,523,526,3,
	222,111,0,524,526,3,190,95,0,525,520,1,0,0,0,525,523,1,0,0,0,525,524,1,
	0,0,0,526,77,1,0,0,0,527,528,5,29,0,0,528,529,3,106,53,0,529,530,3,88,44,
	0,530,79,1,0,0,0,531,533,5,23,0,0,532,534,3,106,53,0,533,532,1,0,0,0,533,
	534,1,0,0,0,534,535,1,0,0,0,535,536,5,67,0,0,536,537,5,1,0,0,537,538,3,
	82,41,0,538,539,5,2,0,0,539,81,1,0,0,0,540,542,3,84,42,0,541,540,1,0,0,
	0,542,543,1,0,0,0,543,541,1,0,0,0,543,544,1,0,0,0,544,546,1,0,0,0,545,547,
	3,86,43,0,546,545,1,0,0,0,546,547,1,0,0,0,547,83,1,0,0,0,548,549,3,106,
	53,0,549,550,5,43,0,0,550,551,3,88,44,0,551,85,1,0,0,0,552,553,5,43,0,0,
	553,554,3,88,44,0,554,87,1,0,0,0,555,558,3,90,45,0,556,558,3,92,46,0,557,
	555,1,0,0,0,557,556,1,0,0,0,558,89,1,0,0,0,559,560,5,67,0,0,560,561,5,1,
	0,0,561,562,3,8,4,0,562,563,5,2,0,0,563,91,1,0,0,0,564,565,3,10,5,0,565,
	93,1,0,0,0,566,570,3,96,48,0,567,570,3,102,51,0,568,570,3,104,52,0,569,
	566,1,0,0,0,569,567,1,0,0,0,569,568,1,0,0,0,570,95,1,0,0,0,571,574,3,98,
	49,0,572,574,3,100,50,0,573,571,1,0,0,0,573,572,1,0,0,0,574,97,1,0,0,0,
	575,577,5,11,0,0,576,575,1,0,0,0,576,577,1,0,0,0,577,578,1,0,0,0,578,579,
	3,188,94,0,579,580,5,42,0,0,580,581,3,106,53,0,581,99,1,0,0,0,582,583,3,
	190,95,0,583,584,5,42,0,0,584,585,3,106,53,0,585,101,1,0,0,0,586,587,3,
	196,98,0,587,588,5,42,0,0,588,589,3,106,53,0,589,599,1,0,0,0,590,591,3,
	198,99,0,591,592,5,42,0,0,592,593,3,106,53,0,593,599,1,0,0,0,594,595,3,
	158,79,0,595,596,5,62,0,0,596,597,3,106,53,0,597,599,1,0,0,0,598,586,1,
	0,0,0,598,590,1,0,0,0,598,594,1,0,0,0,599,103,1,0,0,0,600,601,3,158,79,
	0,601,602,3,204,102,0,602,603,3,106,53,0,603,105,1,0,0,0,604,605,3,110,
	55,0,605,107,1,0,0,0,606,607,3,106,53,0,607,109,1,0,0,0,608,614,3,112,56,
	0,609,610,5,47,0,0,610,611,3,106,53,0,611,612,5,46,0,0,612,613,3,106,53,
	0,613,615,1,0,0,0,614,609,1,0,0,0,614,615,1,0,0,0,615,111,1,0,0,0,616,621,
	3,114,57,0,617,618,5,20,0,0,618,620,3,114,57,0,619,617,1,0,0,0,620,623,
	1,0,0,0,621,619,1,0,0,0,621,622,1,0,0,0,622,113,1,0,0,0,623,621,1,0,0,0,
	624,629,3,116,58,0,625,626,5,3,0,0,626,628,3,116,58,0,627,625,1,0,0,0,628,
	631,1,0,0,0,629,627,1,0,0,0,629,630,1,0,0,0,630,115,1,0,0,0,631,629,1,0,
	0,0,632,633,6,58,-1,0,633,634,3,118,59,0,634,640,1,0,0,0,635,636,10,2,0,
	0,636,637,5,50,0,0,637,639,3,118,59,0,638,635,1,0,0,0,639,642,1,0,0,0,640,
	638,1,0,0,0,640,641,1,0,0,0,641,117,1,0,0,0,642,640,1,0,0,0,643,644,6,59,
	-1,0,644,645,3,120,60,0,645,651,1,0,0,0,646,647,10,2,0,0,647,648,5,51,0,
	0,648,650,3,120,60,0,649,646,1,0,0,0,650,653,1,0,0,0,651,649,1,0,0,0,651,
	652,1,0,0,0,652,119,1,0,0,0,653,651,1,0,0,0,654,655,6,60,-1,0,655,656,3,
	122,61,0,656,662,1,0,0,0,657,658,10,2,0,0,658,659,5,49,0,0,659,661,3,122,
	61,0,660,657,1,0,0,0,661,664,1,0,0,0,662,660,1,0,0,0,662,663,1,0,0,0,663,
	121,1,0,0,0,664,662,1,0,0,0,665,669,3,130,65,0,666,668,3,124,62,0,667,666,
	1,0,0,0,668,671,1,0,0,0,669,667,1,0,0,0,669,670,1,0,0,0,670,123,1,0,0,0,
	671,669,1,0,0,0,672,675,3,126,63,0,673,675,3,128,64,0,674,672,1,0,0,0,674,
	673,1,0,0,0,675,125,1,0,0,0,676,677,5,38,0,0,677,678,3,130,65,0,678,127,
	1,0,0,0,679,680,5,39,0,0,680,681,3,130,65,0,681,129,1,0,0,0,682,686,3,142,
	71,0,683,685,3,132,66,0,684,683,1,0,0,0,685,688,1,0,0,0,686,684,1,0,0,0,
	686,687,1,0,0,0,687,131,1,0,0,0,688,686,1,0,0,0,689,694,3,134,67,0,690,
	694,3,136,68,0,691,694,3,138,69,0,692,694,3,140,70,0,693,689,1,0,0,0,693,
	690,1,0,0,0,693,691,1,0,0,0,693,692,1,0,0,0,694,133,1,0,0,0,695,696,5,36,
	0,0,696,697,3,142,71,0,697,135,1,0,0,0,698,699,5,40,0,0,699,700,3,142,71,
	0,700,137,1,0,0,0,701,702,5,37,0,0,702,703,3,142,71,0,703,139,1,0,0,0,704,
	705,5,41,0,0,705,706,3,142,71,0,706,141,1,0,0,0,707,708,6,71,-1,0,708,709,
	3,146,73,0,709,716,1,0,0,0,710,711,10,2,0,0,711,712,3,144,72,0,712,713,
	3,146,73,0,713,715,1,0,0,0,714,710,1,0,0,0,715,718,1,0,0,0,716,714,1,0,
	0,0,716,717,1,0,0,0,717,143,1,0,0,0,718,716,1,0,0,0,719,720,7,0,0,0,720,
	145,1,0,0,0,721,722,6,73,-1,0,722,723,3,150,75,0,723,730,1,0,0,0,724,725,
	10,2,0,0,725,726,3,148,74,0,726,727,3,150,75,0,727,729,1,0,0,0,728,724,
	1,0,0,0,729,732,1,0,0,0,730,728,1,0,0,0,730,731,1,0,0,0,731,147,1,0,0,0,
	732,730,1,0,0,0,733,734,7,1,0,0,734,149,1,0,0,0,735,736,6,75,-1,0,736,737,
	3,154,77,0,737,744,1,0,0,0,738,739,10,2,0,0,739,740,3,152,76,0,740,741,
	3,154,77,0,741,743,1,0,0,0,742,738,1,0,0,0,743,746,1,0,0,0,744,742,1,0,
	0,0,744,745,1,0,0,0,745,151,1,0,0,0,746,744,1,0,0,0,747,748,7,2,0,0,748,
	153,1,0,0,0,749,750,3,156,78,0,750,751,3,154,77,0,751,754,1,0,0,0,752,754,
	3,158,79,0,753,749,1,0,0,0,753,752,1,0,0,0,754,155,1,0,0,0,755,756,7,3,
	0,0,756,157,1,0,0,0,757,758,6,79,-1,0,758,759,3,166,83,0,759,779,1,0,0,
	0,760,761,10,4,0,0,761,762,5,44,0,0,762,778,3,220,110,0,763,765,10,3,0,
	0,764,766,3,212,106,0,765,764,1,0,0,0,765,766,1,0,0,0,766,767,1,0,0,0,767,
	769,5,30,0,0,768,770,3,160,80,0,769,768,1,0,0,0,769,770,1,0,0,0,770,771,
	1,0,0,0,771,778,5,31,0,0,772,773,10,2,0,0,773,774,5,32,0,0,774,775,3,164,
	82,0,775,776,5,33,0,0,776,778,1,0,0,0,777,760,1,0,0,0,777,763,1,0,0,0,777,
	772,1,0,0,0,778,781,1,0,0,0,779,777,1,0,0,0,779,780,1,0,0,0,780,159,1,0,
	0,0,781,779,1,0,0,0,782,787,3,162,81,0,783,784,5,45,0,0,784,786,3,162,81,
	0,785,783,1,0,0,0,786,789,1,0,0,0,787,785,1,0,0,0,787,788,1,0,0,0,788,791,
	1,0,0,0,789,787,1,0,0,0,790,792,5,45,0,0,791,790,1,0,0,0,791,792,1,0,0,
	0,792,161,1,0,0,0,793,794,3,222,111,0,794,795,5,42,0,0,795,797,1,0,0,0,
	796,793,1,0,0,0,796,797,1,0,0,0,797,798,1,0,0,0,798,799,3,106,53,0,799,
	163,1,0,0,0,800,805,3,106,53,0,801,802,5,45,0,0,802,804,3,106,53,0,803,
	801,1,0,0,0,804,807,1,0,0,0,805,803,1,0,0,0,805,806,1,0,0,0,806,809,1,0,
	0,0,807,805,1,0,0,0,808,810,5,45,0,0,809,808,1,0,0,0,809,810,1,0,0,0,810,
	165,1,0,0,0,811,816,3,220,110,0,812,816,3,168,84,0,813,816,3,178,89,0,814,
	816,3,180,90,0,815,811,1,0,0,0,815,812,1,0,0,0,815,813,1,0,0,0,815,814,
	1,0,0,0,816,167,1,0,0,0,817,822,3,170,85,0,818,822,3,172,86,0,819,822,3,
	174,87,0,820,822,3,176,88,0,821,817,1,0,0,0,821,818,1,0,0,0,821,819,1,0,
	0,0,821,820,1,0,0,0,822,169,1,0,0,0,823,824,5,64,0,0,824,171,1,0,0,0,825,
	826,5,65,0,0,826,173,1,0,0,0,827,828,7,4,0,0,828,175,1,0,0,0,829,830,5,
	66,0,0,830,177,1,0,0,0,831,832,5,30,0,0,832,833,3,106,53,0,833,834,5,31,
	0,0,834,179,1,0,0,0,835,847,5,32,0,0,836,841,3,106,53,0,837,838,5,45,0,
	0,838,840,3,106,53,0,839,837,1,0,0,0,840,843,1,0,0,0,841,839,1,0,0,0,841,
	842,1,0,0,0,842,845,1,0,0,0,843,841,1,0,0,0,844,846,5,45,0,0,845,844,1,
	0,0,0,845,846,1,0,0,0,846,848,1,0,0,0,847,836,1,0,0,0,847,848,1,0,0,0,848,
	849,1,0,0,0,849,850,5,33,0,0,850,181,1,0,0,0,851,852,5,15,0,0,852,853,3,
	218,109,0,853,854,5,55,0,0,854,855,3,218,109,0,855,856,5,55,0,0,856,859,
	3,170,85,0,857,858,5,4,0,0,858,860,3,218,109,0,859,857,1,0,0,0,859,860,
	1,0,0,0,860,183,1,0,0,0,861,862,5,5,0,0,862,185,1,0,0,0,863,864,5,8,0,0,
	864,187,1,0,0,0,865,867,3,192,96,0,866,865,1,0,0,0,866,867,1,0,0,0,867,
	868,1,0,0,0,868,869,3,206,103,0,869,870,3,222,111,0,870,876,1,0,0,0,871,
	873,3,192,96,0,872,871,1,0,0,0,872,873,1,0,0,0,873,874,1,0,0,0,874,876,
	3,222,111,0,875,866,1,0,0,0,875,872,1,0,0,0,876,189,1,0,0,0,877,878,5,32,
	0,0,878,883,3,222,111,0,879,880,5,45,0,0,880,882,3,222,111,0,881,879,1,
	0,0,0,882,885,1,0,0,0,883,881,1,0,0,0,883,884,1,0,0,0,884,887,1,0,0,0,885,
	883,1,0,0,0,886,888,5,45,0,0,887,886,1,0,0,0,887,888,1,0,0,0,888,889,1,
	0,0,0,889,890,5,33,0,0,890,191,1,0,0,0,891,892,7,5,0,0,892,193,1,0,0,0,
	893,898,3,196,98,0,894,898,3,198,99,0,895,898,3,200,100,0,896,898,3,202,
	101,0,897,893,1,0,0,0,897,894,1,0,0,0,897,895,1,0,0,0,897,896,1,0,0,0,898,
	195,1,0,0,0,899,900,3,158,79,0,900,901,5,44,0,0,901,902,3,222,111,0,902,
	197,1,0,0,0,903,904,3,158,79,0,904,905,5,32,0,0,905,906,3,164,82,0,906,
	907,5,33,0,0,907,199,1,0,0,0,908,909,3,222,111,0,909,201,1,0,0,0,910,911,
	5,30,0,0,911,912,3,194,97,0,912,913,5,31,0,0,913,203,1,0,0,0,914,915,7,
	6,0,0,915,205,1,0,0,0,916,918,3,208,104,0,917,916,1,0,0,0,917,918,1,0,0,
	0,918,919,1,0,0,0,919,921,3,210,105,0,920,922,3,212,106,0,921,920,1,0,0,
	0,921,922,1,0,0,0,922,924,1,0,0,0,923,925,3,214,107,0,924,923,1,0,0,0,924,
	925,1,0,0,0,925,207,1,0,0,0,926,927,7,7,0,0,927,209,1,0,0,0,928,933,3,220,
	110,0,929,930,5,44,0,0,930,932,3,220,110,0,931,929,1,0,0,0,932,935,1,0,
	0,0,933,931,1,0,0,0,933,934,1,0,0,0,934,211,1,0,0,0,935,933,1,0,0,0,936,
	938,5,40,0,0,937,939,3,216,108,0,938,937,1,0,0,0,938,939,1,0,0,0,939,940,
	1,0,0,0,940,941,5,41,0,0,941,213,1,0,0,0,942,943,5,32,0,0,943,944,5,33,
	0,0,944,215,1,0,0,0,945,950,3,206,103,0,946,947,5,45,0,0,947,949,3,206,
	103,0,948,946,1,0,0,0,949,952,1,0,0,0,950,948,1,0,0,0,950,951,1,0,0,0,951,
	954,1,0,0,0,952,950,1,0,0,0,953,955,5,45,0,0,954,953,1,0,0,0,954,955,1,
	0,0,0,955,217,1,0,0,0,956,957,7,8,0,0,957,219,1,0,0,0,958,959,3,218,109,
	0,959,221,1,0,0,0,960,961,3,218,109,0,961,223,1,0,0,0,962,964,3,226,113,
	0,963,962,1,0,0,0,964,965,1,0,0,0,965,963,1,0,0,0,965,966,1,0,0,0,966,225,
	1,0,0,0,967,968,5,69,0,0,968,227,1,0,0,0,96,231,237,242,249,254,262,269,
	273,282,293,298,302,305,324,330,337,342,348,355,359,365,370,372,375,382,
	389,395,401,408,412,418,421,433,436,442,447,459,464,472,482,489,493,500,
	510,525,533,543,546,557,569,573,576,598,614,621,629,640,651,662,669,674,
	686,693,716,730,744,753,765,769,777,779,787,791,796,805,809,815,821,841,
	845,847,859,866,872,875,883,887,897,917,921,924,933,938,950,954,965];

	private static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!PinescriptParser.__ATN) {
			PinescriptParser.__ATN = new ATNDeserializer().deserialize(PinescriptParser._serializedATN);
		}

		return PinescriptParser.__ATN;
	}


	static DecisionsToDFA = PinescriptParser._ATN.decisionToState.map( (ds: DecisionState, index: number) => new DFA(ds, index) );

}

export class StartContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public start_script(): Start_scriptContext {
		return this.getTypedRuleContext(Start_scriptContext, 0) as Start_scriptContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_start;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStart) {
			return visitor.visitStart(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Start_scriptContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EOF(): TerminalNode {
		return this.getToken(PinescriptParser.EOF, 0);
	}
	public statements(): StatementsContext {
		return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_start_script;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStart_script) {
			return visitor.visitStart_script(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Start_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public EOF(): TerminalNode {
		return this.getToken(PinescriptParser.EOF, 0);
	}
	public NEWLINE(): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_start_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStart_expression) {
			return visitor.visitStart_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Start_commentsContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EOF(): TerminalNode {
		return this.getToken(PinescriptParser.EOF, 0);
	}
	public comments(): CommentsContext {
		return this.getTypedRuleContext(CommentsContext, 0) as CommentsContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_start_comments;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStart_comments) {
			return visitor.visitStart_comments(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementsContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public statement_list(): StatementContext[] {
		return this.getTypedRuleContexts(StatementContext) as StatementContext[];
	}
	public statement(i: number): StatementContext {
		return this.getTypedRuleContext(StatementContext, i) as StatementContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_statements;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStatements) {
			return visitor.visitStatements(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StatementContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public compound_statement(): Compound_statementContext {
		return this.getTypedRuleContext(Compound_statementContext, 0) as Compound_statementContext;
	}
	public simple_statements(): Simple_statementsContext {
		return this.getTypedRuleContext(Simple_statementsContext, 0) as Simple_statementsContext;
	}
	public trailing_structure_statements(): Trailing_structure_statementsContext {
		return this.getTypedRuleContext(Trailing_structure_statementsContext, 0) as Trailing_structure_statementsContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_statement;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStatement) {
			return visitor.visitStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Compound_statementContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public compound_assignment(): Compound_assignmentContext {
		return this.getTypedRuleContext(Compound_assignmentContext, 0) as Compound_assignmentContext;
	}
	public type_declaration(): Type_declarationContext {
		return this.getTypedRuleContext(Type_declarationContext, 0) as Type_declarationContext;
	}
	public enum_declaration(): Enum_declarationContext {
		return this.getTypedRuleContext(Enum_declarationContext, 0) as Enum_declarationContext;
	}
	public structure_statement(): Structure_statementContext {
		return this.getTypedRuleContext(Structure_statementContext, 0) as Structure_statementContext;
	}
	public method_declaration(): Method_declarationContext {
		return this.getTypedRuleContext(Method_declarationContext, 0) as Method_declarationContext;
	}
	public function_declaration(): Function_declarationContext {
		return this.getTypedRuleContext(Function_declarationContext, 0) as Function_declarationContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_compound_statement;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitCompound_statement) {
			return visitor.visitCompound_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_statementsContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simple_statement_list(): Simple_statementContext[] {
		return this.getTypedRuleContexts(Simple_statementContext) as Simple_statementContext[];
	}
	public simple_statement(i: number): Simple_statementContext {
		return this.getTypedRuleContext(Simple_statementContext, i) as Simple_statementContext;
	}
	public NEWLINE(): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_simple_statements;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSimple_statements) {
			return visitor.visitSimple_statements(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Trailing_structure_statementsContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simple_statement_list(): Simple_statementContext[] {
		return this.getTypedRuleContexts(Simple_statementContext) as Simple_statementContext[];
	}
	public simple_statement(i: number): Simple_statementContext {
		return this.getTypedRuleContext(Simple_statementContext, i) as Simple_statementContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
	public structure(): StructureContext {
		return this.getTypedRuleContext(StructureContext, 0) as StructureContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_trailing_structure_statements;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitTrailing_structure_statements) {
			return visitor.visitTrailing_structure_statements(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_statementContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simple_assignment(): Simple_assignmentContext {
		return this.getTypedRuleContext(Simple_assignmentContext, 0) as Simple_assignmentContext;
	}
	public expression_statement(): Expression_statementContext {
		return this.getTypedRuleContext(Expression_statementContext, 0) as Expression_statementContext;
	}
	public import_statement(): Import_statementContext {
		return this.getTypedRuleContext(Import_statementContext, 0) as Import_statementContext;
	}
	public break_statement(): Break_statementContext {
		return this.getTypedRuleContext(Break_statementContext, 0) as Break_statementContext;
	}
	public continue_statement(): Continue_statementContext {
		return this.getTypedRuleContext(Continue_statementContext, 0) as Continue_statementContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_simple_statement;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSimple_statement) {
			return visitor.visitSimple_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Compound_assignmentContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public compound_variable_initialization(): Compound_variable_initializationContext {
		return this.getTypedRuleContext(Compound_variable_initializationContext, 0) as Compound_variable_initializationContext;
	}
	public compound_reassignment(): Compound_reassignmentContext {
		return this.getTypedRuleContext(Compound_reassignmentContext, 0) as Compound_reassignmentContext;
	}
	public compound_augassignment(): Compound_augassignmentContext {
		return this.getTypedRuleContext(Compound_augassignmentContext, 0) as Compound_augassignmentContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_compound_assignment;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitCompound_assignment) {
			return visitor.visitCompound_assignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Compound_variable_initializationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public compound_name_initialization(): Compound_name_initializationContext {
		return this.getTypedRuleContext(Compound_name_initializationContext, 0) as Compound_name_initializationContext;
	}
	public compound_tuple_initialization(): Compound_tuple_initializationContext {
		return this.getTypedRuleContext(Compound_tuple_initializationContext, 0) as Compound_tuple_initializationContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_compound_variable_initialization;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitCompound_variable_initialization) {
			return visitor.visitCompound_variable_initialization(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Compound_name_initializationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public variable_declaration(): Variable_declarationContext {
		return this.getTypedRuleContext(Variable_declarationContext, 0) as Variable_declarationContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public structure_expression(): Structure_expressionContext {
		return this.getTypedRuleContext(Structure_expressionContext, 0) as Structure_expressionContext;
	}
	public EXPORT(): TerminalNode {
		return this.getToken(PinescriptParser.EXPORT, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_compound_name_initialization;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitCompound_name_initialization) {
			return visitor.visitCompound_name_initialization(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Compound_tuple_initializationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public tuple_declaration(): Tuple_declarationContext {
		return this.getTypedRuleContext(Tuple_declarationContext, 0) as Tuple_declarationContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public structure_expression(): Structure_expressionContext {
		return this.getTypedRuleContext(Structure_expressionContext, 0) as Structure_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_compound_tuple_initialization;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitCompound_tuple_initialization) {
			return visitor.visitCompound_tuple_initialization(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Compound_reassignmentContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public COLONEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.COLONEQUAL, 0);
	}
	public structure_expression(): Structure_expressionContext {
		return this.getTypedRuleContext(Structure_expressionContext, 0) as Structure_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_compound_reassignment;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitCompound_reassignment) {
			return visitor.visitCompound_reassignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Compound_augassignmentContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public augassign_op(): Augassign_opContext {
		return this.getTypedRuleContext(Augassign_opContext, 0) as Augassign_opContext;
	}
	public structure_expression(): Structure_expressionContext {
		return this.getTypedRuleContext(Structure_expressionContext, 0) as Structure_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_compound_augassignment;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitCompound_augassignment) {
			return visitor.visitCompound_augassignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Function_declarationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_specification(): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, 0) as Type_specificationContext;
	}
	public name(): NameContext {
		return this.getTypedRuleContext(NameContext, 0) as NameContext;
	}
	public LPAR(): TerminalNode {
		return this.getToken(PinescriptParser.LPAR, 0);
	}
	public RPAR(): TerminalNode {
		return this.getToken(PinescriptParser.RPAR, 0);
	}
	public RARROW(): TerminalNode {
		return this.getToken(PinescriptParser.RARROW, 0);
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
	public EXPORT(): TerminalNode {
		return this.getToken(PinescriptParser.EXPORT, 0);
	}
	public parameter_list(): Parameter_listContext {
		return this.getTypedRuleContext(Parameter_listContext, 0) as Parameter_listContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_function_declaration;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitFunction_declaration) {
			return visitor.visitFunction_declaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Parameter_listContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public parameter_definition_list(): Parameter_definitionContext[] {
		return this.getTypedRuleContexts(Parameter_definitionContext) as Parameter_definitionContext[];
	}
	public parameter_definition(i: number): Parameter_definitionContext {
		return this.getTypedRuleContext(Parameter_definitionContext, i) as Parameter_definitionContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_parameter_list;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitParameter_list) {
			return visitor.visitParameter_list(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Parameter_definitionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_specification(): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, 0) as Type_specificationContext;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_parameter_definition;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitParameter_definition) {
			return visitor.visitParameter_definition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Method_declarationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public METHOD(): TerminalNode {
		return this.getToken(PinescriptParser.METHOD, 0);
	}
	public type_specification(): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, 0) as Type_specificationContext;
	}
	public name(): NameContext {
		return this.getTypedRuleContext(NameContext, 0) as NameContext;
	}
	public LPAR(): TerminalNode {
		return this.getToken(PinescriptParser.LPAR, 0);
	}
	public RPAR(): TerminalNode {
		return this.getToken(PinescriptParser.RPAR, 0);
	}
	public RARROW(): TerminalNode {
		return this.getToken(PinescriptParser.RARROW, 0);
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
	public EXPORT(): TerminalNode {
		return this.getToken(PinescriptParser.EXPORT, 0);
	}
	public method_parameter_list(): Method_parameter_listContext {
		return this.getTypedRuleContext(Method_parameter_listContext, 0) as Method_parameter_listContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_method_declaration;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitMethod_declaration) {
			return visitor.visitMethod_declaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Method_parameter_listContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public method_parameter_definition_list(): Method_parameter_definitionContext[] {
		return this.getTypedRuleContexts(Method_parameter_definitionContext) as Method_parameter_definitionContext[];
	}
	public method_parameter_definition(i: number): Method_parameter_definitionContext {
		return this.getTypedRuleContext(Method_parameter_definitionContext, i) as Method_parameter_definitionContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_method_parameter_list;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitMethod_parameter_list) {
			return visitor.visitMethod_parameter_list(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Method_parameter_definitionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_specification(): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, 0) as Type_specificationContext;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
	public parameter_definition(): Parameter_definitionContext {
		return this.getTypedRuleContext(Parameter_definitionContext, 0) as Parameter_definitionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_method_parameter_definition;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitMethod_parameter_definition) {
			return visitor.visitMethod_parameter_definition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Type_declarationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TYPE(): TerminalNode {
		return this.getToken(PinescriptParser.TYPE, 0);
	}
	public name(): NameContext {
		return this.getTypedRuleContext(NameContext, 0) as NameContext;
	}
	public NEWLINE(): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, 0);
	}
	public INDENT(): TerminalNode {
		return this.getToken(PinescriptParser.INDENT, 0);
	}
	public field_definitions(): Field_definitionsContext {
		return this.getTypedRuleContext(Field_definitionsContext, 0) as Field_definitionsContext;
	}
	public DEDENT(): TerminalNode {
		return this.getToken(PinescriptParser.DEDENT, 0);
	}
	public EXPORT(): TerminalNode {
		return this.getToken(PinescriptParser.EXPORT, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_type_declaration;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitType_declaration) {
			return visitor.visitType_declaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Field_definitionsContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public field_definition_list(): Field_definitionContext[] {
		return this.getTypedRuleContexts(Field_definitionContext) as Field_definitionContext[];
	}
	public field_definition(i: number): Field_definitionContext {
		return this.getTypedRuleContext(Field_definitionContext, i) as Field_definitionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_field_definitions;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitField_definitions) {
			return visitor.visitField_definitions(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Field_definitionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_specification(): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, 0) as Type_specificationContext;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
	public NEWLINE(): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, 0);
	}
	public VARIP(): TerminalNode {
		return this.getToken(PinescriptParser.VARIP, 0);
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_field_definition;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitField_definition) {
			return visitor.visitField_definition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Enum_declarationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ENUM(): TerminalNode {
		return this.getToken(PinescriptParser.ENUM, 0);
	}
	public name(): NameContext {
		return this.getTypedRuleContext(NameContext, 0) as NameContext;
	}
	public NEWLINE(): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, 0);
	}
	public INDENT(): TerminalNode {
		return this.getToken(PinescriptParser.INDENT, 0);
	}
	public enum_definitions(): Enum_definitionsContext {
		return this.getTypedRuleContext(Enum_definitionsContext, 0) as Enum_definitionsContext;
	}
	public DEDENT(): TerminalNode {
		return this.getToken(PinescriptParser.DEDENT, 0);
	}
	public EXPORT(): TerminalNode {
		return this.getToken(PinescriptParser.EXPORT, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_enum_declaration;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitEnum_declaration) {
			return visitor.visitEnum_declaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Enum_definitionsContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public enum_definition_list(): Enum_definitionContext[] {
		return this.getTypedRuleContexts(Enum_definitionContext) as Enum_definitionContext[];
	}
	public enum_definition(i: number): Enum_definitionContext {
		return this.getTypedRuleContext(Enum_definitionContext, i) as Enum_definitionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_enum_definitions;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitEnum_definitions) {
			return visitor.visitEnum_definitions(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Enum_definitionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
	public NEWLINE(): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, 0);
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_enum_definition;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitEnum_definition) {
			return visitor.visitEnum_definition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StructureContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public if_structure(): If_structureContext {
		return this.getTypedRuleContext(If_structureContext, 0) as If_structureContext;
	}
	public for_structure(): For_structureContext {
		return this.getTypedRuleContext(For_structureContext, 0) as For_structureContext;
	}
	public while_structure(): While_structureContext {
		return this.getTypedRuleContext(While_structureContext, 0) as While_structureContext;
	}
	public switch_structure(): Switch_structureContext {
		return this.getTypedRuleContext(Switch_structureContext, 0) as Switch_structureContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_structure;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStructure) {
			return visitor.visitStructure(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Structure_statementContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public structure(): StructureContext {
		return this.getTypedRuleContext(StructureContext, 0) as StructureContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_structure_statement;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStructure_statement) {
			return visitor.visitStructure_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Structure_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public structure(): StructureContext {
		return this.getTypedRuleContext(StructureContext, 0) as StructureContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_structure_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitStructure_expression) {
			return visitor.visitStructure_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class If_structureContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IF(): TerminalNode {
		return this.getToken(PinescriptParser.IF, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
	public if_tail(): If_tailContext {
		return this.getTypedRuleContext(If_tailContext, 0) as If_tailContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_if_structure;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitIf_structure) {
			return visitor.visitIf_structure(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Elif_structureContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ELSE(): TerminalNode {
		return this.getToken(PinescriptParser.ELSE, 0);
	}
	public IF(): TerminalNode {
		return this.getToken(PinescriptParser.IF, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
	public if_tail(): If_tailContext {
		return this.getTypedRuleContext(If_tailContext, 0) as If_tailContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_elif_structure;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitElif_structure) {
			return visitor.visitElif_structure(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class If_tailContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public elif_structure(): Elif_structureContext {
		return this.getTypedRuleContext(Elif_structureContext, 0) as Elif_structureContext;
	}
	public else_block(): Else_blockContext {
		return this.getTypedRuleContext(Else_blockContext, 0) as Else_blockContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_if_tail;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitIf_tail) {
			return visitor.visitIf_tail(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Else_blockContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ELSE(): TerminalNode {
		return this.getToken(PinescriptParser.ELSE, 0);
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_else_block;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitElse_block) {
			return visitor.visitElse_block(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class For_structureContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public for_structure_to(): For_structure_toContext {
		return this.getTypedRuleContext(For_structure_toContext, 0) as For_structure_toContext;
	}
	public for_structure_in(): For_structure_inContext {
		return this.getTypedRuleContext(For_structure_inContext, 0) as For_structure_inContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_for_structure;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitFor_structure) {
			return visitor.visitFor_structure(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class For_structure_toContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FOR(): TerminalNode {
		return this.getToken(PinescriptParser.FOR, 0);
	}
	public for_iterator(): For_iteratorContext {
		return this.getTypedRuleContext(For_iteratorContext, 0) as For_iteratorContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public TO(): TerminalNode {
		return this.getToken(PinescriptParser.TO, 0);
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
	public BY(): TerminalNode {
		return this.getToken(PinescriptParser.BY, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_for_structure_to;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitFor_structure_to) {
			return visitor.visitFor_structure_to(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class For_structure_inContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public FOR(): TerminalNode {
		return this.getToken(PinescriptParser.FOR, 0);
	}
	public for_iterator(): For_iteratorContext {
		return this.getTypedRuleContext(For_iteratorContext, 0) as For_iteratorContext;
	}
	public IN(): TerminalNode {
		return this.getToken(PinescriptParser.IN, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_for_structure_in;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitFor_structure_in) {
			return visitor.visitFor_structure_in(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class For_iteratorContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_specification(): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, 0) as Type_specificationContext;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
	public tuple_declaration(): Tuple_declarationContext {
		return this.getTypedRuleContext(Tuple_declarationContext, 0) as Tuple_declarationContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_for_iterator;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitFor_iterator) {
			return visitor.visitFor_iterator(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class While_structureContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public WHILE(): TerminalNode {
		return this.getToken(PinescriptParser.WHILE, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_while_structure;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitWhile_structure) {
			return visitor.visitWhile_structure(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Switch_structureContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public SWITCH(): TerminalNode {
		return this.getToken(PinescriptParser.SWITCH, 0);
	}
	public NEWLINE(): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, 0);
	}
	public INDENT(): TerminalNode {
		return this.getToken(PinescriptParser.INDENT, 0);
	}
	public switch_cases(): Switch_casesContext {
		return this.getTypedRuleContext(Switch_casesContext, 0) as Switch_casesContext;
	}
	public DEDENT(): TerminalNode {
		return this.getToken(PinescriptParser.DEDENT, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_switch_structure;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSwitch_structure) {
			return visitor.visitSwitch_structure(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Switch_casesContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public switch_pattern_case_list(): Switch_pattern_caseContext[] {
		return this.getTypedRuleContexts(Switch_pattern_caseContext) as Switch_pattern_caseContext[];
	}
	public switch_pattern_case(i: number): Switch_pattern_caseContext {
		return this.getTypedRuleContext(Switch_pattern_caseContext, i) as Switch_pattern_caseContext;
	}
	public switch_default_case(): Switch_default_caseContext {
		return this.getTypedRuleContext(Switch_default_caseContext, 0) as Switch_default_caseContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_switch_cases;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSwitch_cases) {
			return visitor.visitSwitch_cases(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Switch_pattern_caseContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public RARROW(): TerminalNode {
		return this.getToken(PinescriptParser.RARROW, 0);
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_switch_pattern_case;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSwitch_pattern_case) {
			return visitor.visitSwitch_pattern_case(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Switch_default_caseContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public RARROW(): TerminalNode {
		return this.getToken(PinescriptParser.RARROW, 0);
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_switch_default_case;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSwitch_default_case) {
			return visitor.visitSwitch_default_case(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Local_blockContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public indented_local_block(): Indented_local_blockContext {
		return this.getTypedRuleContext(Indented_local_blockContext, 0) as Indented_local_blockContext;
	}
	public inline_local_block(): Inline_local_blockContext {
		return this.getTypedRuleContext(Inline_local_blockContext, 0) as Inline_local_blockContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_local_block;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitLocal_block) {
			return visitor.visitLocal_block(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Indented_local_blockContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NEWLINE(): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, 0);
	}
	public INDENT(): TerminalNode {
		return this.getToken(PinescriptParser.INDENT, 0);
	}
	public statements(): StatementsContext {
		return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
	}
	public DEDENT(): TerminalNode {
		return this.getToken(PinescriptParser.DEDENT, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_indented_local_block;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitIndented_local_block) {
			return visitor.visitIndented_local_block(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Inline_local_blockContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public statement(): StatementContext {
		return this.getTypedRuleContext(StatementContext, 0) as StatementContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_inline_local_block;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitInline_local_block) {
			return visitor.visitInline_local_block(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_assignmentContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simple_variable_initialization(): Simple_variable_initializationContext {
		return this.getTypedRuleContext(Simple_variable_initializationContext, 0) as Simple_variable_initializationContext;
	}
	public simple_reassignment(): Simple_reassignmentContext {
		return this.getTypedRuleContext(Simple_reassignmentContext, 0) as Simple_reassignmentContext;
	}
	public simple_augassignment(): Simple_augassignmentContext {
		return this.getTypedRuleContext(Simple_augassignmentContext, 0) as Simple_augassignmentContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_simple_assignment;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSimple_assignment) {
			return visitor.visitSimple_assignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_variable_initializationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public simple_name_initialization(): Simple_name_initializationContext {
		return this.getTypedRuleContext(Simple_name_initializationContext, 0) as Simple_name_initializationContext;
	}
	public simple_tuple_initialization(): Simple_tuple_initializationContext {
		return this.getTypedRuleContext(Simple_tuple_initializationContext, 0) as Simple_tuple_initializationContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_simple_variable_initialization;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSimple_variable_initialization) {
			return visitor.visitSimple_variable_initialization(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_name_initializationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public variable_declaration(): Variable_declarationContext {
		return this.getTypedRuleContext(Variable_declarationContext, 0) as Variable_declarationContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public EXPORT(): TerminalNode {
		return this.getToken(PinescriptParser.EXPORT, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_simple_name_initialization;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSimple_name_initialization) {
			return visitor.visitSimple_name_initialization(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_tuple_initializationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public tuple_declaration(): Tuple_declarationContext {
		return this.getTypedRuleContext(Tuple_declarationContext, 0) as Tuple_declarationContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_simple_tuple_initialization;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSimple_tuple_initialization) {
			return visitor.visitSimple_tuple_initialization(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_reassignmentContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public assignment_target_attribute(): Assignment_target_attributeContext {
		return this.getTypedRuleContext(Assignment_target_attributeContext, 0) as Assignment_target_attributeContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public assignment_target_subscript(): Assignment_target_subscriptContext {
		return this.getTypedRuleContext(Assignment_target_subscriptContext, 0) as Assignment_target_subscriptContext;
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public COLONEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.COLONEQUAL, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_simple_reassignment;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSimple_reassignment) {
			return visitor.visitSimple_reassignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Simple_augassignmentContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public augassign_op(): Augassign_opContext {
		return this.getTypedRuleContext(Augassign_opContext, 0) as Augassign_opContext;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_simple_augassignment;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSimple_augassignment) {
			return visitor.visitSimple_augassignment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public conditional_expression(): Conditional_expressionContext {
		return this.getTypedRuleContext(Conditional_expressionContext, 0) as Conditional_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitExpression) {
			return visitor.visitExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Expression_statementContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_expression_statement;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitExpression_statement) {
			return visitor.visitExpression_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Conditional_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public disjunction_expression(): Disjunction_expressionContext {
		return this.getTypedRuleContext(Disjunction_expressionContext, 0) as Disjunction_expressionContext;
	}
	public QUESTION(): TerminalNode {
		return this.getToken(PinescriptParser.QUESTION, 0);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public COLON(): TerminalNode {
		return this.getToken(PinescriptParser.COLON, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_conditional_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitConditional_expression) {
			return visitor.visitConditional_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Disjunction_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public conjunction_expression_list(): Conjunction_expressionContext[] {
		return this.getTypedRuleContexts(Conjunction_expressionContext) as Conjunction_expressionContext[];
	}
	public conjunction_expression(i: number): Conjunction_expressionContext {
		return this.getTypedRuleContext(Conjunction_expressionContext, i) as Conjunction_expressionContext;
	}
	public OR_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.OR);
	}
	public OR(i: number): TerminalNode {
		return this.getToken(PinescriptParser.OR, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_disjunction_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitDisjunction_expression) {
			return visitor.visitDisjunction_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Conjunction_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public bitwise_or_expression_list(): Bitwise_or_expressionContext[] {
		return this.getTypedRuleContexts(Bitwise_or_expressionContext) as Bitwise_or_expressionContext[];
	}
	public bitwise_or_expression(i: number): Bitwise_or_expressionContext {
		return this.getTypedRuleContext(Bitwise_or_expressionContext, i) as Bitwise_or_expressionContext;
	}
	public AND_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.AND);
	}
	public AND(i: number): TerminalNode {
		return this.getToken(PinescriptParser.AND, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_conjunction_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitConjunction_expression) {
			return visitor.visitConjunction_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Bitwise_or_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public bitwise_xor_expression(): Bitwise_xor_expressionContext {
		return this.getTypedRuleContext(Bitwise_xor_expressionContext, 0) as Bitwise_xor_expressionContext;
	}
	public bitwise_or_expression(): Bitwise_or_expressionContext {
		return this.getTypedRuleContext(Bitwise_or_expressionContext, 0) as Bitwise_or_expressionContext;
	}
	public PIPE(): TerminalNode {
		return this.getToken(PinescriptParser.PIPE, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_bitwise_or_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitBitwise_or_expression) {
			return visitor.visitBitwise_or_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Bitwise_xor_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public bitwise_and_expression(): Bitwise_and_expressionContext {
		return this.getTypedRuleContext(Bitwise_and_expressionContext, 0) as Bitwise_and_expressionContext;
	}
	public bitwise_xor_expression(): Bitwise_xor_expressionContext {
		return this.getTypedRuleContext(Bitwise_xor_expressionContext, 0) as Bitwise_xor_expressionContext;
	}
	public CARET(): TerminalNode {
		return this.getToken(PinescriptParser.CARET, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_bitwise_xor_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitBitwise_xor_expression) {
			return visitor.visitBitwise_xor_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Bitwise_and_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public equality_expression(): Equality_expressionContext {
		return this.getTypedRuleContext(Equality_expressionContext, 0) as Equality_expressionContext;
	}
	public bitwise_and_expression(): Bitwise_and_expressionContext {
		return this.getTypedRuleContext(Bitwise_and_expressionContext, 0) as Bitwise_and_expressionContext;
	}
	public AMP(): TerminalNode {
		return this.getToken(PinescriptParser.AMP, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_bitwise_and_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitBitwise_and_expression) {
			return visitor.visitBitwise_and_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Equality_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public inequality_expression(): Inequality_expressionContext {
		return this.getTypedRuleContext(Inequality_expressionContext, 0) as Inequality_expressionContext;
	}
	public equality_trailing_pair_list(): Equality_trailing_pairContext[] {
		return this.getTypedRuleContexts(Equality_trailing_pairContext) as Equality_trailing_pairContext[];
	}
	public equality_trailing_pair(i: number): Equality_trailing_pairContext {
		return this.getTypedRuleContext(Equality_trailing_pairContext, i) as Equality_trailing_pairContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_equality_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitEquality_expression) {
			return visitor.visitEquality_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Equality_trailing_pairContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public equal_trailing_pair(): Equal_trailing_pairContext {
		return this.getTypedRuleContext(Equal_trailing_pairContext, 0) as Equal_trailing_pairContext;
	}
	public not_equal_trailing_pair(): Not_equal_trailing_pairContext {
		return this.getTypedRuleContext(Not_equal_trailing_pairContext, 0) as Not_equal_trailing_pairContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_equality_trailing_pair;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitEquality_trailing_pair) {
			return visitor.visitEquality_trailing_pair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Equal_trailing_pairContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public EQEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQEQUAL, 0);
	}
	public inequality_expression(): Inequality_expressionContext {
		return this.getTypedRuleContext(Inequality_expressionContext, 0) as Inequality_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_equal_trailing_pair;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitEqual_trailing_pair) {
			return visitor.visitEqual_trailing_pair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Not_equal_trailing_pairContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NOTEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.NOTEQUAL, 0);
	}
	public inequality_expression(): Inequality_expressionContext {
		return this.getTypedRuleContext(Inequality_expressionContext, 0) as Inequality_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_not_equal_trailing_pair;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitNot_equal_trailing_pair) {
			return visitor.visitNot_equal_trailing_pair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Inequality_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public shift_expression(): Shift_expressionContext {
		return this.getTypedRuleContext(Shift_expressionContext, 0) as Shift_expressionContext;
	}
	public inequality_trailing_pair_list(): Inequality_trailing_pairContext[] {
		return this.getTypedRuleContexts(Inequality_trailing_pairContext) as Inequality_trailing_pairContext[];
	}
	public inequality_trailing_pair(i: number): Inequality_trailing_pairContext {
		return this.getTypedRuleContext(Inequality_trailing_pairContext, i) as Inequality_trailing_pairContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_inequality_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitInequality_expression) {
			return visitor.visitInequality_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Inequality_trailing_pairContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public less_than_equal_trailing_pair(): Less_than_equal_trailing_pairContext {
		return this.getTypedRuleContext(Less_than_equal_trailing_pairContext, 0) as Less_than_equal_trailing_pairContext;
	}
	public less_than_trailing_pair(): Less_than_trailing_pairContext {
		return this.getTypedRuleContext(Less_than_trailing_pairContext, 0) as Less_than_trailing_pairContext;
	}
	public greater_than_equal_trailing_pair(): Greater_than_equal_trailing_pairContext {
		return this.getTypedRuleContext(Greater_than_equal_trailing_pairContext, 0) as Greater_than_equal_trailing_pairContext;
	}
	public greater_than_trailing_pair(): Greater_than_trailing_pairContext {
		return this.getTypedRuleContext(Greater_than_trailing_pairContext, 0) as Greater_than_trailing_pairContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_inequality_trailing_pair;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitInequality_trailing_pair) {
			return visitor.visitInequality_trailing_pair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Less_than_equal_trailing_pairContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LESSEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.LESSEQUAL, 0);
	}
	public shift_expression(): Shift_expressionContext {
		return this.getTypedRuleContext(Shift_expressionContext, 0) as Shift_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_less_than_equal_trailing_pair;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitLess_than_equal_trailing_pair) {
			return visitor.visitLess_than_equal_trailing_pair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Less_than_trailing_pairContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LESS(): TerminalNode {
		return this.getToken(PinescriptParser.LESS, 0);
	}
	public shift_expression(): Shift_expressionContext {
		return this.getTypedRuleContext(Shift_expressionContext, 0) as Shift_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_less_than_trailing_pair;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitLess_than_trailing_pair) {
			return visitor.visitLess_than_trailing_pair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Greater_than_equal_trailing_pairContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public GREATEREQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.GREATEREQUAL, 0);
	}
	public shift_expression(): Shift_expressionContext {
		return this.getTypedRuleContext(Shift_expressionContext, 0) as Shift_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_greater_than_equal_trailing_pair;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitGreater_than_equal_trailing_pair) {
			return visitor.visitGreater_than_equal_trailing_pair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Greater_than_trailing_pairContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public GREATER(): TerminalNode {
		return this.getToken(PinescriptParser.GREATER, 0);
	}
	public shift_expression(): Shift_expressionContext {
		return this.getTypedRuleContext(Shift_expressionContext, 0) as Shift_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_greater_than_trailing_pair;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitGreater_than_trailing_pair) {
			return visitor.visitGreater_than_trailing_pair(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Shift_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public additive_expression(): Additive_expressionContext {
		return this.getTypedRuleContext(Additive_expressionContext, 0) as Additive_expressionContext;
	}
	public shift_expression(): Shift_expressionContext {
		return this.getTypedRuleContext(Shift_expressionContext, 0) as Shift_expressionContext;
	}
	public shift_op(): Shift_opContext {
		return this.getTypedRuleContext(Shift_opContext, 0) as Shift_opContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_shift_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitShift_expression) {
			return visitor.visitShift_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Shift_opContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LSHIFT(): TerminalNode {
		return this.getToken(PinescriptParser.LSHIFT, 0);
	}
	public RSHIFT(): TerminalNode {
		return this.getToken(PinescriptParser.RSHIFT, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_shift_op;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitShift_op) {
			return visitor.visitShift_op(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Additive_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public multiplicative_expression(): Multiplicative_expressionContext {
		return this.getTypedRuleContext(Multiplicative_expressionContext, 0) as Multiplicative_expressionContext;
	}
	public additive_expression(): Additive_expressionContext {
		return this.getTypedRuleContext(Additive_expressionContext, 0) as Additive_expressionContext;
	}
	public additive_op(): Additive_opContext {
		return this.getTypedRuleContext(Additive_opContext, 0) as Additive_opContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_additive_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAdditive_expression) {
			return visitor.visitAdditive_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Additive_opContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public PLUS(): TerminalNode {
		return this.getToken(PinescriptParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(PinescriptParser.MINUS, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_additive_op;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAdditive_op) {
			return visitor.visitAdditive_op(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Multiplicative_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public unary_expression(): Unary_expressionContext {
		return this.getTypedRuleContext(Unary_expressionContext, 0) as Unary_expressionContext;
	}
	public multiplicative_expression(): Multiplicative_expressionContext {
		return this.getTypedRuleContext(Multiplicative_expressionContext, 0) as Multiplicative_expressionContext;
	}
	public multiplicative_op(): Multiplicative_opContext {
		return this.getTypedRuleContext(Multiplicative_opContext, 0) as Multiplicative_opContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_multiplicative_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitMultiplicative_expression) {
			return visitor.visitMultiplicative_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Multiplicative_opContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STAR(): TerminalNode {
		return this.getToken(PinescriptParser.STAR, 0);
	}
	public SLASH(): TerminalNode {
		return this.getToken(PinescriptParser.SLASH, 0);
	}
	public PERCENT(): TerminalNode {
		return this.getToken(PinescriptParser.PERCENT, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_multiplicative_op;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitMultiplicative_op) {
			return visitor.visitMultiplicative_op(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Unary_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public unary_op(): Unary_opContext {
		return this.getTypedRuleContext(Unary_opContext, 0) as Unary_opContext;
	}
	public unary_expression(): Unary_expressionContext {
		return this.getTypedRuleContext(Unary_expressionContext, 0) as Unary_expressionContext;
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_unary_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitUnary_expression) {
			return visitor.visitUnary_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Unary_opContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NOT(): TerminalNode {
		return this.getToken(PinescriptParser.NOT, 0);
	}
	public PLUS(): TerminalNode {
		return this.getToken(PinescriptParser.PLUS, 0);
	}
	public MINUS(): TerminalNode {
		return this.getToken(PinescriptParser.MINUS, 0);
	}
	public TILDE(): TerminalNode {
		return this.getToken(PinescriptParser.TILDE, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_unary_op;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitUnary_op) {
			return visitor.visitUnary_op(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Primary_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_primary_expression;
	}
	public override copyFrom(ctx: Primary_expressionContext): void {
		super.copyFrom(ctx);
	}
}
export class Primary_expression_attributeContext extends Primary_expressionContext {
	constructor(parser: PinescriptParser, ctx: Primary_expressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public DOT(): TerminalNode {
		return this.getToken(PinescriptParser.DOT, 0);
	}
	public name_load(): Name_loadContext {
		return this.getTypedRuleContext(Name_loadContext, 0) as Name_loadContext;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitPrimary_expression_attribute) {
			return visitor.visitPrimary_expression_attribute(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class Primary_expression_callContext extends Primary_expressionContext {
	constructor(parser: PinescriptParser, ctx: Primary_expressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public LPAR(): TerminalNode {
		return this.getToken(PinescriptParser.LPAR, 0);
	}
	public RPAR(): TerminalNode {
		return this.getToken(PinescriptParser.RPAR, 0);
	}
	public template_spec_suffix(): Template_spec_suffixContext {
		return this.getTypedRuleContext(Template_spec_suffixContext, 0) as Template_spec_suffixContext;
	}
	public argument_list(): Argument_listContext {
		return this.getTypedRuleContext(Argument_listContext, 0) as Argument_listContext;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitPrimary_expression_call) {
			return visitor.visitPrimary_expression_call(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class Primary_expression_fallbackContext extends Primary_expressionContext {
	constructor(parser: PinescriptParser, ctx: Primary_expressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public atomic_expression(): Atomic_expressionContext {
		return this.getTypedRuleContext(Atomic_expressionContext, 0) as Atomic_expressionContext;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitPrimary_expression_fallback) {
			return visitor.visitPrimary_expression_fallback(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class Primary_expression_subscriptContext extends Primary_expressionContext {
	constructor(parser: PinescriptParser, ctx: Primary_expressionContext) {
		super(parser, ctx.parentCtx, ctx.invokingState);
		super.copyFrom(ctx);
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public LSQB(): TerminalNode {
		return this.getToken(PinescriptParser.LSQB, 0);
	}
	public subscript_slice(): Subscript_sliceContext {
		return this.getTypedRuleContext(Subscript_sliceContext, 0) as Subscript_sliceContext;
	}
	public RSQB(): TerminalNode {
		return this.getToken(PinescriptParser.RSQB, 0);
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitPrimary_expression_subscript) {
			return visitor.visitPrimary_expression_subscript(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Argument_listContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public argument_definition_list(): Argument_definitionContext[] {
		return this.getTypedRuleContexts(Argument_definitionContext) as Argument_definitionContext[];
	}
	public argument_definition(i: number): Argument_definitionContext {
		return this.getTypedRuleContext(Argument_definitionContext, i) as Argument_definitionContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_argument_list;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitArgument_list) {
			return visitor.visitArgument_list(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Argument_definitionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
	public EQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.EQUAL, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_argument_definition;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitArgument_definition) {
			return visitor.visitArgument_definition(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Subscript_sliceContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_subscript_slice;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSubscript_slice) {
			return visitor.visitSubscript_slice(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Atomic_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public name_load(): Name_loadContext {
		return this.getTypedRuleContext(Name_loadContext, 0) as Name_loadContext;
	}
	public literal_expression(): Literal_expressionContext {
		return this.getTypedRuleContext(Literal_expressionContext, 0) as Literal_expressionContext;
	}
	public grouped_expression(): Grouped_expressionContext {
		return this.getTypedRuleContext(Grouped_expressionContext, 0) as Grouped_expressionContext;
	}
	public tuple_expression(): Tuple_expressionContext {
		return this.getTypedRuleContext(Tuple_expressionContext, 0) as Tuple_expressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_atomic_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAtomic_expression) {
			return visitor.visitAtomic_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Literal_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public literal_number(): Literal_numberContext {
		return this.getTypedRuleContext(Literal_numberContext, 0) as Literal_numberContext;
	}
	public literal_string(): Literal_stringContext {
		return this.getTypedRuleContext(Literal_stringContext, 0) as Literal_stringContext;
	}
	public literal_bool(): Literal_boolContext {
		return this.getTypedRuleContext(Literal_boolContext, 0) as Literal_boolContext;
	}
	public literal_color(): Literal_colorContext {
		return this.getTypedRuleContext(Literal_colorContext, 0) as Literal_colorContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_literal_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitLiteral_expression) {
			return visitor.visitLiteral_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Literal_numberContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NUMBER(): TerminalNode {
		return this.getToken(PinescriptParser.NUMBER, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_literal_number;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitLiteral_number) {
			return visitor.visitLiteral_number(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Literal_stringContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STRING(): TerminalNode {
		return this.getToken(PinescriptParser.STRING, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_literal_string;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitLiteral_string) {
			return visitor.visitLiteral_string(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Literal_boolContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public TRUE(): TerminalNode {
		return this.getToken(PinescriptParser.TRUE, 0);
	}
	public FALSE(): TerminalNode {
		return this.getToken(PinescriptParser.FALSE, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_literal_bool;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitLiteral_bool) {
			return visitor.visitLiteral_bool(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Literal_colorContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public COLOR(): TerminalNode {
		return this.getToken(PinescriptParser.COLOR, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_literal_color;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitLiteral_color) {
			return visitor.visitLiteral_color(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Grouped_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LPAR(): TerminalNode {
		return this.getToken(PinescriptParser.LPAR, 0);
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
	public RPAR(): TerminalNode {
		return this.getToken(PinescriptParser.RPAR, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_grouped_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitGrouped_expression) {
			return visitor.visitGrouped_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Tuple_expressionContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LSQB(): TerminalNode {
		return this.getToken(PinescriptParser.LSQB, 0);
	}
	public RSQB(): TerminalNode {
		return this.getToken(PinescriptParser.RSQB, 0);
	}
	public expression_list(): ExpressionContext[] {
		return this.getTypedRuleContexts(ExpressionContext) as ExpressionContext[];
	}
	public expression(i: number): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, i) as ExpressionContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_tuple_expression;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitTuple_expression) {
			return visitor.visitTuple_expression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Import_statementContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public IMPORT(): TerminalNode {
		return this.getToken(PinescriptParser.IMPORT, 0);
	}
	public name_list(): NameContext[] {
		return this.getTypedRuleContexts(NameContext) as NameContext[];
	}
	public name(i: number): NameContext {
		return this.getTypedRuleContext(NameContext, i) as NameContext;
	}
	public SLASH_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.SLASH);
	}
	public SLASH(i: number): TerminalNode {
		return this.getToken(PinescriptParser.SLASH, i);
	}
	public literal_number(): Literal_numberContext {
		return this.getTypedRuleContext(Literal_numberContext, 0) as Literal_numberContext;
	}
	public AS(): TerminalNode {
		return this.getToken(PinescriptParser.AS, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_import_statement;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitImport_statement) {
			return visitor.visitImport_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Break_statementContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public BREAK(): TerminalNode {
		return this.getToken(PinescriptParser.BREAK, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_break_statement;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitBreak_statement) {
			return visitor.visitBreak_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Continue_statementContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public CONTINUE(): TerminalNode {
		return this.getToken(PinescriptParser.CONTINUE, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_continue_statement;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitContinue_statement) {
			return visitor.visitContinue_statement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Variable_declarationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_specification(): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, 0) as Type_specificationContext;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
	public declaration_mode(): Declaration_modeContext {
		return this.getTypedRuleContext(Declaration_modeContext, 0) as Declaration_modeContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_variable_declaration;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitVariable_declaration) {
			return visitor.visitVariable_declaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Tuple_declarationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LSQB(): TerminalNode {
		return this.getToken(PinescriptParser.LSQB, 0);
	}
	public name_store_list(): Name_storeContext[] {
		return this.getTypedRuleContexts(Name_storeContext) as Name_storeContext[];
	}
	public name_store(i: number): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, i) as Name_storeContext;
	}
	public RSQB(): TerminalNode {
		return this.getToken(PinescriptParser.RSQB, 0);
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_tuple_declaration;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitTuple_declaration) {
			return visitor.visitTuple_declaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Declaration_modeContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public VARIP(): TerminalNode {
		return this.getToken(PinescriptParser.VARIP, 0);
	}
	public VAR(): TerminalNode {
		return this.getToken(PinescriptParser.VAR, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_declaration_mode;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitDeclaration_mode) {
			return visitor.visitDeclaration_mode(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Assignment_targetContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public assignment_target_attribute(): Assignment_target_attributeContext {
		return this.getTypedRuleContext(Assignment_target_attributeContext, 0) as Assignment_target_attributeContext;
	}
	public assignment_target_subscript(): Assignment_target_subscriptContext {
		return this.getTypedRuleContext(Assignment_target_subscriptContext, 0) as Assignment_target_subscriptContext;
	}
	public assignment_target_name(): Assignment_target_nameContext {
		return this.getTypedRuleContext(Assignment_target_nameContext, 0) as Assignment_target_nameContext;
	}
	public assignment_target_group(): Assignment_target_groupContext {
		return this.getTypedRuleContext(Assignment_target_groupContext, 0) as Assignment_target_groupContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_assignment_target;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAssignment_target) {
			return visitor.visitAssignment_target(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Assignment_target_attributeContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public DOT(): TerminalNode {
		return this.getToken(PinescriptParser.DOT, 0);
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_assignment_target_attribute;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAssignment_target_attribute) {
			return visitor.visitAssignment_target_attribute(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Assignment_target_subscriptContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public primary_expression(): Primary_expressionContext {
		return this.getTypedRuleContext(Primary_expressionContext, 0) as Primary_expressionContext;
	}
	public LSQB(): TerminalNode {
		return this.getToken(PinescriptParser.LSQB, 0);
	}
	public subscript_slice(): Subscript_sliceContext {
		return this.getTypedRuleContext(Subscript_sliceContext, 0) as Subscript_sliceContext;
	}
	public RSQB(): TerminalNode {
		return this.getToken(PinescriptParser.RSQB, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_assignment_target_subscript;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAssignment_target_subscript) {
			return visitor.visitAssignment_target_subscript(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Assignment_target_nameContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_assignment_target_name;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAssignment_target_name) {
			return visitor.visitAssignment_target_name(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Assignment_target_groupContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LPAR(): TerminalNode {
		return this.getToken(PinescriptParser.LPAR, 0);
	}
	public assignment_target(): Assignment_targetContext {
		return this.getTypedRuleContext(Assignment_targetContext, 0) as Assignment_targetContext;
	}
	public RPAR(): TerminalNode {
		return this.getToken(PinescriptParser.RPAR, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_assignment_target_group;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAssignment_target_group) {
			return visitor.visitAssignment_target_group(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Augassign_opContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public STAREQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.STAREQUAL, 0);
	}
	public SLASHEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.SLASHEQUAL, 0);
	}
	public PERCENTEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.PERCENTEQUAL, 0);
	}
	public PLUSEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.PLUSEQUAL, 0);
	}
	public MINEQUAL(): TerminalNode {
		return this.getToken(PinescriptParser.MINEQUAL, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_augassign_op;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAugassign_op) {
			return visitor.visitAugassign_op(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Type_specificationContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public attributed_type_name(): Attributed_type_nameContext {
		return this.getTypedRuleContext(Attributed_type_nameContext, 0) as Attributed_type_nameContext;
	}
	public type_qualifier(): Type_qualifierContext {
		return this.getTypedRuleContext(Type_qualifierContext, 0) as Type_qualifierContext;
	}
	public template_spec_suffix(): Template_spec_suffixContext {
		return this.getTypedRuleContext(Template_spec_suffixContext, 0) as Template_spec_suffixContext;
	}
	public array_type_suffix(): Array_type_suffixContext {
		return this.getTypedRuleContext(Array_type_suffixContext, 0) as Array_type_suffixContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_type_specification;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitType_specification) {
			return visitor.visitType_specification(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Type_qualifierContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public CONST(): TerminalNode {
		return this.getToken(PinescriptParser.CONST, 0);
	}
	public INPUT(): TerminalNode {
		return this.getToken(PinescriptParser.INPUT, 0);
	}
	public SIMPLE(): TerminalNode {
		return this.getToken(PinescriptParser.SIMPLE, 0);
	}
	public SERIES(): TerminalNode {
		return this.getToken(PinescriptParser.SERIES, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_type_qualifier;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitType_qualifier) {
			return visitor.visitType_qualifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Attributed_type_nameContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public name_load_list(): Name_loadContext[] {
		return this.getTypedRuleContexts(Name_loadContext) as Name_loadContext[];
	}
	public name_load(i: number): Name_loadContext {
		return this.getTypedRuleContext(Name_loadContext, i) as Name_loadContext;
	}
	public DOT_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.DOT);
	}
	public DOT(i: number): TerminalNode {
		return this.getToken(PinescriptParser.DOT, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_attributed_type_name;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitAttributed_type_name) {
			return visitor.visitAttributed_type_name(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Template_spec_suffixContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LESS(): TerminalNode {
		return this.getToken(PinescriptParser.LESS, 0);
	}
	public GREATER(): TerminalNode {
		return this.getToken(PinescriptParser.GREATER, 0);
	}
	public type_argument_list(): Type_argument_listContext {
		return this.getTypedRuleContext(Type_argument_listContext, 0) as Type_argument_listContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_template_spec_suffix;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitTemplate_spec_suffix) {
			return visitor.visitTemplate_spec_suffix(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Array_type_suffixContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public LSQB(): TerminalNode {
		return this.getToken(PinescriptParser.LSQB, 0);
	}
	public RSQB(): TerminalNode {
		return this.getToken(PinescriptParser.RSQB, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_array_type_suffix;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitArray_type_suffix) {
			return visitor.visitArray_type_suffix(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Type_argument_listContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public type_specification_list(): Type_specificationContext[] {
		return this.getTypedRuleContexts(Type_specificationContext) as Type_specificationContext[];
	}
	public type_specification(i: number): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, i) as Type_specificationContext;
	}
	public COMMA_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.COMMA);
	}
	public COMMA(i: number): TerminalNode {
		return this.getToken(PinescriptParser.COMMA, i);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_type_argument_list;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitType_argument_list) {
			return visitor.visitType_argument_list(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class NameContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public NAME(): TerminalNode {
		return this.getToken(PinescriptParser.NAME, 0);
	}
	public TYPE(): TerminalNode {
		return this.getToken(PinescriptParser.TYPE, 0);
	}
	public METHOD(): TerminalNode {
		return this.getToken(PinescriptParser.METHOD, 0);
	}
	public CONST(): TerminalNode {
		return this.getToken(PinescriptParser.CONST, 0);
	}
	public INPUT(): TerminalNode {
		return this.getToken(PinescriptParser.INPUT, 0);
	}
	public SIMPLE(): TerminalNode {
		return this.getToken(PinescriptParser.SIMPLE, 0);
	}
	public SERIES(): TerminalNode {
		return this.getToken(PinescriptParser.SERIES, 0);
	}
	public ENUM(): TerminalNode {
		return this.getToken(PinescriptParser.ENUM, 0);
	}
	public AS(): TerminalNode {
		return this.getToken(PinescriptParser.AS, 0);
	}
	public BY(): TerminalNode {
		return this.getToken(PinescriptParser.BY, 0);
	}
	public TO(): TerminalNode {
		return this.getToken(PinescriptParser.TO, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_name;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitName) {
			return visitor.visitName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Name_loadContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public name(): NameContext {
		return this.getTypedRuleContext(NameContext, 0) as NameContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_name_load;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitName_load) {
			return visitor.visitName_load(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Name_storeContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public name(): NameContext {
		return this.getTypedRuleContext(NameContext, 0) as NameContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_name_store;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitName_store) {
			return visitor.visitName_store(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CommentsContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public comment_list(): CommentContext[] {
		return this.getTypedRuleContexts(CommentContext) as CommentContext[];
	}
	public comment(i: number): CommentContext {
		return this.getTypedRuleContext(CommentContext, i) as CommentContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_comments;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitComments) {
			return visitor.visitComments(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CommentContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public COMMENT(): TerminalNode {
		return this.getToken(PinescriptParser.COMMENT, 0);
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_comment;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitComment) {
			return visitor.visitComment(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}

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
	public static readonly ONCE = 20;
	public static readonly OR = 21;
	public static readonly SERIES = 22;
	public static readonly SIMPLE = 23;
	public static readonly SWITCH = 24;
	public static readonly TO = 25;
	public static readonly TYPE = 26;
	public static readonly TRUE = 27;
	public static readonly VAR = 28;
	public static readonly VARIP = 29;
	public static readonly WHILE = 30;
	public static readonly LPAR = 31;
	public static readonly RPAR = 32;
	public static readonly LSQB = 33;
	public static readonly RSQB = 34;
	public static readonly LSHIFT = 35;
	public static readonly RSHIFT = 36;
	public static readonly LESSEQUAL = 37;
	public static readonly GREATEREQUAL = 38;
	public static readonly EQEQUAL = 39;
	public static readonly NOTEQUAL = 40;
	public static readonly LESS = 41;
	public static readonly GREATER = 42;
	public static readonly EQUAL = 43;
	public static readonly RARROW = 44;
	public static readonly DOT = 45;
	public static readonly COMMA = 46;
	public static readonly COLON = 47;
	public static readonly QUESTION = 48;
	public static readonly TILDE = 49;
	public static readonly AMP = 50;
	public static readonly PIPE = 51;
	public static readonly CARET = 52;
	public static readonly PLUS = 53;
	public static readonly MINUS = 54;
	public static readonly STAR = 55;
	public static readonly SLASH = 56;
	public static readonly PERCENT = 57;
	public static readonly PLUSEQUAL = 58;
	public static readonly MINEQUAL = 59;
	public static readonly STAREQUAL = 60;
	public static readonly SLASHEQUAL = 61;
	public static readonly PERCENTEQUAL = 62;
	public static readonly COLONEQUAL = 63;
	public static readonly NAME = 64;
	public static readonly NUMBER = 65;
	public static readonly STRING = 66;
	public static readonly COLOR = 67;
	public static readonly NEWLINE = 68;
	public static readonly WS = 69;
	public static readonly COMMENT = 70;
	public static readonly UNICODE_NOISE = 71;
	public static readonly ERROR_TOKEN = 72;
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
	public static readonly RULE_value_structure = 28;
	public static readonly RULE_structure = 29;
	public static readonly RULE_structure_statement = 30;
	public static readonly RULE_structure_expression = 31;
	public static readonly RULE_if_structure = 32;
	public static readonly RULE_elif_structure = 33;
	public static readonly RULE_if_tail = 34;
	public static readonly RULE_else_block = 35;
	public static readonly RULE_for_structure = 36;
	public static readonly RULE_for_structure_to = 37;
	public static readonly RULE_for_structure_in = 38;
	public static readonly RULE_for_iterator = 39;
	public static readonly RULE_while_structure = 40;
	public static readonly RULE_switch_structure = 41;
	public static readonly RULE_once_structure = 42;
	public static readonly RULE_switch_case = 43;
	public static readonly RULE_switch_cases = 44;
	public static readonly RULE_switch_pattern_case = 45;
	public static readonly RULE_switch_patterns = 46;
	public static readonly RULE_switch_default_case = 47;
	public static readonly RULE_local_block = 48;
	public static readonly RULE_indented_local_block = 49;
	public static readonly RULE_inline_local_block = 50;
	public static readonly RULE_simple_assignment = 51;
	public static readonly RULE_simple_variable_initialization = 52;
	public static readonly RULE_simple_name_initialization = 53;
	public static readonly RULE_simple_tuple_initialization = 54;
	public static readonly RULE_simple_reassignment = 55;
	public static readonly RULE_simple_augassignment = 56;
	public static readonly RULE_expression = 57;
	public static readonly RULE_expression_statement = 58;
	public static readonly RULE_conditional_expression = 59;
	public static readonly RULE_disjunction_expression = 60;
	public static readonly RULE_conjunction_expression = 61;
	public static readonly RULE_bitwise_or_expression = 62;
	public static readonly RULE_bitwise_xor_expression = 63;
	public static readonly RULE_bitwise_and_expression = 64;
	public static readonly RULE_equality_expression = 65;
	public static readonly RULE_equality_trailing_pair = 66;
	public static readonly RULE_equal_trailing_pair = 67;
	public static readonly RULE_not_equal_trailing_pair = 68;
	public static readonly RULE_inequality_expression = 69;
	public static readonly RULE_inequality_trailing_pair = 70;
	public static readonly RULE_less_than_equal_trailing_pair = 71;
	public static readonly RULE_less_than_trailing_pair = 72;
	public static readonly RULE_greater_than_equal_trailing_pair = 73;
	public static readonly RULE_greater_than_trailing_pair = 74;
	public static readonly RULE_shift_expression = 75;
	public static readonly RULE_shift_op = 76;
	public static readonly RULE_additive_expression = 77;
	public static readonly RULE_additive_op = 78;
	public static readonly RULE_multiplicative_expression = 79;
	public static readonly RULE_multiplicative_op = 80;
	public static readonly RULE_unary_expression = 81;
	public static readonly RULE_unary_op = 82;
	public static readonly RULE_primary_expression = 83;
	public static readonly RULE_argument_list = 84;
	public static readonly RULE_argument_definition = 85;
	public static readonly RULE_subscript_slice = 86;
	public static readonly RULE_atomic_expression = 87;
	public static readonly RULE_literal_expression = 88;
	public static readonly RULE_literal_number = 89;
	public static readonly RULE_literal_string = 90;
	public static readonly RULE_literal_bool = 91;
	public static readonly RULE_literal_color = 92;
	public static readonly RULE_grouped_expression = 93;
	public static readonly RULE_tuple_expression = 94;
	public static readonly RULE_import_statement = 95;
	public static readonly RULE_break_statement = 96;
	public static readonly RULE_continue_statement = 97;
	public static readonly RULE_variable_declaration = 98;
	public static readonly RULE_tuple_declaration = 99;
	public static readonly RULE_declaration_mode = 100;
	public static readonly RULE_assignment_target = 101;
	public static readonly RULE_assignment_target_attribute = 102;
	public static readonly RULE_assignment_target_subscript = 103;
	public static readonly RULE_assignment_target_name = 104;
	public static readonly RULE_assignment_target_group = 105;
	public static readonly RULE_augassign_op = 106;
	public static readonly RULE_type_specification = 107;
	public static readonly RULE_type_qualifier = 108;
	public static readonly RULE_attributed_type_name = 109;
	public static readonly RULE_template_spec_suffix = 110;
	public static readonly RULE_rshift_closed_type_args = 111;
	public static readonly RULE_array_type_suffix = 112;
	public static readonly RULE_type_argument_list = 113;
	public static readonly RULE_name = 114;
	public static readonly RULE_name_load = 115;
	public static readonly RULE_name_store = 116;
	public static readonly RULE_comments = 117;
	public static readonly RULE_comment = 118;
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
                                                            "'not'", "'once'", 
                                                            "'or'", "'series'", 
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
                                                             "NOT", "ONCE", 
                                                             "OR", "SERIES", 
                                                             "SIMPLE", "SWITCH", 
                                                             "TO", "TYPE", 
                                                             "TRUE", "VAR", 
                                                             "VARIP", "WHILE", 
                                                             "LPAR", "RPAR", 
                                                             "LSQB", "RSQB", 
                                                             "LSHIFT", "RSHIFT", 
                                                             "LESSEQUAL", 
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
		"enum_definitions", "enum_definition", "value_structure", "structure", 
		"structure_statement", "structure_expression", "if_structure", "elif_structure", 
		"if_tail", "else_block", "for_structure", "for_structure_to", "for_structure_in", 
		"for_iterator", "while_structure", "switch_structure", "once_structure", 
		"switch_case", "switch_cases", "switch_pattern_case", "switch_patterns", 
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
		"template_spec_suffix", "rshift_closed_type_args", "array_type_suffix", 
		"type_argument_list", "name", "name_load", "name_store", "comments", "comment",
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
			this.state = 238;
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
			this.state = 241;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 805171167) !== 0) || ((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & 491569) !== 0)) {
				{
				this.state = 240;
				this.statements();
				}
			}

			this.state = 243;
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
			this.state = 245;
			this.expression();
			this.state = 247;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===68) {
				{
				this.state = 246;
				this.match(PinescriptParser.NEWLINE);
				}
			}

			this.state = 249;
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
			this.state = 252;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===70) {
				{
				this.state = 251;
				this.comments();
				}
			}

			this.state = 254;
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
			this.state = 257;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 256;
				this.statement();
				}
				}
				this.state = 259;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 805171167) !== 0) || ((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & 491569) !== 0));
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
			this.state = 264;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 4, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 261;
				this.compound_statement();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 262;
				this.simple_statements();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 263;
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
			this.state = 272;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 5, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 266;
				this.compound_assignment();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 267;
				this.type_declaration();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 268;
				this.enum_declaration();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 269;
				this.structure_statement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 270;
				this.method_declaration();
				}
				break;
			case 6:
				this.enterOuterAlt(localctx, 6);
				{
				this.state = 271;
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
			this.state = 274;
			this.simple_statement();
			this.state = 279;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 275;
					this.match(PinescriptParser.COMMA);
					this.state = 276;
					this.simple_statement();
					}
					}
				}
				this.state = 281;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 6, this._ctx);
			}
			this.state = 283;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===46) {
				{
				this.state = 282;
				this.match(PinescriptParser.COMMA);
				}
			}

			this.state = 285;
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
			this.state = 287;
			this.simple_statement();
			this.state = 292;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 288;
					this.match(PinescriptParser.COMMA);
					this.state = 289;
					this.simple_statement();
					}
					}
				}
				this.state = 294;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 8, this._ctx);
			}
			this.state = 295;
			this.match(PinescriptParser.COMMA);
			this.state = 296;
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
			this.state = 303;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 9, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 298;
				this.simple_assignment();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 299;
				this.expression_statement();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 300;
				this.import_statement();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 301;
				this.break_statement();
				}
				break;
			case 5:
				this.enterOuterAlt(localctx, 5);
				{
				this.state = 302;
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
			this.state = 308;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 305;
				this.compound_variable_initialization();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 306;
				this.compound_reassignment();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 307;
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
			this.state = 312;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 6:
			case 7:
			case 10:
			case 11:
			case 17:
			case 18:
			case 20:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 28:
			case 29:
			case 64:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 310;
				this.compound_name_initialization();
				}
				break;
			case 33:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 311;
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
			this.state = 315;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 314;
				this.match(PinescriptParser.EXPORT);
				}
			}

			this.state = 317;
			this.variable_declaration();
			this.state = 318;
			this.match(PinescriptParser.EQUAL);
			this.state = 319;
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
			this.state = 321;
			this.tuple_declaration();
			this.state = 322;
			this.match(PinescriptParser.EQUAL);
			this.state = 323;
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
			this.state = 325;
			this.primary_expression(0);
			this.state = 326;
			this.match(PinescriptParser.COLONEQUAL);
			this.state = 327;
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
			this.state = 329;
			this.primary_expression(0);
			this.state = 330;
			this.augassign_op();
			this.state = 331;
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
			this.state = 358;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 17, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 334;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11) {
					{
					this.state = 333;
					this.match(PinescriptParser.EXPORT);
					}
				}

				this.state = 336;
				this.type_specification();
				this.state = 337;
				this.name();
				this.state = 338;
				this.match(PinescriptParser.LPAR);
				this.state = 340;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 399901904) !== 0) || _la===64) {
					{
					this.state = 339;
					this.parameter_list();
					}
				}

				this.state = 342;
				this.match(PinescriptParser.RPAR);
				this.state = 343;
				this.match(PinescriptParser.RARROW);
				this.state = 344;
				this.local_block();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 347;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11) {
					{
					this.state = 346;
					this.match(PinescriptParser.EXPORT);
					}
				}

				this.state = 349;
				this.name();
				this.state = 350;
				this.match(PinescriptParser.LPAR);
				this.state = 352;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 399901904) !== 0) || _la===64) {
					{
					this.state = 351;
					this.parameter_list();
					}
				}

				this.state = 354;
				this.match(PinescriptParser.RPAR);
				this.state = 355;
				this.match(PinescriptParser.RARROW);
				this.state = 356;
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
			this.state = 360;
			this.parameter_definition();
			this.state = 365;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 361;
					this.match(PinescriptParser.COMMA);
					this.state = 362;
					this.parameter_definition();
					}
					}
				}
				this.state = 367;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 18, this._ctx);
			}
			this.state = 369;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===46) {
				{
				this.state = 368;
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
			this.state = 382;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 22, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 371;
				this.type_specification();
				this.state = 372;
				this.name_store();
				this.state = 375;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===43) {
					{
					this.state = 373;
					this.match(PinescriptParser.EQUAL);
					this.state = 374;
					this.expression();
					}
				}

				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 377;
				this.name_store();
				this.state = 380;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===43) {
					{
					this.state = 378;
					this.match(PinescriptParser.EQUAL);
					this.state = 379;
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
			this.state = 411;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 27, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 385;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11) {
					{
					this.state = 384;
					this.match(PinescriptParser.EXPORT);
					}
				}

				this.state = 387;
				this.match(PinescriptParser.METHOD);
				this.state = 388;
				this.type_specification();
				this.state = 389;
				this.name();
				this.state = 390;
				this.match(PinescriptParser.LPAR);
				this.state = 392;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 399901904) !== 0) || _la===64) {
					{
					this.state = 391;
					this.method_parameter_list();
					}
				}

				this.state = 394;
				this.match(PinescriptParser.RPAR);
				this.state = 395;
				this.match(PinescriptParser.RARROW);
				this.state = 396;
				this.local_block();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 399;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===11) {
					{
					this.state = 398;
					this.match(PinescriptParser.EXPORT);
					}
				}

				this.state = 401;
				this.match(PinescriptParser.METHOD);
				this.state = 402;
				this.name();
				this.state = 403;
				this.match(PinescriptParser.LPAR);
				this.state = 405;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 399901904) !== 0) || _la===64) {
					{
					this.state = 404;
					this.method_parameter_list();
					}
				}

				this.state = 407;
				this.match(PinescriptParser.RPAR);
				this.state = 408;
				this.match(PinescriptParser.RARROW);
				this.state = 409;
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
			this.state = 413;
			this.method_parameter_definition();
			this.state = 418;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 28, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 414;
					this.match(PinescriptParser.COMMA);
					this.state = 415;
					this.method_parameter_definition();
					}
					}
				}
				this.state = 420;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 28, this._ctx);
			}
			this.state = 422;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===46) {
				{
				this.state = 421;
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
			this.state = 428;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 30, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 424;
				this.type_specification();
				this.state = 425;
				this.name_store();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 427;
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
			this.state = 431;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 430;
				this.match(PinescriptParser.EXPORT);
				}
			}

			this.state = 433;
			this.match(PinescriptParser.TYPE);
			this.state = 434;
			this.name();
			this.state = 435;
			this.match(PinescriptParser.NEWLINE);
			this.state = 436;
			this.match(PinescriptParser.INDENT);
			this.state = 437;
			this.field_definitions();
			this.state = 438;
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
			this.state = 441;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 440;
				this.field_definition();
				}
				}
				this.state = 443;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 936772816) !== 0) || _la===64);
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
			this.state = 446;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===29) {
				{
				this.state = 445;
				this.match(PinescriptParser.VARIP);
				}
			}

			this.state = 448;
			this.type_specification();
			this.state = 449;
			this.name_store();
			this.state = 452;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===43) {
				{
				this.state = 450;
				this.match(PinescriptParser.EQUAL);
				this.state = 451;
				this.expression();
				}
			}

			this.state = 454;
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
			this.state = 457;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 456;
				this.match(PinescriptParser.EXPORT);
				}
			}

			this.state = 459;
			this.match(PinescriptParser.ENUM);
			this.state = 460;
			this.name();
			this.state = 461;
			this.match(PinescriptParser.NEWLINE);
			this.state = 462;
			this.match(PinescriptParser.INDENT);
			this.state = 463;
			this.enum_definitions();
			this.state = 464;
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
			this.state = 467;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 466;
				this.enum_definition();
				}
				}
				this.state = 469;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & 399901904) !== 0) || _la===64);
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
			this.state = 471;
			this.name_store();
			this.state = 474;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===43) {
				{
				this.state = 472;
				this.match(PinescriptParser.EQUAL);
				this.state = 473;
				this.expression();
				}
			}

			this.state = 476;
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
	public value_structure(): Value_structureContext {
		let localctx: Value_structureContext = new Value_structureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 56, PinescriptParser.RULE_value_structure);
		try {
			this.state = 482;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 14:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 478;
				this.if_structure();
				}
				break;
			case 13:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 479;
				this.for_structure();
				}
				break;
			case 30:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 480;
				this.while_structure();
				}
				break;
			case 24:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 481;
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
	public structure(): StructureContext {
		let localctx: StructureContext = new StructureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 58, PinescriptParser.RULE_structure);
		try {
			this.state = 486;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 13:
			case 14:
			case 24:
			case 30:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 484;
				this.value_structure();
				}
				break;
			case 20:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 485;
				this.once_structure();
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
		this.enterRule(localctx, 60, PinescriptParser.RULE_structure_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 488;
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
		this.enterRule(localctx, 62, PinescriptParser.RULE_structure_expression);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 490;
			this.value_structure();
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
		this.enterRule(localctx, 64, PinescriptParser.RULE_if_structure);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 492;
			this.match(PinescriptParser.IF);
			this.state = 493;
			this.expression();
			this.state = 494;
			this.local_block();
			this.state = 496;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 40, this._ctx) ) {
			case 1:
				{
				this.state = 495;
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
		this.enterRule(localctx, 66, PinescriptParser.RULE_elif_structure);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 498;
			this.match(PinescriptParser.ELSE);
			this.state = 499;
			this.match(PinescriptParser.IF);
			this.state = 500;
			this.expression();
			this.state = 501;
			this.local_block();
			this.state = 503;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 41, this._ctx) ) {
			case 1:
				{
				this.state = 502;
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
		this.enterRule(localctx, 68, PinescriptParser.RULE_if_tail);
		try {
			this.state = 507;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 42, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 505;
				this.elif_structure();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 506;
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
		this.enterRule(localctx, 70, PinescriptParser.RULE_else_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 509;
			this.match(PinescriptParser.ELSE);
			this.state = 510;
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
		this.enterRule(localctx, 72, PinescriptParser.RULE_for_structure);
		try {
			this.state = 514;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 43, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 512;
				this.for_structure_to();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 513;
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
		this.enterRule(localctx, 74, PinescriptParser.RULE_for_structure_to);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 516;
			this.match(PinescriptParser.FOR);
			this.state = 517;
			this.for_iterator();
			this.state = 518;
			this.match(PinescriptParser.EQUAL);
			this.state = 519;
			this.expression();
			this.state = 520;
			this.match(PinescriptParser.TO);
			this.state = 521;
			this.expression();
			this.state = 524;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 44, this._ctx) ) {
			case 1:
				{
				this.state = 522;
				this.match(PinescriptParser.BY);
				this.state = 523;
				this.expression();
				}
				break;
			}
			this.state = 526;
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
		this.enterRule(localctx, 76, PinescriptParser.RULE_for_structure_in);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 528;
			this.match(PinescriptParser.FOR);
			this.state = 529;
			this.for_iterator();
			this.state = 530;
			this.match(PinescriptParser.IN);
			this.state = 531;
			this.expression();
			this.state = 532;
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
		this.enterRule(localctx, 78, PinescriptParser.RULE_for_iterator);
		try {
			this.state = 539;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 45, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 534;
				this.type_specification();
				this.state = 535;
				this.name_store();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 537;
				this.name_store();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 538;
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
		this.enterRule(localctx, 80, PinescriptParser.RULE_while_structure);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 541;
			this.match(PinescriptParser.WHILE);
			this.state = 542;
			this.expression();
			this.state = 543;
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
		this.enterRule(localctx, 82, PinescriptParser.RULE_switch_structure);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 545;
			this.match(PinescriptParser.SWITCH);
			this.state = 547;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 704504141) !== 0) || ((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & 491569) !== 0)) {
				{
				this.state = 546;
				this.expression();
				}
			}

			this.state = 549;
			this.match(PinescriptParser.NEWLINE);
			this.state = 550;
			this.match(PinescriptParser.INDENT);
			this.state = 551;
			this.switch_cases();
			this.state = 552;
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
	public once_structure(): Once_structureContext {
		let localctx: Once_structureContext = new Once_structureContext(this, this._ctx, this.state);
		this.enterRule(localctx, 84, PinescriptParser.RULE_once_structure);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 554;
			this.match(PinescriptParser.ONCE);
			this.state = 556;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 47, this._ctx) ) {
			case 1:
				{
				this.state = 555;
				this.expression();
				}
				break;
			}
			this.state = 558;
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
	public switch_case(): Switch_caseContext {
		let localctx: Switch_caseContext = new Switch_caseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 86, PinescriptParser.RULE_switch_case);
		try {
			this.state = 562;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 6:
			case 7:
			case 10:
			case 12:
			case 17:
			case 18:
			case 19:
			case 20:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 27:
			case 28:
			case 31:
			case 33:
			case 49:
			case 53:
			case 54:
			case 64:
			case 65:
			case 66:
			case 67:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 560;
				this.switch_pattern_case();
				}
				break;
			case 44:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 561;
				this.switch_default_case();
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
	public switch_cases(): Switch_casesContext {
		let localctx: Switch_casesContext = new Switch_casesContext(this, this._ctx, this.state);
		this.enterRule(localctx, 88, PinescriptParser.RULE_switch_cases);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 565;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 564;
				this.switch_case();
				}
				}
				this.state = 567;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 704504141) !== 0) || ((((_la - 44)) & ~0x1F) === 0 && ((1 << (_la - 44)) & 15730209) !== 0));
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
		this.enterRule(localctx, 90, PinescriptParser.RULE_switch_pattern_case);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 569;
			this.switch_patterns();
			this.state = 570;
			this.match(PinescriptParser.RARROW);
			this.state = 571;
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
	public switch_patterns(): Switch_patternsContext {
		let localctx: Switch_patternsContext = new Switch_patternsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 92, PinescriptParser.RULE_switch_patterns);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 573;
			this.expression();
			this.state = 578;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===46) {
				{
				{
				this.state = 574;
				this.match(PinescriptParser.COMMA);
				this.state = 575;
				this.expression();
				}
				}
				this.state = 580;
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
	public switch_default_case(): Switch_default_caseContext {
		let localctx: Switch_default_caseContext = new Switch_default_caseContext(this, this._ctx, this.state);
		this.enterRule(localctx, 94, PinescriptParser.RULE_switch_default_case);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 581;
			this.match(PinescriptParser.RARROW);
			this.state = 582;
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
		this.enterRule(localctx, 96, PinescriptParser.RULE_local_block);
		try {
			this.state = 586;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 68:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 584;
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
			case 20:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 27:
			case 28:
			case 29:
			case 30:
			case 31:
			case 33:
			case 49:
			case 53:
			case 54:
			case 64:
			case 65:
			case 66:
			case 67:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 585;
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
		this.enterRule(localctx, 98, PinescriptParser.RULE_indented_local_block);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 589;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 588;
				this.match(PinescriptParser.NEWLINE);
				}
				}
				this.state = 591;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la===68);
			this.state = 593;
			this.match(PinescriptParser.INDENT);
			this.state = 594;
			this.statements();
			this.state = 595;
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
		this.enterRule(localctx, 100, PinescriptParser.RULE_inline_local_block);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 597;
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
		this.enterRule(localctx, 102, PinescriptParser.RULE_simple_assignment);
		try {
			this.state = 602;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 53, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 599;
				this.simple_variable_initialization();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 600;
				this.simple_reassignment();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 601;
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
		this.enterRule(localctx, 104, PinescriptParser.RULE_simple_variable_initialization);
		try {
			this.state = 606;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 6:
			case 7:
			case 10:
			case 11:
			case 17:
			case 18:
			case 20:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 28:
			case 29:
			case 64:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 604;
				this.simple_name_initialization();
				}
				break;
			case 33:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 605;
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
		this.enterRule(localctx, 106, PinescriptParser.RULE_simple_name_initialization);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 609;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===11) {
				{
				this.state = 608;
				this.match(PinescriptParser.EXPORT);
				}
			}

			this.state = 611;
			this.variable_declaration();
			this.state = 612;
			this.match(PinescriptParser.EQUAL);
			this.state = 613;
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
		this.enterRule(localctx, 108, PinescriptParser.RULE_simple_tuple_initialization);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 615;
			this.tuple_declaration();
			this.state = 616;
			this.match(PinescriptParser.EQUAL);
			this.state = 617;
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
		this.enterRule(localctx, 110, PinescriptParser.RULE_simple_reassignment);
		try {
			this.state = 631;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 56, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 619;
				this.assignment_target_attribute();
				this.state = 620;
				this.match(PinescriptParser.EQUAL);
				this.state = 621;
				this.expression();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 623;
				this.assignment_target_subscript();
				this.state = 624;
				this.match(PinescriptParser.EQUAL);
				this.state = 625;
				this.expression();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 627;
				this.primary_expression(0);
				this.state = 628;
				this.match(PinescriptParser.COLONEQUAL);
				this.state = 629;
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
		this.enterRule(localctx, 112, PinescriptParser.RULE_simple_augassignment);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 633;
			this.primary_expression(0);
			this.state = 634;
			this.augassign_op();
			this.state = 635;
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
		this.enterRule(localctx, 114, PinescriptParser.RULE_expression);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 637;
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
		this.enterRule(localctx, 116, PinescriptParser.RULE_expression_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 639;
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
		this.enterRule(localctx, 118, PinescriptParser.RULE_conditional_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 641;
			this.disjunction_expression();
			this.state = 647;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===48) {
				{
				this.state = 642;
				this.match(PinescriptParser.QUESTION);
				this.state = 643;
				this.expression();
				this.state = 644;
				this.match(PinescriptParser.COLON);
				this.state = 645;
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
		this.enterRule(localctx, 120, PinescriptParser.RULE_disjunction_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 649;
			this.conjunction_expression();
			this.state = 654;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===21) {
				{
				{
				this.state = 650;
				this.match(PinescriptParser.OR);
				this.state = 651;
				this.conjunction_expression();
				}
				}
				this.state = 656;
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
		this.enterRule(localctx, 122, PinescriptParser.RULE_conjunction_expression);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 657;
			this.bitwise_or_expression(0);
			this.state = 662;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===3) {
				{
				{
				this.state = 658;
				this.match(PinescriptParser.AND);
				this.state = 659;
				this.bitwise_or_expression(0);
				}
				}
				this.state = 664;
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
		let _startState: number = 124;
		this.enterRecursionRule(localctx, 124, PinescriptParser.RULE_bitwise_or_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 666;
			this.bitwise_xor_expression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 673;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 60, this._ctx);
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
					this.state = 668;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 669;
					this.match(PinescriptParser.PIPE);
					this.state = 670;
					this.bitwise_xor_expression(0);
					}
					}
				}
				this.state = 675;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 60, this._ctx);
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
		let _startState: number = 126;
		this.enterRecursionRule(localctx, 126, PinescriptParser.RULE_bitwise_xor_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 677;
			this.bitwise_and_expression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 684;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 61, this._ctx);
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
					this.state = 679;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 680;
					this.match(PinescriptParser.CARET);
					this.state = 681;
					this.bitwise_and_expression(0);
					}
					}
				}
				this.state = 686;
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
		let _startState: number = 128;
		this.enterRecursionRule(localctx, 128, PinescriptParser.RULE_bitwise_and_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 688;
			this.equality_expression();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 695;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 62, this._ctx);
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
					this.state = 690;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 691;
					this.match(PinescriptParser.AMP);
					this.state = 692;
					this.equality_expression();
					}
					}
				}
				this.state = 697;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 62, this._ctx);
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
		this.enterRule(localctx, 130, PinescriptParser.RULE_equality_expression);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 698;
			this.inequality_expression();
			this.state = 702;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 63, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 699;
					this.equality_trailing_pair();
					}
					}
				}
				this.state = 704;
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
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public equality_trailing_pair(): Equality_trailing_pairContext {
		let localctx: Equality_trailing_pairContext = new Equality_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 132, PinescriptParser.RULE_equality_trailing_pair);
		try {
			this.state = 707;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 39:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 705;
				this.equal_trailing_pair();
				}
				break;
			case 40:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 706;
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
		this.enterRule(localctx, 134, PinescriptParser.RULE_equal_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 709;
			this.match(PinescriptParser.EQEQUAL);
			this.state = 710;
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
		this.enterRule(localctx, 136, PinescriptParser.RULE_not_equal_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 712;
			this.match(PinescriptParser.NOTEQUAL);
			this.state = 713;
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
		this.enterRule(localctx, 138, PinescriptParser.RULE_inequality_expression);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 715;
			this.shift_expression(0);
			this.state = 719;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 65, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 716;
					this.inequality_trailing_pair();
					}
					}
				}
				this.state = 721;
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
			this.exitRule();
		}
		return localctx;
	}
	// @RuleVersion(0)
	public inequality_trailing_pair(): Inequality_trailing_pairContext {
		let localctx: Inequality_trailing_pairContext = new Inequality_trailing_pairContext(this, this._ctx, this.state);
		this.enterRule(localctx, 140, PinescriptParser.RULE_inequality_trailing_pair);
		try {
			this.state = 726;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 37:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 722;
				this.less_than_equal_trailing_pair();
				}
				break;
			case 41:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 723;
				this.less_than_trailing_pair();
				}
				break;
			case 38:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 724;
				this.greater_than_equal_trailing_pair();
				}
				break;
			case 42:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 725;
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
		this.enterRule(localctx, 142, PinescriptParser.RULE_less_than_equal_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 728;
			this.match(PinescriptParser.LESSEQUAL);
			this.state = 729;
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
		this.enterRule(localctx, 144, PinescriptParser.RULE_less_than_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 731;
			this.match(PinescriptParser.LESS);
			this.state = 732;
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
		this.enterRule(localctx, 146, PinescriptParser.RULE_greater_than_equal_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 734;
			this.match(PinescriptParser.GREATEREQUAL);
			this.state = 735;
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
		this.enterRule(localctx, 148, PinescriptParser.RULE_greater_than_trailing_pair);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 737;
			this.match(PinescriptParser.GREATER);
			this.state = 738;
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
		let _startState: number = 150;
		this.enterRecursionRule(localctx, 150, PinescriptParser.RULE_shift_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 741;
			this.additive_expression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 749;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 67, this._ctx);
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
					this.state = 743;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 744;
					this.shift_op();
					this.state = 745;
					this.additive_expression(0);
					}
					}
				}
				this.state = 751;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 67, this._ctx);
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
		this.enterRule(localctx, 152, PinescriptParser.RULE_shift_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 752;
			_la = this._input.LA(1);
			if(!(_la===35 || _la===36)) {
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
		let _startState: number = 154;
		this.enterRecursionRule(localctx, 154, PinescriptParser.RULE_additive_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 755;
			this.multiplicative_expression(0);
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 763;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 68, this._ctx);
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
					this.state = 757;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 758;
					this.additive_op();
					this.state = 759;
					this.multiplicative_expression(0);
					}
					}
				}
				this.state = 765;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 68, this._ctx);
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
		this.enterRule(localctx, 156, PinescriptParser.RULE_additive_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 766;
			_la = this._input.LA(1);
			if(!(_la===53 || _la===54)) {
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
		let _startState: number = 158;
		this.enterRecursionRule(localctx, 158, PinescriptParser.RULE_multiplicative_expression, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			this.state = 769;
			this.unary_expression();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 777;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 69, this._ctx);
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
					this.state = 771;
					if (!(this.precpred(this._ctx, 2))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
					}
					this.state = 772;
					this.multiplicative_op();
					this.state = 773;
					this.unary_expression();
					}
					}
				}
				this.state = 779;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 69, this._ctx);
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
		this.enterRule(localctx, 160, PinescriptParser.RULE_multiplicative_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 780;
			_la = this._input.LA(1);
			if(!(((((_la - 55)) & ~0x1F) === 0 && ((1 << (_la - 55)) & 7) !== 0))) {
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
		this.enterRule(localctx, 162, PinescriptParser.RULE_unary_expression);
		try {
			this.state = 786;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 19:
			case 49:
			case 53:
			case 54:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 782;
				this.unary_op();
				this.state = 783;
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
			case 20:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 27:
			case 28:
			case 31:
			case 33:
			case 64:
			case 65:
			case 66:
			case 67:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 785;
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
		this.enterRule(localctx, 164, PinescriptParser.RULE_unary_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 788;
			_la = this._input.LA(1);
			if(!(_la===19 || ((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & 49) !== 0))) {
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
		let _startState: number = 166;
		this.enterRecursionRule(localctx, 166, PinescriptParser.RULE_primary_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			{
			localctx = new Primary_expression_fallbackContext(this, localctx);
			this._ctx = localctx;
			_prevctx = localctx;

			this.state = 791;
			this.atomic_expression();
			}
			this._ctx.stop = this._input.LT(-1);
			this.state = 812;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 74, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = localctx;
					{
					this.state = 810;
					this._errHandler.sync(this);
					switch ( this._interp.adaptivePredict(this._input, 73, this._ctx) ) {
					case 1:
						{
						localctx = new Primary_expression_attributeContext(this, new Primary_expressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_primary_expression);
						this.state = 793;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 794;
						this.match(PinescriptParser.DOT);
						this.state = 795;
						this.name_load();
						}
						break;
					case 2:
						{
						localctx = new Primary_expression_callContext(this, new Primary_expressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_primary_expression);
						this.state = 796;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 798;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (_la===41) {
							{
							this.state = 797;
							this.template_spec_suffix();
							}
						}

						this.state = 800;
						this.match(PinescriptParser.LPAR);
						this.state = 802;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
						if (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 704504141) !== 0) || ((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & 491569) !== 0)) {
							{
							this.state = 801;
							this.argument_list();
							}
						}

						this.state = 804;
						this.match(PinescriptParser.RPAR);
						}
						break;
					case 3:
						{
						localctx = new Primary_expression_subscriptContext(this, new Primary_expressionContext(this, _parentctx, _parentState));
						this.pushNewRecursionContext(localctx, _startState, PinescriptParser.RULE_primary_expression);
						this.state = 805;
						if (!(this.precpred(this._ctx, 2))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 2)");
						}
						this.state = 806;
						this.match(PinescriptParser.LSQB);
						this.state = 807;
						this.subscript_slice();
						this.state = 808;
						this.match(PinescriptParser.RSQB);
						}
						break;
					}
					}
				}
				this.state = 814;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 74, this._ctx);
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
		this.enterRule(localctx, 168, PinescriptParser.RULE_argument_list);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 815;
			this.argument_definition();
			this.state = 820;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 75, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 816;
					this.match(PinescriptParser.COMMA);
					this.state = 817;
					this.argument_definition();
					}
					}
				}
				this.state = 822;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 75, this._ctx);
			}
			this.state = 824;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===46) {
				{
				this.state = 823;
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
		this.enterRule(localctx, 170, PinescriptParser.RULE_argument_definition);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 829;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 77, this._ctx) ) {
			case 1:
				{
				this.state = 826;
				this.name_store();
				this.state = 827;
				this.match(PinescriptParser.EQUAL);
				}
				break;
			}
			this.state = 831;
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
		this.enterRule(localctx, 172, PinescriptParser.RULE_subscript_slice);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 833;
			this.expression();
			this.state = 838;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 78, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 834;
					this.match(PinescriptParser.COMMA);
					this.state = 835;
					this.expression();
					}
					}
				}
				this.state = 840;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 78, this._ctx);
			}
			this.state = 842;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===46) {
				{
				this.state = 841;
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
		this.enterRule(localctx, 174, PinescriptParser.RULE_atomic_expression);
		try {
			this.state = 848;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 4:
			case 6:
			case 7:
			case 10:
			case 17:
			case 18:
			case 20:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 28:
			case 64:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 844;
				this.name_load();
				}
				break;
			case 12:
			case 27:
			case 65:
			case 66:
			case 67:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 845;
				this.literal_expression();
				}
				break;
			case 31:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 846;
				this.grouped_expression();
				}
				break;
			case 33:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 847;
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
		this.enterRule(localctx, 176, PinescriptParser.RULE_literal_expression);
		try {
			this.state = 854;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case 65:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 850;
				this.literal_number();
				}
				break;
			case 66:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 851;
				this.literal_string();
				}
				break;
			case 12:
			case 27:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 852;
				this.literal_bool();
				}
				break;
			case 67:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 853;
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
		this.enterRule(localctx, 178, PinescriptParser.RULE_literal_number);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 856;
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
		this.enterRule(localctx, 180, PinescriptParser.RULE_literal_string);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 858;
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
		this.enterRule(localctx, 182, PinescriptParser.RULE_literal_bool);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 860;
			_la = this._input.LA(1);
			if(!(_la===12 || _la===27)) {
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
		this.enterRule(localctx, 184, PinescriptParser.RULE_literal_color);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 862;
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
		this.enterRule(localctx, 186, PinescriptParser.RULE_grouped_expression);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 864;
			this.match(PinescriptParser.LPAR);
			this.state = 865;
			this.expression();
			this.state = 866;
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
		this.enterRule(localctx, 188, PinescriptParser.RULE_tuple_expression);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 868;
			this.match(PinescriptParser.LSQB);
			this.state = 880;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (((((_la - 4)) & ~0x1F) === 0 && ((1 << (_la - 4)) & 704504141) !== 0) || ((((_la - 49)) & ~0x1F) === 0 && ((1 << (_la - 49)) & 491569) !== 0)) {
				{
				this.state = 869;
				this.expression();
				this.state = 874;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 82, this._ctx);
				while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
					if (_alt === 1) {
						{
						{
						this.state = 870;
						this.match(PinescriptParser.COMMA);
						this.state = 871;
						this.expression();
						}
						}
					}
					this.state = 876;
					this._errHandler.sync(this);
					_alt = this._interp.adaptivePredict(this._input, 82, this._ctx);
				}
				this.state = 878;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la===46) {
					{
					this.state = 877;
					this.match(PinescriptParser.COMMA);
					}
				}

				}
			}

			this.state = 882;
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
		this.enterRule(localctx, 190, PinescriptParser.RULE_import_statement);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 884;
			this.match(PinescriptParser.IMPORT);
			this.state = 885;
			this.name();
			this.state = 886;
			this.match(PinescriptParser.SLASH);
			this.state = 887;
			this.name();
			this.state = 888;
			this.match(PinescriptParser.SLASH);
			this.state = 889;
			this.literal_number();
			this.state = 892;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===4) {
				{
				this.state = 890;
				this.match(PinescriptParser.AS);
				this.state = 891;
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
		this.enterRule(localctx, 192, PinescriptParser.RULE_break_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 894;
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
		this.enterRule(localctx, 194, PinescriptParser.RULE_continue_statement);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 896;
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
		this.enterRule(localctx, 196, PinescriptParser.RULE_variable_declaration);
		try {
			this.state = 909;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 86, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 898;
				this.declaration_mode();
				this.state = 899;
				this.type_specification();
				this.state = 900;
				this.name_store();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 902;
				this.declaration_mode();
				this.state = 903;
				this.name_store();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 905;
				this.type_specification();
				this.state = 906;
				this.name_store();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 908;
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
		this.enterRule(localctx, 198, PinescriptParser.RULE_tuple_declaration);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 911;
			this.match(PinescriptParser.LSQB);
			this.state = 912;
			this.name_store();
			this.state = 917;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 87, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 913;
					this.match(PinescriptParser.COMMA);
					this.state = 914;
					this.name_store();
					}
					}
				}
				this.state = 919;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 87, this._ctx);
			}
			this.state = 921;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===46) {
				{
				this.state = 920;
				this.match(PinescriptParser.COMMA);
				}
			}

			this.state = 923;
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
		this.enterRule(localctx, 200, PinescriptParser.RULE_declaration_mode);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 925;
			_la = this._input.LA(1);
			if(!(_la===28 || _la===29)) {
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
		this.enterRule(localctx, 202, PinescriptParser.RULE_assignment_target);
		try {
			this.state = 931;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 89, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 927;
				this.assignment_target_attribute();
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 928;
				this.assignment_target_subscript();
				}
				break;
			case 3:
				this.enterOuterAlt(localctx, 3);
				{
				this.state = 929;
				this.assignment_target_name();
				}
				break;
			case 4:
				this.enterOuterAlt(localctx, 4);
				{
				this.state = 930;
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
		this.enterRule(localctx, 204, PinescriptParser.RULE_assignment_target_attribute);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 933;
			this.primary_expression(0);
			this.state = 934;
			this.match(PinescriptParser.DOT);
			this.state = 935;
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
		this.enterRule(localctx, 206, PinescriptParser.RULE_assignment_target_subscript);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 937;
			this.primary_expression(0);
			this.state = 938;
			this.match(PinescriptParser.LSQB);
			this.state = 939;
			this.subscript_slice();
			this.state = 940;
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
		this.enterRule(localctx, 208, PinescriptParser.RULE_assignment_target_name);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 942;
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
		this.enterRule(localctx, 210, PinescriptParser.RULE_assignment_target_group);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 944;
			this.match(PinescriptParser.LPAR);
			this.state = 945;
			this.assignment_target();
			this.state = 946;
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
		this.enterRule(localctx, 212, PinescriptParser.RULE_augassign_op);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 948;
			_la = this._input.LA(1);
			if(!(((((_la - 58)) & ~0x1F) === 0 && ((1 << (_la - 58)) & 31) !== 0))) {
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
		this.enterRule(localctx, 214, PinescriptParser.RULE_type_specification);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 951;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 90, this._ctx) ) {
			case 1:
				{
				this.state = 950;
				this.type_qualifier();
				}
				break;
			}
			this.state = 953;
			this.attributed_type_name();
			this.state = 955;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===41) {
				{
				this.state = 954;
				this.template_spec_suffix();
				}
			}

			this.state = 958;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===33) {
				{
				this.state = 957;
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
		this.enterRule(localctx, 216, PinescriptParser.RULE_type_qualifier);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 960;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 12714112) !== 0))) {
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
		this.enterRule(localctx, 218, PinescriptParser.RULE_attributed_type_name);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 962;
			this.name_load();
			this.state = 967;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la===45) {
				{
				{
				this.state = 963;
				this.match(PinescriptParser.DOT);
				this.state = 964;
				this.name_load();
				}
				}
				this.state = 969;
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
		this.enterRule(localctx, 220, PinescriptParser.RULE_template_spec_suffix);
		let _la: number;
		try {
			this.state = 979;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 95, this._ctx) ) {
			case 1:
				this.enterOuterAlt(localctx, 1);
				{
				this.state = 970;
				this.match(PinescriptParser.LESS);
				this.state = 972;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 399901904) !== 0) || _la===64) {
					{
					this.state = 971;
					this.type_argument_list();
					}
				}

				this.state = 974;
				this.match(PinescriptParser.GREATER);
				}
				break;
			case 2:
				this.enterOuterAlt(localctx, 2);
				{
				this.state = 975;
				this.match(PinescriptParser.LESS);
				this.state = 976;
				this.rshift_closed_type_args();
				this.state = 977;
				this.match(PinescriptParser.RSHIFT);
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
	public rshift_closed_type_args(): Rshift_closed_type_argsContext {
		let localctx: Rshift_closed_type_argsContext = new Rshift_closed_type_argsContext(this, this._ctx, this.state);
		this.enterRule(localctx, 222, PinescriptParser.RULE_rshift_closed_type_args);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 986;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 96, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 981;
					this.type_specification();
					this.state = 982;
					this.match(PinescriptParser.COMMA);
					}
					}
				}
				this.state = 988;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 96, this._ctx);
			}
			this.state = 990;
			this._errHandler.sync(this);
			switch ( this._interp.adaptivePredict(this._input, 97, this._ctx) ) {
			case 1:
				{
				this.state = 989;
				this.type_qualifier();
				}
				break;
			}
			this.state = 992;
			this.attributed_type_name();
			this.state = 993;
			this.match(PinescriptParser.LESS);
			this.state = 995;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & 399901904) !== 0) || _la===64) {
				{
				this.state = 994;
				this.type_argument_list();
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
	public array_type_suffix(): Array_type_suffixContext {
		let localctx: Array_type_suffixContext = new Array_type_suffixContext(this, this._ctx, this.state);
		this.enterRule(localctx, 224, PinescriptParser.RULE_array_type_suffix);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 997;
			this.match(PinescriptParser.LSQB);
			this.state = 998;
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
		this.enterRule(localctx, 226, PinescriptParser.RULE_type_argument_list);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 1000;
			this.type_specification();
			this.state = 1005;
			this._errHandler.sync(this);
			_alt = this._interp.adaptivePredict(this._input, 99, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 1001;
					this.match(PinescriptParser.COMMA);
					this.state = 1002;
					this.type_specification();
					}
					}
				}
				this.state = 1007;
				this._errHandler.sync(this);
				_alt = this._interp.adaptivePredict(this._input, 99, this._ctx);
			}
			this.state = 1009;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la===46) {
				{
				this.state = 1008;
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
		this.enterRule(localctx, 228, PinescriptParser.RULE_name);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 1011;
			_la = this._input.LA(1);
			if(!((((_la) & ~0x1F) === 0 && ((1 << _la) & 399901904) !== 0) || _la===64)) {
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
		this.enterRule(localctx, 230, PinescriptParser.RULE_name_load);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 1013;
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
		this.enterRule(localctx, 232, PinescriptParser.RULE_name_store);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 1015;
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
		this.enterRule(localctx, 234, PinescriptParser.RULE_comments);
		let _la: number;
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 1018;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 1017;
				this.comment();
				}
				}
				this.state = 1020;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while (_la===70);
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
		this.enterRule(localctx, 236, PinescriptParser.RULE_comment);
		try {
			this.enterOuterAlt(localctx, 1);
			{
			this.state = 1022;
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
		case 62:
			return this.bitwise_or_expression_sempred(localctx as Bitwise_or_expressionContext, predIndex);
		case 63:
			return this.bitwise_xor_expression_sempred(localctx as Bitwise_xor_expressionContext, predIndex);
		case 64:
			return this.bitwise_and_expression_sempred(localctx as Bitwise_and_expressionContext, predIndex);
		case 75:
			return this.shift_expression_sempred(localctx as Shift_expressionContext, predIndex);
		case 77:
			return this.additive_expression_sempred(localctx as Additive_expressionContext, predIndex);
		case 79:
			return this.multiplicative_expression_sempred(localctx as Multiplicative_expressionContext, predIndex);
		case 83:
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

	public static readonly _serializedATN: number[] = [4,1,72,1025,2,0,7,0,
	2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,2,5,7,5,2,6,7,6,2,7,7,7,2,8,7,8,2,9,7,9,
	2,10,7,10,2,11,7,11,2,12,7,12,2,13,7,13,2,14,7,14,2,15,7,15,2,16,7,16,2,
	17,7,17,2,18,7,18,2,19,7,19,2,20,7,20,2,21,7,21,2,22,7,22,2,23,7,23,2,24,
	7,24,2,25,7,25,2,26,7,26,2,27,7,27,2,28,7,28,2,29,7,29,2,30,7,30,2,31,7,
	31,2,32,7,32,2,33,7,33,2,34,7,34,2,35,7,35,2,36,7,36,2,37,7,37,2,38,7,38,
	2,39,7,39,2,40,7,40,2,41,7,41,2,42,7,42,2,43,7,43,2,44,7,44,2,45,7,45,2,
	46,7,46,2,47,7,47,2,48,7,48,2,49,7,49,2,50,7,50,2,51,7,51,2,52,7,52,2,53,
	7,53,2,54,7,54,2,55,7,55,2,56,7,56,2,57,7,57,2,58,7,58,2,59,7,59,2,60,7,
	60,2,61,7,61,2,62,7,62,2,63,7,63,2,64,7,64,2,65,7,65,2,66,7,66,2,67,7,67,
	2,68,7,68,2,69,7,69,2,70,7,70,2,71,7,71,2,72,7,72,2,73,7,73,2,74,7,74,2,
	75,7,75,2,76,7,76,2,77,7,77,2,78,7,78,2,79,7,79,2,80,7,80,2,81,7,81,2,82,
	7,82,2,83,7,83,2,84,7,84,2,85,7,85,2,86,7,86,2,87,7,87,2,88,7,88,2,89,7,
	89,2,90,7,90,2,91,7,91,2,92,7,92,2,93,7,93,2,94,7,94,2,95,7,95,2,96,7,96,
	2,97,7,97,2,98,7,98,2,99,7,99,2,100,7,100,2,101,7,101,2,102,7,102,2,103,
	7,103,2,104,7,104,2,105,7,105,2,106,7,106,2,107,7,107,2,108,7,108,2,109,
	7,109,2,110,7,110,2,111,7,111,2,112,7,112,2,113,7,113,2,114,7,114,2,115,
	7,115,2,116,7,116,2,117,7,117,2,118,7,118,1,0,1,0,1,1,3,1,242,8,1,1,1,1,
	1,1,2,1,2,3,2,248,8,2,1,2,1,2,1,3,3,3,253,8,3,1,3,1,3,1,4,4,4,258,8,4,11,
	4,12,4,259,1,5,1,5,1,5,3,5,265,8,5,1,6,1,6,1,6,1,6,1,6,1,6,3,6,273,8,6,
	1,7,1,7,1,7,5,7,278,8,7,10,7,12,7,281,9,7,1,7,3,7,284,8,7,1,7,1,7,1,8,1,
	8,1,8,5,8,291,8,8,10,8,12,8,294,9,8,1,8,1,8,1,8,1,9,1,9,1,9,1,9,1,9,3,9,
	304,8,9,1,10,1,10,1,10,3,10,309,8,10,1,11,1,11,3,11,313,8,11,1,12,3,12,
	316,8,12,1,12,1,12,1,12,1,12,1,13,1,13,1,13,1,13,1,14,1,14,1,14,1,14,1,
	15,1,15,1,15,1,15,1,16,3,16,335,8,16,1,16,1,16,1,16,1,16,3,16,341,8,16,
	1,16,1,16,1,16,1,16,1,16,3,16,348,8,16,1,16,1,16,1,16,3,16,353,8,16,1,16,
	1,16,1,16,1,16,3,16,359,8,16,1,17,1,17,1,17,5,17,364,8,17,10,17,12,17,367,
	9,17,1,17,3,17,370,8,17,1,18,1,18,1,18,1,18,3,18,376,8,18,1,18,1,18,1,18,
	3,18,381,8,18,3,18,383,8,18,1,19,3,19,386,8,19,1,19,1,19,1,19,1,19,1,19,
	3,19,393,8,19,1,19,1,19,1,19,1,19,1,19,3,19,400,8,19,1,19,1,19,1,19,1,19,
	3,19,406,8,19,1,19,1,19,1,19,1,19,3,19,412,8,19,1,20,1,20,1,20,5,20,417,
	8,20,10,20,12,20,420,9,20,1,20,3,20,423,8,20,1,21,1,21,1,21,1,21,3,21,429,
	8,21,1,22,3,22,432,8,22,1,22,1,22,1,22,1,22,1,22,1,22,1,22,1,23,4,23,442,
	8,23,11,23,12,23,443,1,24,3,24,447,8,24,1,24,1,24,1,24,1,24,3,24,453,8,
	24,1,24,1,24,1,25,3,25,458,8,25,1,25,1,25,1,25,1,25,1,25,1,25,1,25,1,26,
	4,26,468,8,26,11,26,12,26,469,1,27,1,27,1,27,3,27,475,8,27,1,27,1,27,1,
	28,1,28,1,28,1,28,3,28,483,8,28,1,29,1,29,3,29,487,8,29,1,30,1,30,1,31,
	1,31,1,32,1,32,1,32,1,32,3,32,497,8,32,1,33,1,33,1,33,1,33,1,33,3,33,504,
	8,33,1,34,1,34,3,34,508,8,34,1,35,1,35,1,35,1,36,1,36,3,36,515,8,36,1,37,
	1,37,1,37,1,37,1,37,1,37,1,37,1,37,3,37,525,8,37,1,37,1,37,1,38,1,38,1,
	38,1,38,1,38,1,38,1,39,1,39,1,39,1,39,1,39,3,39,540,8,39,1,40,1,40,1,40,
	1,40,1,41,1,41,3,41,548,8,41,1,41,1,41,1,41,1,41,1,41,1,42,1,42,3,42,557,
	8,42,1,42,1,42,1,43,1,43,3,43,563,8,43,1,44,4,44,566,8,44,11,44,12,44,567,
	1,45,1,45,1,45,1,45,1,46,1,46,1,46,5,46,577,8,46,10,46,12,46,580,9,46,1,
	47,1,47,1,47,1,48,1,48,3,48,587,8,48,1,49,4,49,590,8,49,11,49,12,49,591,
	1,49,1,49,1,49,1,49,1,50,1,50,1,51,1,51,1,51,3,51,603,8,51,1,52,1,52,3,
	52,607,8,52,1,53,3,53,610,8,53,1,53,1,53,1,53,1,53,1,54,1,54,1,54,1,54,
	1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,1,55,3,55,632,8,
	55,1,56,1,56,1,56,1,56,1,57,1,57,1,58,1,58,1,59,1,59,1,59,1,59,1,59,1,59,
	3,59,648,8,59,1,60,1,60,1,60,5,60,653,8,60,10,60,12,60,656,9,60,1,61,1,
	61,1,61,5,61,661,8,61,10,61,12,61,664,9,61,1,62,1,62,1,62,1,62,1,62,1,62,
	5,62,672,8,62,10,62,12,62,675,9,62,1,63,1,63,1,63,1,63,1,63,1,63,5,63,683,
	8,63,10,63,12,63,686,9,63,1,64,1,64,1,64,1,64,1,64,1,64,5,64,694,8,64,10,
	64,12,64,697,9,64,1,65,1,65,5,65,701,8,65,10,65,12,65,704,9,65,1,66,1,66,
	3,66,708,8,66,1,67,1,67,1,67,1,68,1,68,1,68,1,69,1,69,5,69,718,8,69,10,
	69,12,69,721,9,69,1,70,1,70,1,70,1,70,3,70,727,8,70,1,71,1,71,1,71,1,72,
	1,72,1,72,1,73,1,73,1,73,1,74,1,74,1,74,1,75,1,75,1,75,1,75,1,75,1,75,1,
	75,5,75,748,8,75,10,75,12,75,751,9,75,1,76,1,76,1,77,1,77,1,77,1,77,1,77,
	1,77,1,77,5,77,762,8,77,10,77,12,77,765,9,77,1,78,1,78,1,79,1,79,1,79,1,
	79,1,79,1,79,1,79,5,79,776,8,79,10,79,12,79,779,9,79,1,80,1,80,1,81,1,81,
	1,81,1,81,3,81,787,8,81,1,82,1,82,1,83,1,83,1,83,1,83,1,83,1,83,1,83,1,
	83,3,83,799,8,83,1,83,1,83,3,83,803,8,83,1,83,1,83,1,83,1,83,1,83,1,83,
	5,83,811,8,83,10,83,12,83,814,9,83,1,84,1,84,1,84,5,84,819,8,84,10,84,12,
	84,822,9,84,1,84,3,84,825,8,84,1,85,1,85,1,85,3,85,830,8,85,1,85,1,85,1,
	86,1,86,1,86,5,86,837,8,86,10,86,12,86,840,9,86,1,86,3,86,843,8,86,1,87,
	1,87,1,87,1,87,3,87,849,8,87,1,88,1,88,1,88,1,88,3,88,855,8,88,1,89,1,89,
	1,90,1,90,1,91,1,91,1,92,1,92,1,93,1,93,1,93,1,93,1,94,1,94,1,94,1,94,5,
	94,873,8,94,10,94,12,94,876,9,94,1,94,3,94,879,8,94,3,94,881,8,94,1,94,
	1,94,1,95,1,95,1,95,1,95,1,95,1,95,1,95,1,95,3,95,893,8,95,1,96,1,96,1,
	97,1,97,1,98,1,98,1,98,1,98,1,98,1,98,1,98,1,98,1,98,1,98,1,98,3,98,910,
	8,98,1,99,1,99,1,99,1,99,5,99,916,8,99,10,99,12,99,919,9,99,1,99,3,99,922,
	8,99,1,99,1,99,1,100,1,100,1,101,1,101,1,101,1,101,3,101,932,8,101,1,102,
	1,102,1,102,1,102,1,103,1,103,1,103,1,103,1,103,1,104,1,104,1,105,1,105,
	1,105,1,105,1,106,1,106,1,107,3,107,952,8,107,1,107,1,107,3,107,956,8,107,
	1,107,3,107,959,8,107,1,108,1,108,1,109,1,109,1,109,5,109,966,8,109,10,
	109,12,109,969,9,109,1,110,1,110,3,110,973,8,110,1,110,1,110,1,110,1,110,
	1,110,3,110,980,8,110,1,111,1,111,1,111,5,111,985,8,111,10,111,12,111,988,
	9,111,1,111,3,111,991,8,111,1,111,1,111,1,111,3,111,996,8,111,1,112,1,112,
	1,112,1,113,1,113,1,113,5,113,1004,8,113,10,113,12,113,1007,9,113,1,113,
	3,113,1010,8,113,1,114,1,114,1,115,1,115,1,116,1,116,1,117,4,117,1019,8,
	117,11,117,12,117,1020,1,118,1,118,1,118,0,7,124,126,128,150,154,158,166,
	119,0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,
	48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,
	96,98,100,102,104,106,108,110,112,114,116,118,120,122,124,126,128,130,132,
	134,136,138,140,142,144,146,148,150,152,154,156,158,160,162,164,166,168,
	170,172,174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,204,
	206,208,210,212,214,216,218,220,222,224,226,228,230,232,234,236,0,9,1,0,
	35,36,1,0,53,54,1,0,55,57,3,0,19,19,49,49,53,54,2,0,12,12,27,27,1,0,28,
	29,1,0,58,62,3,0,7,7,17,17,22,23,8,0,4,4,6,7,10,10,17,18,20,20,22,26,28,
	28,64,64,1032,0,238,1,0,0,0,2,241,1,0,0,0,4,245,1,0,0,0,6,252,1,0,0,0,8,
	257,1,0,0,0,10,264,1,0,0,0,12,272,1,0,0,0,14,274,1,0,0,0,16,287,1,0,0,0,
	18,303,1,0,0,0,20,308,1,0,0,0,22,312,1,0,0,0,24,315,1,0,0,0,26,321,1,0,
	0,0,28,325,1,0,0,0,30,329,1,0,0,0,32,358,1,0,0,0,34,360,1,0,0,0,36,382,
	1,0,0,0,38,411,1,0,0,0,40,413,1,0,0,0,42,428,1,0,0,0,44,431,1,0,0,0,46,
	441,1,0,0,0,48,446,1,0,0,0,50,457,1,0,0,0,52,467,1,0,0,0,54,471,1,0,0,0,
	56,482,1,0,0,0,58,486,1,0,0,0,60,488,1,0,0,0,62,490,1,0,0,0,64,492,1,0,
	0,0,66,498,1,0,0,0,68,507,1,0,0,0,70,509,1,0,0,0,72,514,1,0,0,0,74,516,
	1,0,0,0,76,528,1,0,0,0,78,539,1,0,0,0,80,541,1,0,0,0,82,545,1,0,0,0,84,
	554,1,0,0,0,86,562,1,0,0,0,88,565,1,0,0,0,90,569,1,0,0,0,92,573,1,0,0,0,
	94,581,1,0,0,0,96,586,1,0,0,0,98,589,1,0,0,0,100,597,1,0,0,0,102,602,1,
	0,0,0,104,606,1,0,0,0,106,609,1,0,0,0,108,615,1,0,0,0,110,631,1,0,0,0,112,
	633,1,0,0,0,114,637,1,0,0,0,116,639,1,0,0,0,118,641,1,0,0,0,120,649,1,0,
	0,0,122,657,1,0,0,0,124,665,1,0,0,0,126,676,1,0,0,0,128,687,1,0,0,0,130,
	698,1,0,0,0,132,707,1,0,0,0,134,709,1,0,0,0,136,712,1,0,0,0,138,715,1,0,
	0,0,140,726,1,0,0,0,142,728,1,0,0,0,144,731,1,0,0,0,146,734,1,0,0,0,148,
	737,1,0,0,0,150,740,1,0,0,0,152,752,1,0,0,0,154,754,1,0,0,0,156,766,1,0,
	0,0,158,768,1,0,0,0,160,780,1,0,0,0,162,786,1,0,0,0,164,788,1,0,0,0,166,
	790,1,0,0,0,168,815,1,0,0,0,170,829,1,0,0,0,172,833,1,0,0,0,174,848,1,0,
	0,0,176,854,1,0,0,0,178,856,1,0,0,0,180,858,1,0,0,0,182,860,1,0,0,0,184,
	862,1,0,0,0,186,864,1,0,0,0,188,868,1,0,0,0,190,884,1,0,0,0,192,894,1,0,
	0,0,194,896,1,0,0,0,196,909,1,0,0,0,198,911,1,0,0,0,200,925,1,0,0,0,202,
	931,1,0,0,0,204,933,1,0,0,0,206,937,1,0,0,0,208,942,1,0,0,0,210,944,1,0,
	0,0,212,948,1,0,0,0,214,951,1,0,0,0,216,960,1,0,0,0,218,962,1,0,0,0,220,
	979,1,0,0,0,222,986,1,0,0,0,224,997,1,0,0,0,226,1000,1,0,0,0,228,1011,1,
	0,0,0,230,1013,1,0,0,0,232,1015,1,0,0,0,234,1018,1,0,0,0,236,1022,1,0,0,
	0,238,239,3,2,1,0,239,1,1,0,0,0,240,242,3,8,4,0,241,240,1,0,0,0,241,242,
	1,0,0,0,242,243,1,0,0,0,243,244,5,0,0,1,244,3,1,0,0,0,245,247,3,114,57,
	0,246,248,5,68,0,0,247,246,1,0,0,0,247,248,1,0,0,0,248,249,1,0,0,0,249,
	250,5,0,0,1,250,5,1,0,0,0,251,253,3,234,117,0,252,251,1,0,0,0,252,253,1,
	0,0,0,253,254,1,0,0,0,254,255,5,0,0,1,255,7,1,0,0,0,256,258,3,10,5,0,257,
	256,1,0,0,0,258,259,1,0,0,0,259,257,1,0,0,0,259,260,1,0,0,0,260,9,1,0,0,
	0,261,265,3,12,6,0,262,265,3,14,7,0,263,265,3,16,8,0,264,261,1,0,0,0,264,
	262,1,0,0,0,264,263,1,0,0,0,265,11,1,0,0,0,266,273,3,20,10,0,267,273,3,
	44,22,0,268,273,3,50,25,0,269,273,3,60,30,0,270,273,3,38,19,0,271,273,3,
	32,16,0,272,266,1,0,0,0,272,267,1,0,0,0,272,268,1,0,0,0,272,269,1,0,0,0,
	272,270,1,0,0,0,272,271,1,0,0,0,273,13,1,0,0,0,274,279,3,18,9,0,275,276,
	5,46,0,0,276,278,3,18,9,0,277,275,1,0,0,0,278,281,1,0,0,0,279,277,1,0,0,
	0,279,280,1,0,0,0,280,283,1,0,0,0,281,279,1,0,0,0,282,284,5,46,0,0,283,
	282,1,0,0,0,283,284,1,0,0,0,284,285,1,0,0,0,285,286,5,68,0,0,286,15,1,0,
	0,0,287,292,3,18,9,0,288,289,5,46,0,0,289,291,3,18,9,0,290,288,1,0,0,0,
	291,294,1,0,0,0,292,290,1,0,0,0,292,293,1,0,0,0,293,295,1,0,0,0,294,292,
	1,0,0,0,295,296,5,46,0,0,296,297,3,58,29,0,297,17,1,0,0,0,298,304,3,102,
	51,0,299,304,3,116,58,0,300,304,3,190,95,0,301,304,3,192,96,0,302,304,3,
	194,97,0,303,298,1,0,0,0,303,299,1,0,0,0,303,300,1,0,0,0,303,301,1,0,0,
	0,303,302,1,0,0,0,304,19,1,0,0,0,305,309,3,22,11,0,306,309,3,28,14,0,307,
	309,3,30,15,0,308,305,1,0,0,0,308,306,1,0,0,0,308,307,1,0,0,0,309,21,1,
	0,0,0,310,313,3,24,12,0,311,313,3,26,13,0,312,310,1,0,0,0,312,311,1,0,0,
	0,313,23,1,0,0,0,314,316,5,11,0,0,315,314,1,0,0,0,315,316,1,0,0,0,316,317,
	1,0,0,0,317,318,3,196,98,0,318,319,5,43,0,0,319,320,3,62,31,0,320,25,1,
	0,0,0,321,322,3,198,99,0,322,323,5,43,0,0,323,324,3,62,31,0,324,27,1,0,
	0,0,325,326,3,166,83,0,326,327,5,63,0,0,327,328,3,62,31,0,328,29,1,0,0,
	0,329,330,3,166,83,0,330,331,3,212,106,0,331,332,3,62,31,0,332,31,1,0,0,
	0,333,335,5,11,0,0,334,333,1,0,0,0,334,335,1,0,0,0,335,336,1,0,0,0,336,
	337,3,214,107,0,337,338,3,228,114,0,338,340,5,31,0,0,339,341,3,34,17,0,
	340,339,1,0,0,0,340,341,1,0,0,0,341,342,1,0,0,0,342,343,5,32,0,0,343,344,
	5,44,0,0,344,345,3,96,48,0,345,359,1,0,0,0,346,348,5,11,0,0,347,346,1,0,
	0,0,347,348,1,0,0,0,348,349,1,0,0,0,349,350,3,228,114,0,350,352,5,31,0,
	0,351,353,3,34,17,0,352,351,1,0,0,0,352,353,1,0,0,0,353,354,1,0,0,0,354,
	355,5,32,0,0,355,356,5,44,0,0,356,357,3,96,48,0,357,359,1,0,0,0,358,334,
	1,0,0,0,358,347,1,0,0,0,359,33,1,0,0,0,360,365,3,36,18,0,361,362,5,46,0,
	0,362,364,3,36,18,0,363,361,1,0,0,0,364,367,1,0,0,0,365,363,1,0,0,0,365,
	366,1,0,0,0,366,369,1,0,0,0,367,365,1,0,0,0,368,370,5,46,0,0,369,368,1,
	0,0,0,369,370,1,0,0,0,370,35,1,0,0,0,371,372,3,214,107,0,372,375,3,232,
	116,0,373,374,5,43,0,0,374,376,3,114,57,0,375,373,1,0,0,0,375,376,1,0,0,
	0,376,383,1,0,0,0,377,380,3,232,116,0,378,379,5,43,0,0,379,381,3,114,57,
	0,380,378,1,0,0,0,380,381,1,0,0,0,381,383,1,0,0,0,382,371,1,0,0,0,382,377,
	1,0,0,0,383,37,1,0,0,0,384,386,5,11,0,0,385,384,1,0,0,0,385,386,1,0,0,0,
	386,387,1,0,0,0,387,388,5,18,0,0,388,389,3,214,107,0,389,390,3,228,114,
	0,390,392,5,31,0,0,391,393,3,40,20,0,392,391,1,0,0,0,392,393,1,0,0,0,393,
	394,1,0,0,0,394,395,5,32,0,0,395,396,5,44,0,0,396,397,3,96,48,0,397,412,
	1,0,0,0,398,400,5,11,0,0,399,398,1,0,0,0,399,400,1,0,0,0,400,401,1,0,0,
	0,401,402,5,18,0,0,402,403,3,228,114,0,403,405,5,31,0,0,404,406,3,40,20,
	0,405,404,1,0,0,0,405,406,1,0,0,0,406,407,1,0,0,0,407,408,5,32,0,0,408,
	409,5,44,0,0,409,410,3,96,48,0,410,412,1,0,0,0,411,385,1,0,0,0,411,399,
	1,0,0,0,412,39,1,0,0,0,413,418,3,42,21,0,414,415,5,46,0,0,415,417,3,42,
	21,0,416,414,1,0,0,0,417,420,1,0,0,0,418,416,1,0,0,0,418,419,1,0,0,0,419,
	422,1,0,0,0,420,418,1,0,0,0,421,423,5,46,0,0,422,421,1,0,0,0,422,423,1,
	0,0,0,423,41,1,0,0,0,424,425,3,214,107,0,425,426,3,232,116,0,426,429,1,
	0,0,0,427,429,3,36,18,0,428,424,1,0,0,0,428,427,1,0,0,0,429,43,1,0,0,0,
	430,432,5,11,0,0,431,430,1,0,0,0,431,432,1,0,0,0,432,433,1,0,0,0,433,434,
	5,26,0,0,434,435,3,228,114,0,435,436,5,68,0,0,436,437,5,1,0,0,437,438,3,
	46,23,0,438,439,5,2,0,0,439,45,1,0,0,0,440,442,3,48,24,0,441,440,1,0,0,
	0,442,443,1,0,0,0,443,441,1,0,0,0,443,444,1,0,0,0,444,47,1,0,0,0,445,447,
	5,29,0,0,446,445,1,0,0,0,446,447,1,0,0,0,447,448,1,0,0,0,448,449,3,214,
	107,0,449,452,3,232,116,0,450,451,5,43,0,0,451,453,3,114,57,0,452,450,1,
	0,0,0,452,453,1,0,0,0,453,454,1,0,0,0,454,455,5,68,0,0,455,49,1,0,0,0,456,
	458,5,11,0,0,457,456,1,0,0,0,457,458,1,0,0,0,458,459,1,0,0,0,459,460,5,
	10,0,0,460,461,3,228,114,0,461,462,5,68,0,0,462,463,5,1,0,0,463,464,3,52,
	26,0,464,465,5,2,0,0,465,51,1,0,0,0,466,468,3,54,27,0,467,466,1,0,0,0,468,
	469,1,0,0,0,469,467,1,0,0,0,469,470,1,0,0,0,470,53,1,0,0,0,471,474,3,232,
	116,0,472,473,5,43,0,0,473,475,3,114,57,0,474,472,1,0,0,0,474,475,1,0,0,
	0,475,476,1,0,0,0,476,477,5,68,0,0,477,55,1,0,0,0,478,483,3,64,32,0,479,
	483,3,72,36,0,480,483,3,80,40,0,481,483,3,82,41,0,482,478,1,0,0,0,482,479,
	1,0,0,0,482,480,1,0,0,0,482,481,1,0,0,0,483,57,1,0,0,0,484,487,3,56,28,
	0,485,487,3,84,42,0,486,484,1,0,0,0,486,485,1,0,0,0,487,59,1,0,0,0,488,
	489,3,58,29,0,489,61,1,0,0,0,490,491,3,56,28,0,491,63,1,0,0,0,492,493,5,
	14,0,0,493,494,3,114,57,0,494,496,3,96,48,0,495,497,3,68,34,0,496,495,1,
	0,0,0,496,497,1,0,0,0,497,65,1,0,0,0,498,499,5,9,0,0,499,500,5,14,0,0,500,
	501,3,114,57,0,501,503,3,96,48,0,502,504,3,68,34,0,503,502,1,0,0,0,503,
	504,1,0,0,0,504,67,1,0,0,0,505,508,3,66,33,0,506,508,3,70,35,0,507,505,
	1,0,0,0,507,506,1,0,0,0,508,69,1,0,0,0,509,510,5,9,0,0,510,511,3,96,48,
	0,511,71,1,0,0,0,512,515,3,74,37,0,513,515,3,76,38,0,514,512,1,0,0,0,514,
	513,1,0,0,0,515,73,1,0,0,0,516,517,5,13,0,0,517,518,3,78,39,0,518,519,5,
	43,0,0,519,520,3,114,57,0,520,521,5,25,0,0,521,524,3,114,57,0,522,523,5,
	6,0,0,523,525,3,114,57,0,524,522,1,0,0,0,524,525,1,0,0,0,525,526,1,0,0,
	0,526,527,3,96,48,0,527,75,1,0,0,0,528,529,5,13,0,0,529,530,3,78,39,0,530,
	531,5,16,0,0,531,532,3,114,57,0,532,533,3,96,48,0,533,77,1,0,0,0,534,535,
	3,214,107,0,535,536,3,232,116,0,536,540,1,0,0,0,537,540,3,232,116,0,538,
	540,3,198,99,0,539,534,1,0,0,0,539,537,1,0,0,0,539,538,1,0,0,0,540,79,1,
	0,0,0,541,542,5,30,0,0,542,543,3,114,57,0,543,544,3,96,48,0,544,81,1,0,
	0,0,545,547,5,24,0,0,546,548,3,114,57,0,547,546,1,0,0,0,547,548,1,0,0,0,
	548,549,1,0,0,0,549,550,5,68,0,0,550,551,5,1,0,0,551,552,3,88,44,0,552,
	553,5,2,0,0,553,83,1,0,0,0,554,556,5,20,0,0,555,557,3,114,57,0,556,555,
	1,0,0,0,556,557,1,0,0,0,557,558,1,0,0,0,558,559,3,96,48,0,559,85,1,0,0,
	0,560,563,3,90,45,0,561,563,3,94,47,0,562,560,1,0,0,0,562,561,1,0,0,0,563,
	87,1,0,0,0,564,566,3,86,43,0,565,564,1,0,0,0,566,567,1,0,0,0,567,565,1,
	0,0,0,567,568,1,0,0,0,568,89,1,0,0,0,569,570,3,92,46,0,570,571,5,44,0,0,
	571,572,3,96,48,0,572,91,1,0,0,0,573,578,3,114,57,0,574,575,5,46,0,0,575,
	577,3,114,57,0,576,574,1,0,0,0,577,580,1,0,0,0,578,576,1,0,0,0,578,579,
	1,0,0,0,579,93,1,0,0,0,580,578,1,0,0,0,581,582,5,44,0,0,582,583,3,96,48,
	0,583,95,1,0,0,0,584,587,3,98,49,0,585,587,3,100,50,0,586,584,1,0,0,0,586,
	585,1,0,0,0,587,97,1,0,0,0,588,590,5,68,0,0,589,588,1,0,0,0,590,591,1,0,
	0,0,591,589,1,0,0,0,591,592,1,0,0,0,592,593,1,0,0,0,593,594,5,1,0,0,594,
	595,3,8,4,0,595,596,5,2,0,0,596,99,1,0,0,0,597,598,3,10,5,0,598,101,1,0,
	0,0,599,603,3,104,52,0,600,603,3,110,55,0,601,603,3,112,56,0,602,599,1,
	0,0,0,602,600,1,0,0,0,602,601,1,0,0,0,603,103,1,0,0,0,604,607,3,106,53,
	0,605,607,3,108,54,0,606,604,1,0,0,0,606,605,1,0,0,0,607,105,1,0,0,0,608,
	610,5,11,0,0,609,608,1,0,0,0,609,610,1,0,0,0,610,611,1,0,0,0,611,612,3,
	196,98,0,612,613,5,43,0,0,613,614,3,114,57,0,614,107,1,0,0,0,615,616,3,
	198,99,0,616,617,5,43,0,0,617,618,3,114,57,0,618,109,1,0,0,0,619,620,3,
	204,102,0,620,621,5,43,0,0,621,622,3,114,57,0,622,632,1,0,0,0,623,624,3,
	206,103,0,624,625,5,43,0,0,625,626,3,114,57,0,626,632,1,0,0,0,627,628,3,
	166,83,0,628,629,5,63,0,0,629,630,3,114,57,0,630,632,1,0,0,0,631,619,1,
	0,0,0,631,623,1,0,0,0,631,627,1,0,0,0,632,111,1,0,0,0,633,634,3,166,83,
	0,634,635,3,212,106,0,635,636,3,114,57,0,636,113,1,0,0,0,637,638,3,118,
	59,0,638,115,1,0,0,0,639,640,3,114,57,0,640,117,1,0,0,0,641,647,3,120,60,
	0,642,643,5,48,0,0,643,644,3,114,57,0,644,645,5,47,0,0,645,646,3,114,57,
	0,646,648,1,0,0,0,647,642,1,0,0,0,647,648,1,0,0,0,648,119,1,0,0,0,649,654,
	3,122,61,0,650,651,5,21,0,0,651,653,3,122,61,0,652,650,1,0,0,0,653,656,
	1,0,0,0,654,652,1,0,0,0,654,655,1,0,0,0,655,121,1,0,0,0,656,654,1,0,0,0,
	657,662,3,124,62,0,658,659,5,3,0,0,659,661,3,124,62,0,660,658,1,0,0,0,661,
	664,1,0,0,0,662,660,1,0,0,0,662,663,1,0,0,0,663,123,1,0,0,0,664,662,1,0,
	0,0,665,666,6,62,-1,0,666,667,3,126,63,0,667,673,1,0,0,0,668,669,10,2,0,
	0,669,670,5,51,0,0,670,672,3,126,63,0,671,668,1,0,0,0,672,675,1,0,0,0,673,
	671,1,0,0,0,673,674,1,0,0,0,674,125,1,0,0,0,675,673,1,0,0,0,676,677,6,63,
	-1,0,677,678,3,128,64,0,678,684,1,0,0,0,679,680,10,2,0,0,680,681,5,52,0,
	0,681,683,3,128,64,0,682,679,1,0,0,0,683,686,1,0,0,0,684,682,1,0,0,0,684,
	685,1,0,0,0,685,127,1,0,0,0,686,684,1,0,0,0,687,688,6,64,-1,0,688,689,3,
	130,65,0,689,695,1,0,0,0,690,691,10,2,0,0,691,692,5,50,0,0,692,694,3,130,
	65,0,693,690,1,0,0,0,694,697,1,0,0,0,695,693,1,0,0,0,695,696,1,0,0,0,696,
	129,1,0,0,0,697,695,1,0,0,0,698,702,3,138,69,0,699,701,3,132,66,0,700,699,
	1,0,0,0,701,704,1,0,0,0,702,700,1,0,0,0,702,703,1,0,0,0,703,131,1,0,0,0,
	704,702,1,0,0,0,705,708,3,134,67,0,706,708,3,136,68,0,707,705,1,0,0,0,707,
	706,1,0,0,0,708,133,1,0,0,0,709,710,5,39,0,0,710,711,3,138,69,0,711,135,
	1,0,0,0,712,713,5,40,0,0,713,714,3,138,69,0,714,137,1,0,0,0,715,719,3,150,
	75,0,716,718,3,140,70,0,717,716,1,0,0,0,718,721,1,0,0,0,719,717,1,0,0,0,
	719,720,1,0,0,0,720,139,1,0,0,0,721,719,1,0,0,0,722,727,3,142,71,0,723,
	727,3,144,72,0,724,727,3,146,73,0,725,727,3,148,74,0,726,722,1,0,0,0,726,
	723,1,0,0,0,726,724,1,0,0,0,726,725,1,0,0,0,727,141,1,0,0,0,728,729,5,37,
	0,0,729,730,3,150,75,0,730,143,1,0,0,0,731,732,5,41,0,0,732,733,3,150,75,
	0,733,145,1,0,0,0,734,735,5,38,0,0,735,736,3,150,75,0,736,147,1,0,0,0,737,
	738,5,42,0,0,738,739,3,150,75,0,739,149,1,0,0,0,740,741,6,75,-1,0,741,742,
	3,154,77,0,742,749,1,0,0,0,743,744,10,2,0,0,744,745,3,152,76,0,745,746,
	3,154,77,0,746,748,1,0,0,0,747,743,1,0,0,0,748,751,1,0,0,0,749,747,1,0,
	0,0,749,750,1,0,0,0,750,151,1,0,0,0,751,749,1,0,0,0,752,753,7,0,0,0,753,
	153,1,0,0,0,754,755,6,77,-1,0,755,756,3,158,79,0,756,763,1,0,0,0,757,758,
	10,2,0,0,758,759,3,156,78,0,759,760,3,158,79,0,760,762,1,0,0,0,761,757,
	1,0,0,0,762,765,1,0,0,0,763,761,1,0,0,0,763,764,1,0,0,0,764,155,1,0,0,0,
	765,763,1,0,0,0,766,767,7,1,0,0,767,157,1,0,0,0,768,769,6,79,-1,0,769,770,
	3,162,81,0,770,777,1,0,0,0,771,772,10,2,0,0,772,773,3,160,80,0,773,774,
	3,162,81,0,774,776,1,0,0,0,775,771,1,0,0,0,776,779,1,0,0,0,777,775,1,0,
	0,0,777,778,1,0,0,0,778,159,1,0,0,0,779,777,1,0,0,0,780,781,7,2,0,0,781,
	161,1,0,0,0,782,783,3,164,82,0,783,784,3,162,81,0,784,787,1,0,0,0,785,787,
	3,166,83,0,786,782,1,0,0,0,786,785,1,0,0,0,787,163,1,0,0,0,788,789,7,3,
	0,0,789,165,1,0,0,0,790,791,6,83,-1,0,791,792,3,174,87,0,792,812,1,0,0,
	0,793,794,10,4,0,0,794,795,5,45,0,0,795,811,3,230,115,0,796,798,10,3,0,
	0,797,799,3,220,110,0,798,797,1,0,0,0,798,799,1,0,0,0,799,800,1,0,0,0,800,
	802,5,31,0,0,801,803,3,168,84,0,802,801,1,0,0,0,802,803,1,0,0,0,803,804,
	1,0,0,0,804,811,5,32,0,0,805,806,10,2,0,0,806,807,5,33,0,0,807,808,3,172,
	86,0,808,809,5,34,0,0,809,811,1,0,0,0,810,793,1,0,0,0,810,796,1,0,0,0,810,
	805,1,0,0,0,811,814,1,0,0,0,812,810,1,0,0,0,812,813,1,0,0,0,813,167,1,0,
	0,0,814,812,1,0,0,0,815,820,3,170,85,0,816,817,5,46,0,0,817,819,3,170,85,
	0,818,816,1,0,0,0,819,822,1,0,0,0,820,818,1,0,0,0,820,821,1,0,0,0,821,824,
	1,0,0,0,822,820,1,0,0,0,823,825,5,46,0,0,824,823,1,0,0,0,824,825,1,0,0,
	0,825,169,1,0,0,0,826,827,3,232,116,0,827,828,5,43,0,0,828,830,1,0,0,0,
	829,826,1,0,0,0,829,830,1,0,0,0,830,831,1,0,0,0,831,832,3,114,57,0,832,
	171,1,0,0,0,833,838,3,114,57,0,834,835,5,46,0,0,835,837,3,114,57,0,836,
	834,1,0,0,0,837,840,1,0,0,0,838,836,1,0,0,0,838,839,1,0,0,0,839,842,1,0,
	0,0,840,838,1,0,0,0,841,843,5,46,0,0,842,841,1,0,0,0,842,843,1,0,0,0,843,
	173,1,0,0,0,844,849,3,230,115,0,845,849,3,176,88,0,846,849,3,186,93,0,847,
	849,3,188,94,0,848,844,1,0,0,0,848,845,1,0,0,0,848,846,1,0,0,0,848,847,
	1,0,0,0,849,175,1,0,0,0,850,855,3,178,89,0,851,855,3,180,90,0,852,855,3,
	182,91,0,853,855,3,184,92,0,854,850,1,0,0,0,854,851,1,0,0,0,854,852,1,0,
	0,0,854,853,1,0,0,0,855,177,1,0,0,0,856,857,5,65,0,0,857,179,1,0,0,0,858,
	859,5,66,0,0,859,181,1,0,0,0,860,861,7,4,0,0,861,183,1,0,0,0,862,863,5,
	67,0,0,863,185,1,0,0,0,864,865,5,31,0,0,865,866,3,114,57,0,866,867,5,32,
	0,0,867,187,1,0,0,0,868,880,5,33,0,0,869,874,3,114,57,0,870,871,5,46,0,
	0,871,873,3,114,57,0,872,870,1,0,0,0,873,876,1,0,0,0,874,872,1,0,0,0,874,
	875,1,0,0,0,875,878,1,0,0,0,876,874,1,0,0,0,877,879,5,46,0,0,878,877,1,
	0,0,0,878,879,1,0,0,0,879,881,1,0,0,0,880,869,1,0,0,0,880,881,1,0,0,0,881,
	882,1,0,0,0,882,883,5,34,0,0,883,189,1,0,0,0,884,885,5,15,0,0,885,886,3,
	228,114,0,886,887,5,56,0,0,887,888,3,228,114,0,888,889,5,56,0,0,889,892,
	3,178,89,0,890,891,5,4,0,0,891,893,3,228,114,0,892,890,1,0,0,0,892,893,
	1,0,0,0,893,191,1,0,0,0,894,895,5,5,0,0,895,193,1,0,0,0,896,897,5,8,0,0,
	897,195,1,0,0,0,898,899,3,200,100,0,899,900,3,214,107,0,900,901,3,232,116,
	0,901,910,1,0,0,0,902,903,3,200,100,0,903,904,3,232,116,0,904,910,1,0,0,
	0,905,906,3,214,107,0,906,907,3,232,116,0,907,910,1,0,0,0,908,910,3,232,
	116,0,909,898,1,0,0,0,909,902,1,0,0,0,909,905,1,0,0,0,909,908,1,0,0,0,910,
	197,1,0,0,0,911,912,5,33,0,0,912,917,3,232,116,0,913,914,5,46,0,0,914,916,
	3,232,116,0,915,913,1,0,0,0,916,919,1,0,0,0,917,915,1,0,0,0,917,918,1,0,
	0,0,918,921,1,0,0,0,919,917,1,0,0,0,920,922,5,46,0,0,921,920,1,0,0,0,921,
	922,1,0,0,0,922,923,1,0,0,0,923,924,5,34,0,0,924,199,1,0,0,0,925,926,7,
	5,0,0,926,201,1,0,0,0,927,932,3,204,102,0,928,932,3,206,103,0,929,932,3,
	208,104,0,930,932,3,210,105,0,931,927,1,0,0,0,931,928,1,0,0,0,931,929,1,
	0,0,0,931,930,1,0,0,0,932,203,1,0,0,0,933,934,3,166,83,0,934,935,5,45,0,
	0,935,936,3,232,116,0,936,205,1,0,0,0,937,938,3,166,83,0,938,939,5,33,0,
	0,939,940,3,172,86,0,940,941,5,34,0,0,941,207,1,0,0,0,942,943,3,232,116,
	0,943,209,1,0,0,0,944,945,5,31,0,0,945,946,3,202,101,0,946,947,5,32,0,0,
	947,211,1,0,0,0,948,949,7,6,0,0,949,213,1,0,0,0,950,952,3,216,108,0,951,
	950,1,0,0,0,951,952,1,0,0,0,952,953,1,0,0,0,953,955,3,218,109,0,954,956,
	3,220,110,0,955,954,1,0,0,0,955,956,1,0,0,0,956,958,1,0,0,0,957,959,3,224,
	112,0,958,957,1,0,0,0,958,959,1,0,0,0,959,215,1,0,0,0,960,961,7,7,0,0,961,
	217,1,0,0,0,962,967,3,230,115,0,963,964,5,45,0,0,964,966,3,230,115,0,965,
	963,1,0,0,0,966,969,1,0,0,0,967,965,1,0,0,0,967,968,1,0,0,0,968,219,1,0,
	0,0,969,967,1,0,0,0,970,972,5,41,0,0,971,973,3,226,113,0,972,971,1,0,0,
	0,972,973,1,0,0,0,973,974,1,0,0,0,974,980,5,42,0,0,975,976,5,41,0,0,976,
	977,3,222,111,0,977,978,5,36,0,0,978,980,1,0,0,0,979,970,1,0,0,0,979,975,
	1,0,0,0,980,221,1,0,0,0,981,982,3,214,107,0,982,983,5,46,0,0,983,985,1,
	0,0,0,984,981,1,0,0,0,985,988,1,0,0,0,986,984,1,0,0,0,986,987,1,0,0,0,987,
	990,1,0,0,0,988,986,1,0,0,0,989,991,3,216,108,0,990,989,1,0,0,0,990,991,
	1,0,0,0,991,992,1,0,0,0,992,993,3,218,109,0,993,995,5,41,0,0,994,996,3,
	226,113,0,995,994,1,0,0,0,995,996,1,0,0,0,996,223,1,0,0,0,997,998,5,33,
	0,0,998,999,5,34,0,0,999,225,1,0,0,0,1000,1005,3,214,107,0,1001,1002,5,
	46,0,0,1002,1004,3,214,107,0,1003,1001,1,0,0,0,1004,1007,1,0,0,0,1005,1003,
	1,0,0,0,1005,1006,1,0,0,0,1006,1009,1,0,0,0,1007,1005,1,0,0,0,1008,1010,
	5,46,0,0,1009,1008,1,0,0,0,1009,1010,1,0,0,0,1010,227,1,0,0,0,1011,1012,
	7,8,0,0,1012,229,1,0,0,0,1013,1014,3,228,114,0,1014,231,1,0,0,0,1015,1016,
	3,228,114,0,1016,233,1,0,0,0,1017,1019,3,236,118,0,1018,1017,1,0,0,0,1019,
	1020,1,0,0,0,1020,1018,1,0,0,0,1020,1021,1,0,0,0,1021,235,1,0,0,0,1022,
	1023,5,70,0,0,1023,237,1,0,0,0,102,241,247,252,259,264,272,279,283,292,
	303,308,312,315,334,340,347,352,358,365,369,375,380,382,385,392,399,405,
	411,418,422,428,431,443,446,452,457,469,474,482,486,496,503,507,514,524,
	539,547,556,562,567,578,586,591,602,606,609,631,647,654,662,673,684,695,
	702,707,719,726,749,763,777,786,798,802,810,812,820,824,829,838,842,848,
	854,874,878,880,892,909,917,921,931,951,955,958,967,972,979,986,990,995,
	1005,1009,1020];

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


export class Value_structureContext extends ParserRuleContext {
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
    	return PinescriptParser.RULE_value_structure;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitValue_structure) {
			return visitor.visitValue_structure(this);
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
	public value_structure(): Value_structureContext {
		return this.getTypedRuleContext(Value_structureContext, 0) as Value_structureContext;
	}
	public once_structure(): Once_structureContext {
		return this.getTypedRuleContext(Once_structureContext, 0) as Once_structureContext;
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
	public value_structure(): Value_structureContext {
		return this.getTypedRuleContext(Value_structureContext, 0) as Value_structureContext;
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


export class Once_structureContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public ONCE(): TerminalNode {
		return this.getToken(PinescriptParser.ONCE, 0);
	}
	public local_block(): Local_blockContext {
		return this.getTypedRuleContext(Local_blockContext, 0) as Local_blockContext;
	}
	public expression(): ExpressionContext {
		return this.getTypedRuleContext(ExpressionContext, 0) as ExpressionContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_once_structure;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitOnce_structure) {
			return visitor.visitOnce_structure(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Switch_caseContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public switch_pattern_case(): Switch_pattern_caseContext {
		return this.getTypedRuleContext(Switch_pattern_caseContext, 0) as Switch_pattern_caseContext;
	}
	public switch_default_case(): Switch_default_caseContext {
		return this.getTypedRuleContext(Switch_default_caseContext, 0) as Switch_default_caseContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_switch_case;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSwitch_case) {
			return visitor.visitSwitch_case(this);
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
	public switch_case_list(): Switch_caseContext[] {
		return this.getTypedRuleContexts(Switch_caseContext) as Switch_caseContext[];
	}
	public switch_case(i: number): Switch_caseContext {
		return this.getTypedRuleContext(Switch_caseContext, i) as Switch_caseContext;
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
	public switch_patterns(): Switch_patternsContext {
		return this.getTypedRuleContext(Switch_patternsContext, 0) as Switch_patternsContext;
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


export class Switch_patternsContext extends ParserRuleContext {
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
    	return PinescriptParser.RULE_switch_patterns;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitSwitch_patterns) {
			return visitor.visitSwitch_patterns(this);
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
	public INDENT(): TerminalNode {
		return this.getToken(PinescriptParser.INDENT, 0);
	}
	public statements(): StatementsContext {
		return this.getTypedRuleContext(StatementsContext, 0) as StatementsContext;
	}
	public DEDENT(): TerminalNode {
		return this.getToken(PinescriptParser.DEDENT, 0);
	}
	public NEWLINE_list(): TerminalNode[] {
	    	return this.getTokens(PinescriptParser.NEWLINE);
	}
	public NEWLINE(i: number): TerminalNode {
		return this.getToken(PinescriptParser.NEWLINE, i);
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
	public declaration_mode(): Declaration_modeContext {
		return this.getTypedRuleContext(Declaration_modeContext, 0) as Declaration_modeContext;
	}
	public type_specification(): Type_specificationContext {
		return this.getTypedRuleContext(Type_specificationContext, 0) as Type_specificationContext;
	}
	public name_store(): Name_storeContext {
		return this.getTypedRuleContext(Name_storeContext, 0) as Name_storeContext;
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
	public rshift_closed_type_args(): Rshift_closed_type_argsContext {
		return this.getTypedRuleContext(Rshift_closed_type_argsContext, 0) as Rshift_closed_type_argsContext;
	}
	public RSHIFT(): TerminalNode {
		return this.getToken(PinescriptParser.RSHIFT, 0);
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


export class Rshift_closed_type_argsContext extends ParserRuleContext {
	constructor(parser?: PinescriptParser, parent?: ParserRuleContext, invokingState?: number) {
		super(parent, invokingState);
    	this.parser = parser;
	}
	public attributed_type_name(): Attributed_type_nameContext {
		return this.getTypedRuleContext(Attributed_type_nameContext, 0) as Attributed_type_nameContext;
	}
	public LESS(): TerminalNode {
		return this.getToken(PinescriptParser.LESS, 0);
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
	public type_qualifier(): Type_qualifierContext {
		return this.getTypedRuleContext(Type_qualifierContext, 0) as Type_qualifierContext;
	}
	public type_argument_list(): Type_argument_listContext {
		return this.getTypedRuleContext(Type_argument_listContext, 0) as Type_argument_listContext;
	}
    public get ruleIndex(): number {
    	return PinescriptParser.RULE_rshift_closed_type_args;
	}
	// @Override
	public accept<Result>(visitor: PinescriptParserVisitor<Result>): Result {
		if (visitor.visitRshift_closed_type_args) {
			return visitor.visitRshift_closed_type_args(this);
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
	public VAR(): TerminalNode {
		return this.getToken(PinescriptParser.VAR, 0);
	}
	public SWITCH(): TerminalNode {
		return this.getToken(PinescriptParser.SWITCH, 0);
	}
	public ONCE(): TerminalNode {
		return this.getToken(PinescriptParser.ONCE, 0);
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

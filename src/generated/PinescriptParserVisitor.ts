// Generated from /mnt/data/home/jango/Git/pynescript/src/pynescript/ast/grammar/antlr4/resource/PinescriptParser.g4 by ANTLR 4.13.2

import {ParseTreeVisitor} from 'antlr4';


import { StartContext } from "./PinescriptParser.ts";
import { Start_scriptContext } from "./PinescriptParser.ts";
import { Start_expressionContext } from "./PinescriptParser.ts";
import { Start_commentsContext } from "./PinescriptParser.ts";
import { StatementsContext } from "./PinescriptParser.ts";
import { StatementContext } from "./PinescriptParser.ts";
import { Compound_statementContext } from "./PinescriptParser.ts";
import { Simple_statementsContext } from "./PinescriptParser.ts";
import { Trailing_structure_statementsContext } from "./PinescriptParser.ts";
import { Simple_statementContext } from "./PinescriptParser.ts";
import { Compound_assignmentContext } from "./PinescriptParser.ts";
import { Compound_variable_initializationContext } from "./PinescriptParser.ts";
import { Compound_name_initializationContext } from "./PinescriptParser.ts";
import { Compound_tuple_initializationContext } from "./PinescriptParser.ts";
import { Compound_reassignmentContext } from "./PinescriptParser.ts";
import { Compound_augassignmentContext } from "./PinescriptParser.ts";
import { Function_declarationContext } from "./PinescriptParser.ts";
import { Parameter_listContext } from "./PinescriptParser.ts";
import { Parameter_definitionContext } from "./PinescriptParser.ts";
import { Method_declarationContext } from "./PinescriptParser.ts";
import { Method_parameter_listContext } from "./PinescriptParser.ts";
import { Method_parameter_definitionContext } from "./PinescriptParser.ts";
import { Type_declarationContext } from "./PinescriptParser.ts";
import { Field_definitionsContext } from "./PinescriptParser.ts";
import { Field_definitionContext } from "./PinescriptParser.ts";
import { Enum_declarationContext } from "./PinescriptParser.ts";
import { Enum_definitionsContext } from "./PinescriptParser.ts";
import { Enum_definitionContext } from "./PinescriptParser.ts";
import { StructureContext } from "./PinescriptParser.ts";
import { Structure_statementContext } from "./PinescriptParser.ts";
import { Structure_expressionContext } from "./PinescriptParser.ts";
import { If_structureContext } from "./PinescriptParser.ts";
import { Elif_structureContext } from "./PinescriptParser.ts";
import { If_tailContext } from "./PinescriptParser.ts";
import { Else_blockContext } from "./PinescriptParser.ts";
import { For_structureContext } from "./PinescriptParser.ts";
import { For_structure_toContext } from "./PinescriptParser.ts";
import { For_structure_inContext } from "./PinescriptParser.ts";
import { For_iteratorContext } from "./PinescriptParser.ts";
import { While_structureContext } from "./PinescriptParser.ts";
import { Switch_structureContext } from "./PinescriptParser.ts";
import { Switch_casesContext } from "./PinescriptParser.ts";
import { Switch_pattern_caseContext } from "./PinescriptParser.ts";
import { Switch_default_caseContext } from "./PinescriptParser.ts";
import { Local_blockContext } from "./PinescriptParser.ts";
import { Indented_local_blockContext } from "./PinescriptParser.ts";
import { Inline_local_blockContext } from "./PinescriptParser.ts";
import { Simple_assignmentContext } from "./PinescriptParser.ts";
import { Simple_variable_initializationContext } from "./PinescriptParser.ts";
import { Simple_name_initializationContext } from "./PinescriptParser.ts";
import { Simple_tuple_initializationContext } from "./PinescriptParser.ts";
import { Simple_reassignmentContext } from "./PinescriptParser.ts";
import { Simple_augassignmentContext } from "./PinescriptParser.ts";
import { ExpressionContext } from "./PinescriptParser.ts";
import { Expression_statementContext } from "./PinescriptParser.ts";
import { Conditional_expressionContext } from "./PinescriptParser.ts";
import { Disjunction_expressionContext } from "./PinescriptParser.ts";
import { Conjunction_expressionContext } from "./PinescriptParser.ts";
import { Bitwise_or_expressionContext } from "./PinescriptParser.ts";
import { Bitwise_xor_expressionContext } from "./PinescriptParser.ts";
import { Bitwise_and_expressionContext } from "./PinescriptParser.ts";
import { Equality_expressionContext } from "./PinescriptParser.ts";
import { Equality_trailing_pairContext } from "./PinescriptParser.ts";
import { Equal_trailing_pairContext } from "./PinescriptParser.ts";
import { Not_equal_trailing_pairContext } from "./PinescriptParser.ts";
import { Inequality_expressionContext } from "./PinescriptParser.ts";
import { Inequality_trailing_pairContext } from "./PinescriptParser.ts";
import { Less_than_equal_trailing_pairContext } from "./PinescriptParser.ts";
import { Less_than_trailing_pairContext } from "./PinescriptParser.ts";
import { Greater_than_equal_trailing_pairContext } from "./PinescriptParser.ts";
import { Greater_than_trailing_pairContext } from "./PinescriptParser.ts";
import { Shift_expressionContext } from "./PinescriptParser.ts";
import { Shift_opContext } from "./PinescriptParser.ts";
import { Additive_expressionContext } from "./PinescriptParser.ts";
import { Additive_opContext } from "./PinescriptParser.ts";
import { Multiplicative_expressionContext } from "./PinescriptParser.ts";
import { Multiplicative_opContext } from "./PinescriptParser.ts";
import { Unary_expressionContext } from "./PinescriptParser.ts";
import { Unary_opContext } from "./PinescriptParser.ts";
import { Primary_expression_attributeContext } from "./PinescriptParser.ts";
import { Primary_expression_callContext } from "./PinescriptParser.ts";
import { Primary_expression_fallbackContext } from "./PinescriptParser.ts";
import { Primary_expression_subscriptContext } from "./PinescriptParser.ts";
import { Argument_listContext } from "./PinescriptParser.ts";
import { Argument_definitionContext } from "./PinescriptParser.ts";
import { Subscript_sliceContext } from "./PinescriptParser.ts";
import { Atomic_expressionContext } from "./PinescriptParser.ts";
import { Literal_expressionContext } from "./PinescriptParser.ts";
import { Literal_numberContext } from "./PinescriptParser.ts";
import { Literal_stringContext } from "./PinescriptParser.ts";
import { Literal_boolContext } from "./PinescriptParser.ts";
import { Literal_colorContext } from "./PinescriptParser.ts";
import { Grouped_expressionContext } from "./PinescriptParser.ts";
import { Tuple_expressionContext } from "./PinescriptParser.ts";
import { Import_statementContext } from "./PinescriptParser.ts";
import { Break_statementContext } from "./PinescriptParser.ts";
import { Continue_statementContext } from "./PinescriptParser.ts";
import { Variable_declarationContext } from "./PinescriptParser.ts";
import { Tuple_declarationContext } from "./PinescriptParser.ts";
import { Declaration_modeContext } from "./PinescriptParser.ts";
import { Assignment_targetContext } from "./PinescriptParser.ts";
import { Assignment_target_attributeContext } from "./PinescriptParser.ts";
import { Assignment_target_subscriptContext } from "./PinescriptParser.ts";
import { Assignment_target_nameContext } from "./PinescriptParser.ts";
import { Assignment_target_groupContext } from "./PinescriptParser.ts";
import { Augassign_opContext } from "./PinescriptParser.ts";
import { Type_specificationContext } from "./PinescriptParser.ts";
import { Type_qualifierContext } from "./PinescriptParser.ts";
import { Attributed_type_nameContext } from "./PinescriptParser.ts";
import { Template_spec_suffixContext } from "./PinescriptParser.ts";
import { Array_type_suffixContext } from "./PinescriptParser.ts";
import { Type_argument_listContext } from "./PinescriptParser.ts";
import { NameContext } from "./PinescriptParser.ts";
import { Name_loadContext } from "./PinescriptParser.ts";
import { Name_storeContext } from "./PinescriptParser.ts";
import { CommentsContext } from "./PinescriptParser.ts";
import { CommentContext } from "./PinescriptParser.ts";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `PinescriptParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export default class PinescriptParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `PinescriptParser.start`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStart?: (ctx: StartContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.start_script`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStart_script?: (ctx: Start_scriptContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.start_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStart_expression?: (ctx: Start_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.start_comments`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStart_comments?: (ctx: Start_commentsContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.statements`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatements?: (ctx: StatementsContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStatement?: (ctx: StatementContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.compound_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompound_statement?: (ctx: Compound_statementContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.simple_statements`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_statements?: (ctx: Simple_statementsContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.trailing_structure_statements`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTrailing_structure_statements?: (ctx: Trailing_structure_statementsContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.simple_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_statement?: (ctx: Simple_statementContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.compound_assignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompound_assignment?: (ctx: Compound_assignmentContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.compound_variable_initialization`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompound_variable_initialization?: (ctx: Compound_variable_initializationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.compound_name_initialization`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompound_name_initialization?: (ctx: Compound_name_initializationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.compound_tuple_initialization`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompound_tuple_initialization?: (ctx: Compound_tuple_initializationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.compound_reassignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompound_reassignment?: (ctx: Compound_reassignmentContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.compound_augassignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompound_augassignment?: (ctx: Compound_augassignmentContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.function_declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunction_declaration?: (ctx: Function_declarationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.parameter_list`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameter_list?: (ctx: Parameter_listContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.parameter_definition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameter_definition?: (ctx: Parameter_definitionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.method_declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMethod_declaration?: (ctx: Method_declarationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.method_parameter_list`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMethod_parameter_list?: (ctx: Method_parameter_listContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.method_parameter_definition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMethod_parameter_definition?: (ctx: Method_parameter_definitionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.type_declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitType_declaration?: (ctx: Type_declarationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.field_definitions`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitField_definitions?: (ctx: Field_definitionsContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.field_definition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitField_definition?: (ctx: Field_definitionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.enum_declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEnum_declaration?: (ctx: Enum_declarationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.enum_definitions`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEnum_definitions?: (ctx: Enum_definitionsContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.enum_definition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEnum_definition?: (ctx: Enum_definitionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.structure`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructure?: (ctx: StructureContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.structure_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructure_statement?: (ctx: Structure_statementContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.structure_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStructure_expression?: (ctx: Structure_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.if_structure`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIf_structure?: (ctx: If_structureContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.elif_structure`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitElif_structure?: (ctx: Elif_structureContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.if_tail`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIf_tail?: (ctx: If_tailContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.else_block`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitElse_block?: (ctx: Else_blockContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.for_structure`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFor_structure?: (ctx: For_structureContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.for_structure_to`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFor_structure_to?: (ctx: For_structure_toContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.for_structure_in`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFor_structure_in?: (ctx: For_structure_inContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.for_iterator`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFor_iterator?: (ctx: For_iteratorContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.while_structure`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWhile_structure?: (ctx: While_structureContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.switch_structure`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitch_structure?: (ctx: Switch_structureContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.switch_cases`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitch_cases?: (ctx: Switch_casesContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.switch_pattern_case`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitch_pattern_case?: (ctx: Switch_pattern_caseContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.switch_default_case`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSwitch_default_case?: (ctx: Switch_default_caseContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.local_block`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLocal_block?: (ctx: Local_blockContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.indented_local_block`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIndented_local_block?: (ctx: Indented_local_blockContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.inline_local_block`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInline_local_block?: (ctx: Inline_local_blockContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.simple_assignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_assignment?: (ctx: Simple_assignmentContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.simple_variable_initialization`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_variable_initialization?: (ctx: Simple_variable_initializationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.simple_name_initialization`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_name_initialization?: (ctx: Simple_name_initializationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.simple_tuple_initialization`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_tuple_initialization?: (ctx: Simple_tuple_initializationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.simple_reassignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_reassignment?: (ctx: Simple_reassignmentContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.simple_augassignment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSimple_augassignment?: (ctx: Simple_augassignmentContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.expression_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression_statement?: (ctx: Expression_statementContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.conditional_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConditional_expression?: (ctx: Conditional_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.disjunction_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDisjunction_expression?: (ctx: Disjunction_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.conjunction_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConjunction_expression?: (ctx: Conjunction_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.bitwise_or_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBitwise_or_expression?: (ctx: Bitwise_or_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.bitwise_xor_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBitwise_xor_expression?: (ctx: Bitwise_xor_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.bitwise_and_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBitwise_and_expression?: (ctx: Bitwise_and_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.equality_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEquality_expression?: (ctx: Equality_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.equality_trailing_pair`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEquality_trailing_pair?: (ctx: Equality_trailing_pairContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.equal_trailing_pair`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEqual_trailing_pair?: (ctx: Equal_trailing_pairContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.not_equal_trailing_pair`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNot_equal_trailing_pair?: (ctx: Not_equal_trailing_pairContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.inequality_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInequality_expression?: (ctx: Inequality_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.inequality_trailing_pair`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitInequality_trailing_pair?: (ctx: Inequality_trailing_pairContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.less_than_equal_trailing_pair`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLess_than_equal_trailing_pair?: (ctx: Less_than_equal_trailing_pairContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.less_than_trailing_pair`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLess_than_trailing_pair?: (ctx: Less_than_trailing_pairContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.greater_than_equal_trailing_pair`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitGreater_than_equal_trailing_pair?: (ctx: Greater_than_equal_trailing_pairContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.greater_than_trailing_pair`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitGreater_than_trailing_pair?: (ctx: Greater_than_trailing_pairContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.shift_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitShift_expression?: (ctx: Shift_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.shift_op`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitShift_op?: (ctx: Shift_opContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.additive_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAdditive_expression?: (ctx: Additive_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.additive_op`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAdditive_op?: (ctx: Additive_opContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.multiplicative_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultiplicative_expression?: (ctx: Multiplicative_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.multiplicative_op`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMultiplicative_op?: (ctx: Multiplicative_opContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.unary_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnary_expression?: (ctx: Unary_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.unary_op`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitUnary_op?: (ctx: Unary_opContext) => Result;
	/**
	 * Visit a parse tree produced by the `primary_expression_attribute`
	 * labeled alternative in `PinescriptParser.primary_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimary_expression_attribute?: (ctx: Primary_expression_attributeContext) => Result;
	/**
	 * Visit a parse tree produced by the `primary_expression_call`
	 * labeled alternative in `PinescriptParser.primary_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimary_expression_call?: (ctx: Primary_expression_callContext) => Result;
	/**
	 * Visit a parse tree produced by the `primary_expression_fallback`
	 * labeled alternative in `PinescriptParser.primary_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimary_expression_fallback?: (ctx: Primary_expression_fallbackContext) => Result;
	/**
	 * Visit a parse tree produced by the `primary_expression_subscript`
	 * labeled alternative in `PinescriptParser.primary_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPrimary_expression_subscript?: (ctx: Primary_expression_subscriptContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.argument_list`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArgument_list?: (ctx: Argument_listContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.argument_definition`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArgument_definition?: (ctx: Argument_definitionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.subscript_slice`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSubscript_slice?: (ctx: Subscript_sliceContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.atomic_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtomic_expression?: (ctx: Atomic_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.literal_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral_expression?: (ctx: Literal_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.literal_number`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral_number?: (ctx: Literal_numberContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.literal_string`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral_string?: (ctx: Literal_stringContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.literal_bool`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral_bool?: (ctx: Literal_boolContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.literal_color`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitLiteral_color?: (ctx: Literal_colorContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.grouped_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitGrouped_expression?: (ctx: Grouped_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.tuple_expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTuple_expression?: (ctx: Tuple_expressionContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.import_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitImport_statement?: (ctx: Import_statementContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.break_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBreak_statement?: (ctx: Break_statementContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.continue_statement`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitContinue_statement?: (ctx: Continue_statementContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.variable_declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitVariable_declaration?: (ctx: Variable_declarationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.tuple_declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTuple_declaration?: (ctx: Tuple_declarationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.declaration_mode`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaration_mode?: (ctx: Declaration_modeContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.assignment_target`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssignment_target?: (ctx: Assignment_targetContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.assignment_target_attribute`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssignment_target_attribute?: (ctx: Assignment_target_attributeContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.assignment_target_subscript`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssignment_target_subscript?: (ctx: Assignment_target_subscriptContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.assignment_target_name`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssignment_target_name?: (ctx: Assignment_target_nameContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.assignment_target_group`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAssignment_target_group?: (ctx: Assignment_target_groupContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.augassign_op`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAugassign_op?: (ctx: Augassign_opContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.type_specification`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitType_specification?: (ctx: Type_specificationContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.type_qualifier`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitType_qualifier?: (ctx: Type_qualifierContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.attributed_type_name`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAttributed_type_name?: (ctx: Attributed_type_nameContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.template_spec_suffix`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTemplate_spec_suffix?: (ctx: Template_spec_suffixContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.array_type_suffix`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitArray_type_suffix?: (ctx: Array_type_suffixContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.type_argument_list`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitType_argument_list?: (ctx: Type_argument_listContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.name`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitName?: (ctx: NameContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.name_load`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitName_load?: (ctx: Name_loadContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.name_store`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitName_store?: (ctx: Name_storeContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.comments`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComments?: (ctx: CommentsContext) => Result;
	/**
	 * Visit a parse tree produced by `PinescriptParser.comment`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComment?: (ctx: CommentContext) => Result;
}


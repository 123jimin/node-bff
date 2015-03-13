%{
	var _unescape = function _unescape(c){
		switch(c){
			case '0':
				return 0x00;
			case 't':
				return 0x09;
			case 'n':
				return 0x0A;
			case 'r':
				return 0x0D;
			default:
				return c.charCodeAt(0);
		}
	};
%}

%lex
%%

("!"|"#")([^\n]+) /* skip comments */
(" "|\r|\n|\t)+ /* skip whitespaces */

"0x"[0-9]+  return "NUMBER";

("+"|"-")?[0-9]+  return "NUMBER";
[A-Za-z_][A-Za-z0-9_]*  return "IDENTIFIER";
"'"."'" return "CHARACTER";
"'\\"."'" return "CHARACTER";

"=" return "=";
"(" return "(";
")" return ")";
"+" return "+";
"-" return "-";
"<" return "<";
">" return ">";
"[" return "[";
"]" return "]";
"." return ".";
"," return ",";
";" return ";";

/lex

%start program
%%

program
	: statements {return $1;}
	;

statements
	: statement statements {$$ = [$1].concat($2);}
	| statement {$$ = [$1];}
	;

statement
	: operation {$$ = $1;}
	| define {$$ = $1;}
	;

operation
	: macro {$$ = $1;}
	| opcode {$$ = ['opcode', $1];}
	;

macro
	: IDENTIFIER '(' args ')' {$$ = ['macro', $1, $3];}
	| IDENTIFIER '(' ')' {$$ = ['macro', $1, []]}
	;

args
	: arg ',' args {$$ = [$1].concat($3);}
	| arg {$$ = [$1];}
	;

arg
	: IDENTIFIER {$$ = $1;}
	| constant {$$ = $1;}
	;

constant
	: NUMBER {$$ = +$1;}
	| CHARACTER {$$ = $1[1]=='\\'?_unescape($1[2]):$1.charCodeAt(1);}
	;

define
	: macro '=' ';' {$$ = ['define', $1, []];}
	| macro '=' stream ';' {$$ = ['define', $1, $3];}
	| IDENTIFIER '=' constant ';' {$$ = ['set', $1, $3];}
	;

stream
	: operation stream {$$ = [$1].concat($2);}
	| operation {$$ = [$1];}
	;

opcode
	: ('+' | '-' | '<' | '>' | '[' | ']' | '.' | ',') {$$ = $1;}
	;

//Run with ES6+
"use strict";
const rl = require('readline-sync');
class Scope {
	constructor() {
		this.variables = {};
	}
	setSymbol(name,value) {
		this.variables[name] = value;
	}
	getSymbol(name){
		return this.variables[name]; 
	}
}
class LFunction {
	constructor(func,...args) {
    //console.log('rargs',args)
		this.func = func;
		this.args = args;
	}
	evaluate(scope) {
		return actionMap[this.func]['function'](scope, ...this.args);
	}
}
class LNumber {
	constructor(val) {
		this.value = val;
	}
	evaluate(scope) {
		return this.value;
	}
}
class LSymbol {
	constructor(name) {
		this.name = name;
	}
	evaluate(scope) {
    //console.log('scope',scope)
		return scope.getSymbol(this.name) || this.name;
	}
}
const actionMap = {
	set: {
		args: 2,
		'function': function(scope,arg1,arg2) {
			scope.setSymbol(arg1.evaluate(), arg2,evaluate());
		}
	},
	print: {
		args: 'infinite',
		'function': function(scope, ...args) {
			for(let i = 0; i <= args.length-1; ++i) {
				args[i] = args[i].evaluate(scope)
			}
			const outputStr = Array.from(args).join(' ')
			console.log(outputStr);
		}
	},
	getvar: {
		args: 1,
		'function': function(scope, arg1) {
			try {
				return scope.getSymbol(arg1.evaluate())
			} catch(err) {
				throw Error('Undefined variable '+arg1.evaluate())
			}
		}
	},
}
const tokenize = str => str.split(' ').map(item => item.trim()).filter(item => item.length);
const toAST = tokens => {
  console.log(tokens)
	let pos = 0;
	const peek = () => tokens[pos];
	const next = () => tokens[++pos];
	let token = peek();
	const tokenToAST = ctoken => {
    //console.log('ctoken',ctoken);
		if(/^\d+$/.test(ctoken)) {
			//console.log('doing int', ctoken)
			return new LNumber(parseInt(ctoken,10));
		} else if(/^\d+\.\d+$/.test(ctoken)) {
			return new LNumber(parseFloat(ctoken));
		} else if(/^[0-9a-zA-Z][0-9a-zA-Z_]*$/.test(ctoken) && !(ctoken in actionMap)) {
			return new LSymbol(ctoken);
		} else if(/[0-9a-zA-Z][0-9a-zA-Z_]*/.test(ctoken) && ctoken in actionMap) {
			let args = [ctoken];
			if(actionMap[ctoken].args === 'infinite') {
				let currentFuncArg = next();
				while(currentFuncArg) {
					//console.log('current token',currentFuncArg)
					//console.log('parsed',tokenToAST(currentFuncArg))
					args.push(tokenToAST(currentFuncArg));
					currentFuncArg = next();
				}
			} else {
				for(let i = 0; i <= actionMap[ctoken].args; ++i) {
					args.push(toAST(next()));
				}
			}
			//console.log('args',args);
			return new LFunction(...args);
		}
	}
	return tokenToAST(token);
}
const GlobalScope = new Scope();
let code = rl.question('>> ');
const tokenized = tokenize(code);
const ast = toAST(tokenized);
console.log('tokens',tokenized)
console.log('ast',ast)
ast.evaluate(GlobalScope);

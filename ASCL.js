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
	constructor(func,args) {
		this.func = func;
		this.args = args;
	}
	evaluate(scope) {
		return actionMap[this.func]['function'](scope, ...args);
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
		return scope.getSymbol(name)
	}
}
const tokenize = str => str.split(' ').map(item => item.trim()).filter(item => item.length);
const actionMap = {
	set: {
		args: 2,
		'function': function(scope, arg1, arg2) {
			scope.setSymbol(arg1.evaluate(), arg2,evaluate());
		}
	},
	print: {
		args: 1,
		'function': function(scope, arg1) {
			console.log(arg1.evaluate());
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
const toAST = tokens => {
	let pos = 0;
	const peek = () => tokens[pos];
	const next = () => tokens[++pos];
	let token = peek();
	const tokenToAST = ctoken => {
		if(/^\d+$/.test(ctoken)) {
			return new LNumber(parseInt(ctoken,10));
		} else if(/^\d+\.\d+$/.test(ctoken)) {
			return new LNumber(parseFloat(ctoken));
		} else if(/[0-9a-zA-Z][0-9a-zA-Z_]*/.test(ctoken) && !(ctoken in actionMap)) {
			return new LSymbol(ctoken);
		} else if(/[0-9a-zA-Z][0-9a-zA-Z_]*/.test(ctoken) && ctoken in actionMap) {
			let args = [ctoken];
			for(let i=1; i<=actionMap[ctoken].args;++i) {
				args.push(tokenToAST(next()));
			}
			return new LFunction(...args);
		}
	}
	return tokenToAST(token);
}
const GlobalScope = new Scope();
let code = rl.question('>> ');
const tokenized = tokenize(code);
const ast = toAST(tokenized);
console.log(tokenized)
console.log(ast)
ast.evaluate(GlobalScope);

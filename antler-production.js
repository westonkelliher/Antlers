
class TreePart {
    constructor(symbol) {
	this.symbol = symbol
    }

    to_string() {
	return this.symbol
    }
}

class TreeSpike extends TreePart {
    constructor(base_rotation, base_length, base_theta, base_phi) {
	super('v');
	this.base_rotation = base_rotation;
	this.base_length = base_length;
	this.base_theta = base_theta;
	this.base_phi = base_phi;
    }
    
}

class TreeSegment extends TreePart {
    constructor(base_rotation, base_length, base_theta, base_phi, end_size, end_theta, end_phi) {
	super('I');
	this.base_rotation = base_rotation;
	this.base_length = base_length;
	this.base_theta = base_theta;
	this.base_phi = base_phi;
	this.end_size = end_size;
	this.end_theta = end_theta;
	this.end_phi = end_phi;
    }
}

class TreeBranch extends TreePart {
    constructor(branch_point, size_ratio) {
	super('L(');
	this.branch_point = branch_point; //where along the parent branch the next branch starts
	this.size_ratio = size_ratio;
    }
}

class TreeBranchEnd extends TreePart {
    constructor() {
	super(')');
    }
}

class TreeOpenning extends TreePart {
    constructor() {
	super('O');
    }
    
}

class TreeProductionRule {
    constructor(max_size, left_hand) {
	this.max_size = max_size;
	this.left_hand = left_hand; //array of 
    }

}

//rules should increase in max_size from left to right
class TreeProduction {
    constructor(base_spike) {
	this.rules = [new TreeProductionRule(1, [base_spike])];
    }

    add_rule(min_size, rule) {
	this.rules[this.rules.length-1].max_size = min_size;
	this.rules.push(rule);
    }
    
    generate_tree(size) {
	var production = [];
	var size_stack = [];
	for (let i = 0; i < this.rules.length; i++) {
	    if (size <= this.rules[i].max_size) {
		for (let j = 0; j < this.rules[i].left_hand.length; j++) {
		    var k = this.rules[i].left_hand[j];
		    if (k.to_string() == 'I') {
			size *= k.end_size;
			production.push(k);
		    }
		    else if (k.to_string() == 'L(') {
			size_stack.push(size);
			size *= k.size_ratio;
			production.push(k);
		    }
		    else if (k.to_string() == ')') {
			size = size_stack.pop();
			production.push(k);
		    }
		    else if (k.to_string() == 'O') {
			production = production.concat(this.generate_tree(size));
		    }
		    else if (k.to_string() == 'v') {
			size = 0;
			production.push(k);
		    }
		}
		break;
	    }
	}
	return new Tree(production);
    }

    
}

class Tree {

    constructor(tree_parts) {
	this.tree_parts = tree_parts;
    }

    to_string() {
	console.log(this.tree_parts);
	var sumstr = "";
	for (let i = 0; i < this.tree_parts.length; i++) {
	    sumstr += this.tree_parts[i].to_string()+" ";
	}
	sumstr = sumstr.slice(0, -1);
	return sumstr;
    }
}

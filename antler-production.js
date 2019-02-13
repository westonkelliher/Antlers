
class TreePart {
    constructor(symbol) {
	this.symbol = symbol
    }

    to_string() {
	return this.symbol
    }
}

class TreeSpike extends TreePart{
    constructor(base_rotation, base_length, base_theta, base_phi) {
	super('v');
	this.base_rotation = base_rotation;
	this.base_length = base_length;
	this.base_theta = base_theta;
	this.base_phi = base_phi;
    }
    
}

class TreeSegment {
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

class TreeBranch {
    constructor(branch_point, size_ratio) {
	super('L(');
	this.branch_point = branch_point; //where along the parent branch the next branch starts
	this.size_ratio = size_ratio;
    }
}

class TreeEndBranch {
    constructor() {
	super(')');
    }
}

class TreeOpenning {
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
	this.rules = [new TreeProductionRule(1, [base_spike]));
    }

    add_rule(min_size, rule) {
	this.rules[this.rules.length-1].max_size = min_size;
	this.rules.push(rule);
    }
    
    generate_tree(size) {
	var production = [];
	var size_stack = [];
	for (let i = 0; i <this.rules.length; i--) {
	    if (size < this.rules[i].max_size) {
		for (let j = 0; j < this.rules[i].left_hand.length; j++) {
		    if (j.to_string() == 'I') {
			size *= j.end_size;
		    }
		    else if (j.to_string() == 'L(') {
			size_stack.push(size);
			size *= j.size_ratio;
		    }
		    else if (j.to_string() == ')') {
			size = size_stack.pop();
		    }
		    else if (j.to_string() == 'O') {
			generate_tree(size);
		    }
		}
		break;
	    }
	}
    }
    
}

class Tree {

}

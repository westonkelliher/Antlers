
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

    shape_matrix() {
        var lengthwise_tilt = Mat4.rotation(this.base_phi, Vec.of(Math.cos(this.base_theta+Math.PI*1/2), Math.sin(this.base_theta+Math.PI*1/2), 0));
        var length_T = Mat4.translation(Vec.of(0, 0, this.base_length));
        return Mat4.identity().times(lengthwise_tilt).times(length_T);
    }

    create_shape(graphics_state, gl, mat) {
	this.shape = new Spike(this.shape_matrix());
	this.shape.copy_onto_graphics_card(gl);
	this.mat = mat;
    }

    draw(graphics_state, m) {
	var M =  m.times(Mat4.rotation(this.base_rotation, Vec.of(0, 0, 1)));
	this.shape.draw(graphics_state, M, this.mat);
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

    shape_matrix() {
	var end_tilt = Mat4.rotation(this.end_phi, Vec.of(Math.cos(this.end_theta+Math.PI*1/2), Math.sin(this.end_theta+Math.PI*1/2), 0));
        var lengthwise_tilt = Mat4.rotation(this.base_phi, Vec.of(Math.cos(this.base_theta+Math.PI*1/2), Math.sin(this.base_theta+Math.PI*1/2), 0));
        var length_T = Mat4.translation(Vec.of(0, 0, this.base_length));
        var end_S = Mat4.scale(Vec.of(this.end_size, this.end_size, this.end_size));
        return Mat4.identity().times(lengthwise_tilt).times(length_T).times(end_tilt).times(end_S);
    }

    next_matrix(m) {
	return m.times(Mat4.rotation(this.base_rotation, Vec.of(0, 0, 1))).times(this.shape_matrix());
    }
    
    create_shape(graphics_state, gl, mat) {
	this.shape = new Segment(this.shape_matrix());
	this.shape.copy_onto_graphics_card(gl);
	this.mat = mat;
    }

    draw(graphics_state, m) {
	var M =  m.times(Mat4.rotation(this.base_rotation, Vec.of(0, 0, 1)));
	this.shape.draw(graphics_state, M, this.mat);
    }
}

class TreeBranch extends TreePart {
    constructor(branch_point, branch_theta, size_ratio) {
	super('L(');
	this.branch_point = branch_point; //where along the parent branch the next branch starts
	this.branch_theta = branch_theta;
	this.size_ratio = size_ratio;
    }
    
    next_matrix(m) {
	var R_phi = Mat4.rotation(Math.PI/2, Vec.of(0, 1, 0));
	var R_theta = Mat4.rotation(this.branch_theta, Vec.of(0, 0, 1));
	var T = Mat4.translation(Vec.of(0, 0, this.branch_point));
	var S = Mat4.scale(Vec.of(this.size_ratio, this.size_ratio, this.size_ratio));
	return m.times(T).times(R_theta).times(R_phi).times(S);
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

    create_shapes(graphics_state, gl, mat) {
	for (let i = 0; i < this.left_hand.length; i++) {
	    if (this.left_hand[i].to_string() == "I" || this.left_hand[i].to_string() == "v"){
		this.left_hand[i].create_shape(graphics_state, gl, mat);
	    }
	}
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

    create_shapes(graphics_state, gl, mat) {
	for (let i = 0; i < this.rules.length; i++) {
	    this.rules[i].create_shapes(graphics_state, gl, mat);
	}
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

    draw_tree(size, graphics_state, m) {
	var size_stack = [];
	var matrix_stack = [];
	for (let i = 0; i < this.rules.length; i++) {
	    if (size <= this.rules[i].max_size) {
		for (let j = 0; j < this.rules[i].left_hand.length; j++) {
		    var k = this.rules[i].left_hand[j];
		    if (k.to_string() == 'I') {
			size *= k.end_size;
			k.draw(graphics_state, m);
			m = k.next_matrix(m);
		    }
		    else if (k.to_string() == 'L(') {
			size_stack.push(size);
			size *= k.size_ratio;
			matrix_stack.push(m);
			m = k.next_matrix(m)
		    }
		    else if (k.to_string() == ')') {
			size = size_stack.pop();
			m = matrix_stack.pop();
		    }
		    else if (k.to_string() == 'O') {
			this.draw_tree(size, graphics_state, m);
		    }
		    else if (k.to_string() == 'v') {
			size = 0;
			k.draw(graphics_state, m);
		    }
		}
		break;
	    }
	}
    }

    
}

class Tree {

    constructor(tree_parts) {
	this.tree_parts = tree_parts;
    }

    to_string() {
	var sumstr = "";
	for (let i = 0; i < this.tree_parts.length; i++) {
	    sumstr += this.tree_parts[i].to_string()+" ";
	}
	sumstr = sumstr.slice(0, -1);
	return sumstr;
    }
}

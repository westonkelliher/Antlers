//Tree Part - superclass
class TreePart {
    constructor(symbol) {
	this.symbol = symbol
    }
    to_string() {
	return this.symbol
    }
}

//Tree Segment - a segment node
class TreeSegment extends TreePart {
    constructor(base_length, base_theta, base_phi, end_size, end_theta, end_phi) {
	if (end_size == undefined || end_size == 0) { //spike
	    super('v');
	    this.model_type = Spike;
	}
	else {
	    super('I');
	    this.model_type = Segment;
	}
	this.base_length = base_length;
	this.base_theta = base_theta;
	this.base_phi = base_phi;
	this.end_size = end_size;
	this.end_theta = end_theta;
	this.end_phi = end_phi;
    }
    
    init(gl, gs, material) {
	this.material = material;
	this.gl = gl;
	this.gs = gs;
	this.gpu_loaded = false;
    }

    next_matrix(m) {
	var phi = Mat4.rotation(this.base_phi, Vec.of(0, 1, 0));
        var theta = Mat4.rotation(this.base_theta, Vec.of(0, 0, 1));
        var T = Mat4.translation(Vec.of(0, 0, this.base_length));
        var S = Mat4.scale(Vec.of(this.end_size, this.end_size, this.end_size));
        var tilt = Mat4.rotation(this.end_phi, Vec.of(Math.cos(this.end_theta+Math.PI*1/2), Math.sin(this.end_theta+Math.PI*1/2), 0));
        return m.times(theta).times(phi).times(T).times(S).times(tilt);
    }
    
    draw(m) {
	if (!this.gpu_loaded) {
	    this.shape = new this.model_type(this.base_length, this.base_theta, this.base_phi, this.end_size, this.end_theta, this.end_phi);
	    this.shape.copy_onto_graphics_card(this.gl);
	    this.gpu_loaded = true;
	}
	this.shape.draw(this.gs, m, this.material);
    }

    get_model() {
	return new this.model_type(this.base_length, this.base_theta, this.base_phi, this.end_size, this.end_theta, this.end_phi);
    }

    no_length_copy() {
	return new Segment(0, this.base_theta, 0, 1, this.end_theta, 0);
    }
}

//Tree Branch - allows the next segment to come out at an angle form somewhere in the middle of the last segment
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

    no_length_copy() {
	return new TreeBranch(0, branch_theta, 0);
    }
}

class TreeBranchEnd extends TreePart {
    constructor() {
	super(')');
    }
}


class RightHand {
    constructor(parts) {
	this.parts = parts;
    }

    front_append_segment(base_theta, end_theta) {
	this.parts.unshift(new TreeSegment(0, base_theta, 0, 1, end_theta, 0));
    }
    
    num_segments() {
	let num = 0;
	let level = 0;
	for (let i = 0; i < parts.length; i++) {
	    if (level == 0 && parts[i].symbol == 'I') {
		num++;
	    }
	    else if (parts[i].symbol == 'L(') {
		level++;
	    }
	    else if (parts[i].symbol == ')') {
		level--;
	    }
	}
	return num;
    }

    make_interpolable(target) {
	let segs_greater = this.num_segments - target.num_segments();
	while (segs_greater < 0) {
	}
    }
}

num_segs(rh, i) {
    let num = 0;
    let level = 0;
    for (; i < parts.length && level >= 0; i++) {
	if (level == 0 && parts[i].symbol == 'I') {
	    num++;
	}
	else if (parts[i].symbol == 'L(') {
	    level++;
	}
	else if (parts[i].symbol == ')') {
	    level--;
	}
    }
    return num;
}

n_segs_index(n, rh, i) {
    let num = 0;
    let level = 0;
    for (; i < parts.length && level >= 0 && num < n; i++) {
	if (level == 0 && parts[i].symbol == 'I') {
	    num++;
	}
	else if (parts[i].symbol == 'L(') {
	    level++;
	}
	else if (parts[i].symbol == ')') {
	    level--;
	}
    }
    return i;
}

// make rh1 interpolable to rh2 but do not modify rh2 (returns an interpolator vector?)
// returns a Right Hand which can be summed with interpolable rh1 to produce rh2?
make_interpolable(rh1, i1, rh2, i2) {
    let segs_greater = num_segs(rh1, i1) - num_segs(rh2, i2);
    let segs_traversed = 0;
    let segi1 = 0;
    let segi2 = 0;
    let level1 = 0;
    let level2 = 0;
    let n_segs1 = num_segs(rh1, i1);
    let n_segs2 = num_segs(rh2, i2);
    while () {//while within rh arrays and levels are >= 0
	if (segi1 < n_segs2-n_segs1) {
	    rh1.splice(i1, 0, rh2[i2].no_length_copy());
	    if (rh2[i2].to_string() == 'I') {

	    }
	    else if (rh2[i2].to_string() == 'L(') {
		level2++;
	    }
	    else if (rh2[i2].to_string() == ')') {
		level2--;
	    }	    
	    i1++;
	    i2++;
	}

    }
	

	if (num_segs(rh1, i1) < num_segs(rh2, i2) {
	for (let k = n_segs_index(num_segs(rh2, i2)-num_segs(rh1, i2), rh2, i2); k >= i2; k--) {
	    rh1.unshift(
	}
	for (let x = n_segs_index(num_segs(rh2, i2)-num_segs(rh1, i2), rh2); i2 < 
    }
}

class TreeProductionRule {
    constructor(max_size, right_hand) {
	this.right_hand = right_hand; //array of
	this.max_size = max_size;
    }

    init(gl, gs, material) {
	for (let i = 0; i < this.right_hand.length; i++) {
	    if (this.right_hand[i].to_string() == 'I' || this.right_hand[i].to_string() == 'v') {
		this.right_hand[i].init(gl, gs, material);
	    }
	}
    }

}

//rules should increase in max_size from left to right
class TreeProduction {
    constructor(rules) {
	this.rules = rules; //an array of arrays of size two; rules[i][0] should correspond to a max-size and rules[i][1] should correspond to a rule/lefthand
    }
    
    init(gl, gs, material) {
	for (let i = 0; i < this.rules.length; i++) {
	    this.rules[i].init(gl, gs, material);
	}
    }
    
    draw_tree(size, m) {
	var size_stack = [];
	var matrix_stack = [];
	for (let i = 0; i < this.rules.length; i++) {
	    if (size <= this.rules[i].max_size) {
		for (let j = 0; j < this.rules[i].right_hand.length; j++) {
		    var k = this.rules[i].right_hand[j];
		    if (k.to_string() == 'I') {
			size *= k.end_size;
			k.draw(m);
			m = k.next_matrix(m);
			if (j == this.rules[i].right_hand.length-1) {
			    this.draw_tree(size, m)
			}
		    }
		    else if (k.to_string() == 'L(') {
			size_stack.push(size);
			size *= k.size_ratio;
			matrix_stack.push(m);
			m = k.next_matrix(m)
		    }
		    else if (k.to_string() == ')') {
			if (size != 0) {
			    this.draw_tree(size, m)
			}
			size = size_stack.pop();
			m = matrix_stack.pop();
		    }
		    else if (k.to_string() == 'v') {
			size = 0;
			k.draw(m);
		    }
		}
		break;
	    }
	}
    }

    //Basically we're currying here
    get_model() {
	return this.private_get_model(1, Mat4.identity());
    }
    
    private_get_model(size, m) {
	var subshapes = [];
	var size_stack = [];
	var matrix_stack = [];
	for (let i = 0; i < this.rules.length; i++) {
	    if (size <= this.rules[i].max_size) {
		for (let j = 0; j < this.rules[i].right_hand.length; j++) {
		    var k = this.rules[i].right_hand[j];
		    if (k.to_string() == 'I') {
			size *= k.end_size;
			subshapes.push([m, k.get_model()]);
			m = k.next_matrix(m);
			if (j == this.rules[i].right_hand.length-1) {
			    subshapes.push([Mat4.identity(), this.private_get_model(size, m)]);
			}
		    }
		    else if (k.to_string() == 'L(') {
			size_stack.push(size);
			size *= k.size_ratio;
			matrix_stack.push(m);
			m = k.next_matrix(m)
		    }
		    else if (k.to_string() == ')') {
			if (size != 0) {
			    subshapes.push([Mat4.identity(), this.private_get_model(size, m)]);
			}
			size = size_stack.pop();
			m = matrix_stack.pop();
		    }
		    else if (k.to_string() == 'v') {
			size = 0;
			let R = Mat4.rotation(k.base_rotation, Vec.of(0, 0, 1));			
			subshapes.push([m, k.get_model()]);
		    }
		}
		break;
	    }
	}
	return new MultiShape(subshapes);
    }
    
    
}


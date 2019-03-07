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

    get_interp_model(seg_vec, x) {
	return new this.model_type(this.base_length+seg_vec.base_length*x, this.base_theta+seg_vec.base_theta*x,
				   this.base_phi+seg_vec.base_phi*x, this.end_size+seg_vec.end_size*x,
				   this.end_theta+seg_vec.end_theta*x, this.end_phi+seg_vec.end_phi*x);
    }

    no_length_copy() {
	return new TreeSegment(0, this.base_theta, 0, 1, this.end_theta, 0);
    }

    no_length_vector() {
	return new TreeSegment(this.base_length, 0, this.base_phi, this.end_size-1, 0, this.end_phi);
    }

    zero_copy() {
	return new TreeSegment(0, 0, 0, 0, 0, 0);
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
	return new TreeBranch(0, this.branch_theta, 0);
    }

    no_length_vector() {
	return new TreeBranch(this.branch_point, 0, this.size_ratio);
    }

    zero_copy() {
	return new TreeBranch(0, 0, 0);
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

    interpolate(x) {
	for (let i = 0; i < this.right_hand.length; i++) {
	    let k = this.right_hand[i];
	    let interp = this.interp_vector[i];
	    if (k.to_string() == 'I' || k.to_string() == 'v') {
		k.base_length += interp.base_length*x;
		k.base_theta += interp.base_theta*x;
		k.base_phi += interp.base_phi*x;
		k.end_size += interp.end_size*x;
		k.end_theta += interp.end_theta*x;
		k.end_phi += interp.end_phi*x;
            }
            else if (k.to_string() == 'L(') {
		k.branch_point += interp.branch_point*x;
		k.branch_theta += interp.branch_theta*x;
		k.size_ratio += interp.size_ratio*x;
            }
	}
    }
    
    get_model() {
	var m = Mat4.identity();
	var size = 1;
	var subshapes = [];
	var size_stack = [];
	var matrix_stack = [];
	for (let j = 0; j < this.right_hand.length; j++) {
	    var k = this.right_hand[j];
	    var interp = this.interp_vector[j];
	    if (k.to_string() == 'I') {
		size *= k.end_size;
		subshapes.push([m, k.get_model()]);
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
	    else if (k.to_string() == 'v') {
		size = 0;
		subshapes.push([m, k.get_model()]);
	    }
	}
	return new MultiShape(subshapes);
    }
    
    num_segs(i) {
	let num = 0;
	let level = 0;
	for (; i < this.right_hand.length && level >= 0; i++) {
	    if (level == 0 && this.right_hand[i].symbol == 'I') {
		num++;
	    }
	    else if (this.right_hand[i].symbol == 'L(') {
		level++;
	    }
	    else if (this.right_hand[i].symbol == ')') {
		level--;
	    }
	}
	return num;
    }
    
    
    // make rh1 interpolable to rh2 but do not modify rh2 (returns an interpolator vector?)
    // returns a Right Hand which can be summed with interpolable rh1 to produce rh2?
    make_interpolable(i1, rule2, i2) {
	let segi1 = 0;
	let segi2 = 0;
	let level1 = 0;
	let level2 = 0;
	let n_segs1 = this.num_segs(i1);
	let n_segs2 = rule2.num_segs(i2);
	let rh_vector = [];
	while (i1 < this.right_hand.length && i2 < rule2.right_hand.length && level1 >= 0 && level2 >= 0) {//while within rh arrays and levels are >= 0
	    if (segi1 < n_segs2-n_segs1) {
		if (rule2.right_hand[i2].to_string() != ')') {
		    rh_vector.push(rule2.right_hand[i2].no_length_vector());
		    this.right_hand.splice(i1, 0, rule2.right_hand[i2].no_length_copy());
		}
		if (level2 == 0 && rule2.right_hand[i2].to_string() == 'I') {
		    segi1++;
		}
		else if (rule2.right_hand[i2].to_string() == 'L(') {
		    level2++;
		}
		else if (rule2.right_hand[i2].to_string() == ')') {
		    level2--;
		}	    
		i1++;
		i2++;
	    }
	    else {
		//TODO: make the rest of the rh interpolable (right now we just have adding front segments)
		if (this.right_hand[i1].to_string() != ')') {
		    rh_vector.push(this.right_hand[i1].zero_copy());
		}
		else rh_vector.push(this.right_hand[i1]);
		i1++;
	    }
	}
	this.interp_vector = rh_vector;
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


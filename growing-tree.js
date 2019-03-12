//Tree Part - superclass
class GrowingPart {
    constructor(symbol) {
	this.symbol = symbol
    }
    to_string() {
	return this.symbol
    }
}

//Growing Segment - a segment node
class GrowingSegment extends GrowingPart {
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
    
    next_matrix(m) {
	var phi = Mat4.rotation(this.base_phi, Vec.of(0, 1, 0));
        var theta = Mat4.rotation(this.base_theta, Vec.of(0, 0, 1));
        var T = Mat4.translation(Vec.of(0, 0, this.base_length));
        var S = Mat4.scale(Vec.of(this.end_size, this.end_size, this.end_size));
        var tilt = Mat4.rotation(this.end_phi, Vec.of(Math.cos(this.end_theta+Math.PI*1/2), Math.sin(this.end_theta+Math.PI*1/2), 0));
	//let aa = m.times(theta).times(phi).times(T).times(S).times(tilt);
	let aa = m.times(theta);
	let bb = aa.times(phi).times(T).times(S).times(tilt);
        return bb;
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
	return new GrowingSegment(0, this.base_theta, 0, 1, this.end_theta, 0);
    }

    no_length_vector() {
	return new GrowingSegment(this.base_length, 0, this.base_phi, this.end_size-1, 0, this.end_phi);
    }

    zero_copy() {
	return new GrowingSegment(0, 0, 0, 0, 0, 0);
    }

    towards(treeSeg2) {
	return new GrowingSegment(treeSeg2.base_length-this.base_length, treeSeg2.base_theta-this.base_theta,
			       treeSeg2.base_phi-this.base_phi, treeSeg2.end_size-this.end_size,
			       treeSeg2.end_theta-this.end_theta, treeSeg2.end_phi-this.end_phi);
    }

    copy() {
	return new GrowingSegment(this.base_length, this.base_theta, this.base_phi, this.end_size, this.end_theta, this.end_phi);
    }
    
}

//Growing Branch - allows the next segment to come out at an angle form somewhere in the middle of the last segment
class GrowingBranch extends GrowingPart {
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
	return new GrowingBranch(0, this.branch_theta, 0);
    }

    no_length_vector() {
	return new GrowingBranch(this.branch_point, 0, this.size_ratio);
    }

    zero_copy() {
	return new GrowingBranch(0, 0, 0);
    }

    towards(treeBranch2) {
	let theta = treeBranch2.branch_theta - this.branch_theta;
	return new GrowingBranch(treeBranch2.branch_point - this.branch_point,
			      //theta > 0 ? (theta < Math.PI ? theta : -Math.PI*2 + theta) : (theta > -Math.PI ? theta : Math.PI*2 + theta),
			      treeBranch2.branch_theta - this.branch_theta,
			      treeBranch2.size_ratio - this.size_ratio);
    }

    copy() {
	return new GrowingBranch(this.branch_point, this.branch_theta, this.size_ratio);
    }
    
}

class GrowingBranchEnd extends GrowingPart {
    constructor() {
	super(')');
    }
    copy() {
	return new GrowingBranchEnd();
    }
}


/*
!!!!                                                                                                  !!!!
!!!  WARNING: THE CODE BEYOND THIS POINT IS INCOMPREHENSIBLE; DO NOT ATTEMPT TO READ OR UNDERSTAND IT  !!!
!!!!                                                                                                  !!!!
*/


class GrowingRule {
    constructor(max_size, right_hand) {
	this.right_hand = right_hand; //array of
	this.max_size = max_size;
    }
    
    copy() {
	let rh = [];
	for (let i = 0; i < this.right_hand.length; i++) {
	    rh.push(this.right_hand[i].copy());
	}
	return new GrowingRule(this.max_size, rh);   
    }
    
    interpolated_copy(x) {
	//console.log(this.right_hand);
	//console.log(this.interp_vector);
	let rule = this.copy()
	for (let i = 0; i < rule.right_hand.length; i++) {
	    let k = rule.right_hand[i];
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
	return rule;
    }
    
    get_model(x) {
	let cpy = this.interpolated_copy(x);
	var m = Mat4.identity();
	var size = 1;
	var subshapes = [];
	var size_stack = [];
	var matrix_stack = [];
	for (let j = 0; j < cpy.right_hand.length; j++) {
	    var k = cpy.right_hand[j];
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
	    if (level == 0 && (this.right_hand[i].to_string() == 'I' || this.right_hand[i].to_string() == 'v') ) {
		num++;
	    }
	    else if (this.right_hand[i].to_string() == 'L(') {
		level++;
	    }
	    else if (this.right_hand[i].to_string() == ')') {
		level--;
	    }
	}
	return num;
    }
    
    
    // make rh1 interpolable to rh2 but do not modify rh2
    // returns a Right Hand which can be summed with interpolable rh1 to produce rh2
    make_interpolable(rule2) {
	this.private_make_interpolable(0, rule2, 0);
    }	
    private_make_interpolable(i1, rule2, i2) {
	let segi1 = 0;
	let segi2 = 0;
	let level1 = 0;
	let level2 = 0;
	let n_segs1 = this.num_segs(i1);
	let n_segs2 = rule2.num_segs(i2);
	let rh_vector = [];
	
	while (segi1 < n_segs2-n_segs1) {
	    if (rule2.right_hand[i2].to_string() != ')') {
		rh_vector.push(rule2.right_hand[i2].no_length_vector());
		this.right_hand.splice(i1, 0, rule2.right_hand[i2].no_length_copy());
	    }
	    if (level2 == 0 && (rule2.right_hand[i2].to_string() == 'I' || rule2.right_hand[i2].to_string() == 'v')) {
		segi1++;
	    }
	    else if (rule2.right_hand[i2].to_string() == 'L(') {
		level2++;
	    }
	    else if (rule2.right_hand[i2].to_string() == ')') {
		rh_vector.push(rule2.right_hand[i2]);
		this.right_hand.splice(i1, 0, rule2.right_hand[i2]);
		level2--;
	    }	    
	    i1++;
	    i2++;
	}

	while (segi2 < n_segs1-n_segs2) {
	    if (this.right_hand[i1].to_string() != ')') {
		rh_vector.push(this.right_hand[i1].towards(this.right_hand[i1].no_length_copy()));
	    }
	    if (level1 == 0 && (this.right_hand[i1].to_string() == 'I' || this.right_hand[i1].to_string() == 'v')) {
		segi2++;
	    }
	    else if (this.right_hand[i1].to_string() == 'L(') {
		level1++;
	    }
	    else if (this.right_hand[i1].to_string() == ')') {
		rh_vector.push(this.right_hand[i1]);
		level1--;
	    }	    
	    i1++;
	}

	while (i1 < this.right_hand.length && i2 < rule2.right_hand.length) {
	    if (this.right_hand[i1].to_string() == ')' && rule2.right_hand[i2].to_string() == ')' && level1 == 0 && level2 == 0) {
		rh_vector.push(this.right_hand[i1]);
		break;
	    }
	    if ((this.right_hand[i1].to_string() == 'I' || this.right_hand[i1].to_string() == 'v') && (rule2.right_hand[i2].to_string() == 'I' || rule2.right_hand[i2].to_string() == 'v') ) {
		rh_vector.push(this.right_hand[i1].towards(rule2.right_hand[i2]));
		i1++; i2++;
		}
	    else if (this.right_hand[i1].to_string() == 'L(' && rule2.right_hand[i2].to_string() == 'L(') {
		rh_vector.push(this.right_hand[i1].towards(rule2.right_hand[i2]));
		i1++; i2++;
		rh_vector = rh_vector.concat(this.private_make_interpolable(i1, rule2, i2));
		i1 = this.scan_to_end(i1);
		i2 = rule2.scan_to_end(i2);
	    }
	    else if (this.right_hand[i1].to_string() == 'L(' && (rule2.right_hand[i2].to_string() == 'I' || rule2.right_hand[i2].to_string() == 'v') ) {
		rh_vector.push(this.right_hand[i1].towards(this.right_hand[i1].zero_copy()));
		    let current_level = level1;
		level1++; i1++;
		while (level1 > current_level) {
		    if (this.right_hand[i1].to_string() == 'I' || this.right_hand[i1].to_string() == 'v') {
			rh_vector.push(this.right_hand[i1].towards(this.right_hand[i1].zero_copy()));
		    }
		    else if (this.right_hand[i1].to_string() == 'L(') {
			rh_vector.push(this.right_hand[i1].towards(this.right_hand[i1].zero_copy()));
			level1++;
		    }
		    else if (this.right_hand[i1].to_string() == ')') {
			rh_vector.push(this.right_hand[i1]);
			level1--;
		    }
		    i1++;
		}
	    }
	    else if ((this.right_hand[i1].to_string() == 'I' || this.right_hand[i1].to_string() == 'v') && rule2.right_hand[i2].to_string() == 'L(') {
		this.right_hand.splice(i1, 0, rule2.right_hand[i2].no_length_copy());
		i1++;
		rh_vector.push(rule2.right_hand[i2].no_length_vector());
		let current_level = level2;
		level2++; i2++;
		while (level2 > current_level) {
		    if (rule2.right_hand[i2].to_string() == 'I' || rule2.right_hand[i2].to_string() == 'v') {
			this.right_hand.splice(i1, 0, rule2.right_hand[i2].no_length_copy());
			i1++;
			rh_vector.push(rule2.right_hand[i2].no_length_vector());
		    }
		    if (rule2.right_hand[i2].to_string() == 'L(') {
			this.right_hand.splice(i1, 0, rule2.right_hand[i2].no_length_copy());
			i1++;
			rh_vector.push(this.right_hand[i2].no_length_vector());
			level2++;
		    }
		    else if (rule2.right_hand[i2].to_string() == ')') {
			this.right_hand.splice(i1, 0, rule2.right_hand[i2]);
			i1++;
			rh_vector.push(rule2.right_hand[i2]);
			level2--;
		    }
		    i2++;
		}
	    }
	    else {
		rh_vector.push(this.right_hand[i1]);
		i1++;
		i2++;
	    }
	}

	this.interp_vector = rh_vector;
	return rh_vector;
    }

    scan_to_end(i) {
	let level = 0;
	while (i < this.right_hand.length) {
	    if (this.right_hand[i].to_string() == 'L(') {
		level++;
	    }
	    else if (this.right_hand[i].to_string() == ')') {
		if (level == 0) {
		    return i+1;
		}
		level--;
	    }
	    i++;
	}
    }
	
}

//rules should increase in max_size from left to right
class GrowingTree {
    constructor(rules, leaf_model, leaf_mat, seg_mat) {
	this.rules = rules; //an array of arrays of size two; rules[i][0] should correspond to a max-size and rules[i][1] should correspond to a rule/lefthand
	this.leaf_model = leaf_model;
	this.leaf_mat = leaf_mat;
	this.seg_mat = seg_mat;
    }

    init(gl) {
	this.gl = gl;
	for (let i = 0; i < this.rules.length; i++) {
	    if (i != 0) {
		this.rules[i].make_interpolable(this.rules[i-1]);
	    }
	}
    }
    
    get_model() {
	let dat = this.private_get_model(1, Mat4.identity());
	return new ComplexShape(this.gl,
				[[new MultiShape(dat.segments), this.seg_mat],
				 [new MultiShape(dat.leaves), this.leaf_mat]]);
    }
    
    private_get_model(size, m) {
	var segments = [];
	var leaves = [];
	var size_stack = [];
	var matrix_stack = [];
	for (let i = 0; i < this.rules.length; i++) {
	    if (size <= this.rules[i].max_size) {
		let rule_depth = 0;
		let rule = this.rules[i];
		if (i != 0) {
		    rule_depth = 1 - (size-this.rules[i-1].max_size)/(this.rules[i].max_size-this.rules[i-1].max_size);
		    rule = this.rules[i].interpolated_copy(rule_depth);
		}
		for (let j = 0; j < this.rules[i].right_hand.length; j++) {
		    var k = rule.right_hand[j];
		    if (k.to_string() == 'I') {
			size *= k.end_size;
			segments.push([m, k.get_model()]);
			m = k.next_matrix(m);
			if (j == this.rules[i].right_hand.length-1) {
			    let temret = this.private_get_model(size, m);
			    segments = segments.concat(temret.segments);
			    leaves = leaves.concat(temret.leaves);
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
			    let temret = this.private_get_model(size, m);
			    segments = segments.concat(temret.segments);
			    leaves = leaves.concat(temret.leaves);
			}
			size = size_stack.pop();
			m = matrix_stack.pop();
		    }
		    else if (k.to_string() == 'v') {
			size = 0;
			let s = 5;
			let S = Mat4.scale(Vec.of(s, s, s));
			leaves.push([m.times(S), this.leaf_model]);
			S = Mat4.scale(Vec.of(-1*s, s, s));
			leaves.push([m.times(S), this.leaf_model]);
			segments.push([m, k.get_model()]);
		    }
		}
		break;
	    }
	}
	return {
	    segments: segments,
	    leaves: leaves
	};
    }
    
    
}


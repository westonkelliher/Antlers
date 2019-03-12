//Static Part - superclass
class StaticPart {
    constructor(symbol) {
	this.symbol = symbol
    }
    to_string() {
	return this.symbol
    }
}

//Static Segment - a segment node
class StaticSegment extends StaticPart {
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
        return m.times(theta).times(phi).times(T).times(S).times(tilt);
    }
    
    get_model() {
	return new this.model_type(this.base_length, this.base_theta, this.base_phi, this.end_size, this.end_theta, this.end_phi);
    }
}

//Static Branch - allows the next segment to come out at an angle form somewhere in the middle of the last segment
class StaticBranch extends StaticPart {
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

class StaticBranchEnd extends StaticPart {
    constructor() {
	super(')');
    }
}


class StaticRule {
    constructor(max_size, right_hand) {
	this.right_hand = right_hand; //array of
	this.max_size = max_size;
    }


}

//rules should increase in max_size from left to right
class StaticTree {
    constructor(rules, leaf_model, leaf_mat, seg_mat) {
	this.rules = rules; //an array of arrays of size two; rules[i][0] should correspond to a max-size and rules[i][1] should correspond to a rule/lefthand
	this.leaf_model = leaf_model;
	this.leaf_mat = leaf_mat;
	this.seg_mat = seg_mat;
    }
    
    init(gl) {
	this.gl = gl;
    }
    


    //Basically we're currying here
    get_model() {
	let dat = this.private_get_model(1, Mat4.identity());

	console.log(dat.leaves);
	return new ComplexShape(this.gl,
				[[new MultiShape(dat.segments), this.seg_mat],
				[new MultiShape(dat.leaves), this.leaf_mat]]);
    }
    
    private_get_model(size, m) {
	var segments = [];
	var leaves = [];
	var size_stack = [];
	var matrix_stack = [];
	console.log('2');
	for (let i = 0; i < this.rules.length; i++) {
	    if (size <= this.rules[i].max_size) {
		for (let j = 0; j < this.rules[i].right_hand.length; j++) {
		    var k = this.rules[i].right_hand[j];
		    if (k.to_string() == 'I') {
			size *= k.end_size;
			segments.push([m, k.get_model()]);
			m = k.next_matrix(m);
			if (j == this.rules[i].right_hand.length-1) {
			    console.log('3');
			    segments = segments.concat(this.private_get_model(size, m).segments);
			    leaves = leaves.concat(this.private_get_model(size, m).leaves);
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
			    console.log('4');
			    segments = segments.concat(this.private_get_model(size, m).segments);
			    leaves = leaves.concat(this.private_get_model(size, m).leaves);
			}
			size = size_stack.pop();
			m = matrix_stack.pop();
		    }
		    else if (k.to_string() == 'v') {
			size = 0;
			let T = Mat4.translation(Vec.of(0, 0, 1));
			console.log('leaf_push'+this.leaf_model);
			leaves.push([m, this.leaf_model]);
			segments.push([m, k.get_model()]);
		    }
		}
		break;
	    }
	}
	console.log('ret');
	return {
	    segments: segments,
	    leaves: leaves
	};
    }
    
    
}


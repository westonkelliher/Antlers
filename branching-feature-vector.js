class BranchingFeatureVector {

    // a null features means this BFV represents a value
    // a valid features means this BFV represents a feature vector
    constructor(x) {
    	console.log(typeof(x));
	if (typeof(x) != 'number' && typeof(x) != 'array') {
	    throw "BFV must be constructed with number or array"
	}
	this.value = x;
    }

    is_value() {
	return typeof(this.value) == 'number';
    }

    is_vector() {
	return typeof(this.value) == 'array';
    }

    
    get_value() {
	if (typeof(this.value) != 'number')
	    throw "BFV treated as value when it is a feature vector"
	return this.value;
    }
    

    get_feature(i) {
	if (typeof(this.value) != 'array')
	    throw "BFV treated as feature vector when it is a value";
	return this.vector[i];
    }

    add(x) {
	if (this.is_value())
	    throw "cannot element to value";
	this.value.push(x);
    }

    multiply_by(x) {
	if (this.is_end) {
	    //do nothing
	}
	else if (this.is_value()) {
	    this.value *= x;
	}
	else if (this.is_vector()) {
	    for (let i in this.value) {
		i.multiply_by(x);
	    }
	}
    }

    copy() {
	var BFV;
	if (this.is_value()) {
	     BFV = new BranchingFeatureVector(this.value);
	}
	else if (this.is_vector()) {
	    BFV = new BranchingFeatureVector([]);
	    for (let i in this.value) {
		BFV.add(i.copy());
	    }
	}
	return BFV;
    }
    
}


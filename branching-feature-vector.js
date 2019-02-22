class BranchingFeatureVector {

    // a null features means this BFV represents a value
    // a valid features means this BFV represents a feature vector
    constructor(x) {
	if (typeof(x) == 'number') {
	    this.value = x;
	}
	else if (Array.isArray(x)){
	    this.value = [];
	    for (let i = 0; i < x.length; i++) {
		this.add(new BranchingFeatureVector(x[i]));
	    }
	}
	else
	    throw "attempt to construct BFV with value other than number or array"
    }

    is_value() {
	return typeof(this.value) == 'number';
    }

    
    get_value() {
	if (typeof(this.value) != 'number')
	    throw "BFV treated as value when it is a feature vector"
	return this.value;
    }
    

    add(x) {
	if (this.is_value())
	    throw "cannot element to value";
	this.value.push(x);
    }

    multiply_by(x) {
	if (this.is_value()) {
	    this.value *= x;
	}
	else {
	    for (let i = 0; i < this.value.length; i++) {
		this.value[i].multiply_by(x);
	    }
	}
    }

    copy() {
	var BFV;
	if (this.is_value()) {
	     BFV = new BranchingFeatureVector(this.value);
	}
	else {
	    BFV = new BranchingFeatureVector([]);
	    for (let i = 0; i < this.value.length; i++) {
		BFV.add(this.value[i].copy());
	    }
	}
	return BFV;
    }

    to_string() {
	var sumstr = "";
	if (this.is_value()) {
	    sumstr = this.value.toString();
	}
	else {
	    sumstr = "v(";
	    for (let i = 0; i < this.value.length; i++) {
		sumstr += " "+this.value[i].to_string();
	    }
	    sumstr += " )";
	}
	return sumstr;
    }
}


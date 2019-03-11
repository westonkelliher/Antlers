
//static trees

class SavedTrees {
    constructor() {
	this.spike_tree_1 = this.get_spike_tree(.95);
	this.spike_tree_2 = this.get_spike_tree(.9);
	this.spike_tree_3 = this.get_spike_tree(.85);
	this.spike_tree_4 = this.get_spike_tree(.8);
	this.spike_tree_5 = this.get_spike_tree(.75);
	this.spike_tree_6 = this.get_spike_tree(.7);
	this.spike_tree_7 = this.get_spike_tree(.65);
    }
    
    get_spike_tree(b_c) {
	let end = new StaticBranchEnd();
    
	let spike0 = new StaticSegment(6, Math.PI*0, -Math.PI*1/8);

        let segA1 = new StaticSegment(4, Math.PI*24/23, Math.PI*.03, .95, Math.PI*0, Math.PI*1/8);
        let branchA2 = new StaticBranch(2, Math.PI*0, .95);
        let segA2 = new StaticSegment(4, Math.PI*23/17, Math.PI*1/3, .85, Math.PI*1, Math.PI*1/11);
        let segA3 = new StaticSegment(5, Math.PI*10/7, Math.PI*0, .85, Math.PI*1, Math.PI*1/9);
        let branchA4 = new StaticBranch(1, Math.PI*.1, .25);

        let branchB1 = new StaticBranch(-.2, Math.PI*0, .69);
        let branchB2 = new StaticBranch(-.2, Math.PI*2/5, .7);
        let branchB3 = new StaticBranch(-.2, Math.PI*4/5, .71);
        let branchB4 = new StaticBranch(-.2, Math.PI*6/5, .73);
        let branchB5 = new StaticBranch(-.2, Math.PI*8/5, .72);

        let segC1 = new StaticSegment(4, Math.PI*7/20, Math.PI*-1/11, .95, Math.PI*1, Math.PI*1/9);
        let segC2 = new StaticSegment(4, Math.PI*-1/15, Math.PI*2/15, .9, Math.PI*1, Math.PI*-1/9);
        let branchC = new StaticBranch(1, Math.PI*.1, .4);

        let ruleA = new StaticRule(1, [branchA2, segA2, end, segA1, branchA4, end, segA3]);
        let ruleB = new StaticRule(b_c, [branchB1, end, branchB2, end,
                                            branchB3, end, branchB4, end, branchB5, end])
        let ruleC = new StaticRule(b_c, [segC1, branchC, end, segC2]);
        let ruleD = new StaticRule(b_c*b_c*.6, [segC1, segC2, spike0]);
        let ruleE = new StaticRule(b_c*b_c, [branchA2, segA2, end, segA1, segA3]);

        let tree_prod = new StaticTree([ruleD, ruleE, ruleC, ruleA]);
	return tree_prod.get_model();
    }


}



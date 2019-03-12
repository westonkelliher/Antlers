
//static trees

class SavedTrees {
    constructor(context) {
	this.gl = context.gl;
	this.leaf_model_1 = new Leaf(.1, 10);
	this.light_brown = context.get_instance(Phong_Shader).material(Color.of(.9, .7, .4, 1), {
	    ambient: .4,
	    diffusivity: .4,
	    specularity: .1
	});
	this.light_green = context.get_instance(Phong_Shader).material(Color.of(.5, .9, .5, 1), {
	    ambient: .4,
	    diffusivity: .4
	});

	this.spike_tree_1 = this.get_spike_tree(.95);
	this.spike_tree_2 = this.get_spike_tree(.9);
	this.spike_tree_3 = this.get_spike_tree(.85);
	this.spike_tree_4 = this.get_spike_tree(.8);
	this.spike_tree_5 = this.get_spike_tree(.75);
	this.spike_tree_6 = this.get_spike_tree(.7);
	this.spike_tree_7 = this.get_spike_tree(.65);
	this.cont_tree_1 = this.get_cont1_tree(.5);
	this.cont_tree_2 = this.get_cont1_tree(.45);
	this.cont_tree_3 = this.get_cont1_tree(.4);
	this.cont_tree_4 = this.get_cont1_tree(.35);
	this.cont_tree_5 = this.get_cont1_tree(.3);
	this.cont_tree_6 = this.get_cont1_tree(.25);
	this.cont_tree_7 = this.get_cont1_tree(.2);

	this.big_cont_tree_1 = this.get_big_cont_tree(.6);
	this.big_cont_tree_2 = this.get_big_cont_tree(.55);
	this.big_cont_tree_3 = this.get_big_cont_tree(.5);
	this.big_cont_tree_4 = this.get_big_cont_tree(.45);
	this.big_cont_tree_5 = this.get_big_cont_tree(.4);
	this.big_cont_tree_6 = this.get_big_cont_tree(.35);
	this.big_cont_tree_7 = this.get_big_cont_tree(.3);
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

        let tree_prod = new StaticTree([ruleD, ruleE, ruleC, ruleA], this.leaf_model_1, this.light_green, this.light_brown);
		tree_prod.init(this.gl);
	return tree_prod.get_model();
    }

    get_cont1_tree(b_c) {
	var end = new GrowingBranchEnd();

        var seg0 = new GrowingSegment(0, 0, 0, 1, 0 ,0);
        var branch0 = new GrowingBranch(0, 0, 0);
        var spike1 = new GrowingSegment(4, 0, 0, 0, 0, 0);
        var spike2 = new GrowingSegment(7, 0, 0, 0, 0, 0);

        var seg1 = new GrowingSegment(4, Math.PI*0, Math.PI*-.15, .87, -Math.PI*0, Math.PI*0);
        var seg2 = new GrowingSegment(4, Math.PI*0, Math.PI*0, .87, Math.PI*0, -Math.PI*0);
        var seg3 = new GrowingSegment(4, -Math.PI*.7, Math.PI*.05, .87, Math.PI*0, Math.PI*.2);
        var seg4 = new GrowingSegment(6, Math.PI*.2, -Math.PI*.05, .5, Math.PI*0, Math.PI*0);

        var branch1 = new GrowingBranch(2, Math.PI*.9, .75);
        var branch3 = new GrowingBranch(2, Math.PI*0, .5);

        var ruleA = new GrowingRule(1, [branch1, seg1, end, seg2, branch3, end, seg3]);
        var ruleB = new GrowingRule(b_c, [branch1, seg1, end, seg2, seg3])
        var ruleC = new GrowingRule(b_c*b_c, [seg4, spike2]);

        var tree_prod = new GrowingTree([ruleC, ruleB, ruleA], this.leaf_model_1, this.light_green, this.light_brown);
        tree_prod.init(this.gl);

	return tree_prod.get_model();
    }


    
    get_big_cont_tree(b_c) {
	var end = new GrowingBranchEnd();

        var seg0 = new GrowingSegment(0, 0, 0, 1, 0 ,0);
        var branch0 = new GrowingBranch(0, 0, 0);
        var spike1 = new GrowingSegment(4, 0, 0, 0, 0, 0);
        var spike2 = new GrowingSegment(7, 0, 0, 0, 0, 0);

        var seg1 = new GrowingSegment(4, Math.PI*0, Math.PI*-.15, .92, -Math.PI*0, Math.PI*0);
        var seg2 = new GrowingSegment(4, Math.PI*0, Math.PI*0, .92, Math.PI*0, -Math.PI*0);
        var seg3 = new GrowingSegment(4, -Math.PI*.7, Math.PI*.05, .92, Math.PI*0, Math.PI*.2);
        var seg4 = new GrowingSegment(6, Math.PI*.2, -Math.PI*.05, .6, Math.PI*0, Math.PI*0);

        var branch1 = new GrowingBranch(2, Math.PI*.9, .8);
        var branch3 = new GrowingBranch(2, Math.PI*0, .6);

        var ruleA = new GrowingRule(1, [branch1, seg1, end, seg2, branch3, end, seg3]);
        var ruleB = new GrowingRule(b_c, [branch1, seg1, end, seg2, seg3])
        var ruleC = new GrowingRule(b_c*b_c, [seg4, spike2]);

        var tree_prod = new GrowingTree([ruleC, ruleB, ruleA], this.leaf_model_1, this.light_green, this.light_brown);
        tree_prod.init(this.gl);

	return tree_prod.get_model();
    
    }

}

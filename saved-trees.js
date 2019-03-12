
//static trees

class SavedTrees {
    constructor(context) {
	this.gl = context.gl;
	this.leaf_model_1 = new Leaf(.1, 10);
	this.light_brown = context.get_instance(Phong_Shader).material(Color.of(.9, .7, .3, 1), {
	    ambient: .4,
	    diffusivity: .4,
	    specularity: .1
	});
	this.dark_brown = context.get_instance(Phong_Shader).material(Color.of(.5, .3, .0, 1), {
	    ambient: .4,
	    diffusivity: .4,
	    specularity: .1
	});
	this.light_green = context.get_instance(Phong_Shader).material(Color.of(.3, .9, .3, 1), {
	    ambient: .4,
	    diffusivity: .4,
	    specularity: .3
	});
	this.dark_green = context.get_instance(Phong_Shader).material(Color.of(.05, .45, .15, 1), {
	    ambient: .4,
	    diffusivity: .4,
	    specularity: .3
	});
	this.yellow_green = context.get_instance(Phong_Shader).material(Color.of(.7, .8, .2, 1), {
	    ambient: .4,
	    diffusivity: .4,
	    specularity: .3
	});

	this.spike_tree_1 = this.get_spike_tree(.95);

	
	this.spike_tree_2 = this.get_spike_tree(.9);
	this.big_cont_tree_1 = this.get_big_cont_tree(.8);


	this.wu1 = this.get_spike_tree(.97);
	this.wu2 = this.get_spike_tree(.96);
	this.wu3 = this.get_spike_tree(.95);
	this.wu4 = this.get_cont1_tree(.80);
	this.wu5 = this.get_spike_tree(.94);
	this.wu6 = this.get_cont1_tree(.75);
	this.wu7 = this.get_cont1_tree(.70);
	this.wu8 = this.get_spike_tree(.93);
	this.wu9 = this.get_spike_tree(.92);
	this.wu10 = this.get_cont1_tree(.62);
	this.wu11 = this.get_spike_tree(.91);
	this.wu12 = this.get_cont1_tree(.60);
	this.wu13 = this.get_cont1_tree(.58);
	this.wu14 = this.get_cont1_tree(.56);
	this.wu15 = this.get_spike_tree(.90);
	this.wu16 = this.get_spike_tree(.89);
	this.wu17 = this.get_cont1_tree(.54);
	this.wu18 = this.get_cont1_tree(.52);
	this.wu19 = this.get_spike_tree(.88);
	this.wu20 = this.get_spike_tree(.87);

	//                    scale, x, y, model
	this.walk_up_trees = [[.05, 0, 0, this.wu1],
			      [.06, .6, .5, this.wu2],
			      [.08, .8, -.2, this.wu3],
			      [.14, -.3, .5, this.wu4],
			      [.10, .2, .8, this.wu5],
			      [.17, .4, 9, this.wu6],
			      [.18, -.7, .4, this.wu7],
			      [.14, .8, -.9, this.wu8],
			      [.13, -.6, -.2, this.wu9],
			      [.20, .2, -.9, this.wu10],
			      [.16, -.9, .5, this.wu11],
			      [.23, .8, -.1, this.wu12],
			      [.24, .6, .1, this.wu13],
			      [.25, -.4, -.2, this.wu14],
			      [.20, -.7, -.2, this.wu15],
			      [.21, .6, .01, this.wu16],
			      [.30, -.3, -.3, this.wu17],
			      [.31, -.9, -.8, this.wu18],
			      [.24, .4, .7, this.wu19],
			      [.25, .5, .2, this.wu20],
			      

			     ];

	this.grower = [];

	let ntime = 40;
	let fps = 10;
	let start_c = .9;
	let end_c = .35;
	for (let i = 0; i < ntime*fps; i++) {
	    this.grower.push(this.get_big_cont_tree(start_c - (start_c-end_c)*i/(ntime*fps)));
	}
	
	
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

        let tree_prod = new StaticTree([ruleD, ruleE, ruleC, ruleA], this.leaf_model_1, this.dark_green, this.dark_brown);
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

        var tree_prod = new GrowingTree([ruleC, ruleB, ruleA], this.leaf_model_1, this.yellow_green, this.light_brown);
        tree_prod.init(this.gl);

	return tree_prod.get_model();
    }


    
    get_big_cont_tree(b_c) {
	var end = new GrowingBranchEnd();

        var seg0 = new GrowingSegment(0, 0, 0, 1, 0 ,0);
        var branch0 = new GrowingBranch(0, 0, 0);
        var spike1 = new GrowingSegment(6, 0, 0, 0, 0, 0);
        var spike2 = new GrowingSegment(8, 0, 0, 0, 0, 0);

        var seg1 = new GrowingSegment(5, Math.PI*0, Math.PI*-.15, .92, -Math.PI*0, -Math.PI*.01);
        var seg2 = new GrowingSegment(5, Math.PI*0, Math.PI*0, .92, Math.PI*0, Math.PI*.01);
        var seg3 = new GrowingSegment(6, -Math.PI*.7, Math.PI*.05, .92, Math.PI*0, Math.PI*.2);
        var seg4 = new GrowingSegment(9, Math.PI*.2, -Math.PI*.05, .6, Math.PI*0, Math.PI*0);

        var branch1 = new GrowingBranch(3, Math.PI*.9, .8);
        var branch3 = new GrowingBranch(3, Math.PI*0, .6);

        var seg1b = new GrowingSegment(6, Math.PI*.1, Math.PI*-.12, .9, -Math.PI*0, Math.PI*.01);
        var seg2b = new GrowingSegment(6, -Math.PI*.1, Math.PI*.03, .9, Math.PI*.05, -Math.PI*.01);
        var seg3b = new GrowingSegment(6, -Math.PI*.75, Math.PI*.05, .92, -Math.PI*.05, Math.PI*.2);

        var ruleA = new GrowingRule(1, [branch1, seg1, end, seg2, branch3, end, seg3]);
        var ruleB = new GrowingRule(b_c, [branch1, seg1b, end, seg2b, seg3b])
        var ruleC = new GrowingRule(b_c*b_c, [branch1, spike1, end, seg4, spike2]);

        var tree_prod = new GrowingTree([ruleC, ruleB, ruleA], this.leaf_model_1, this.light_green, this.light_brown);
        tree_prod.init(this.gl);
	return tree_prod.get_model();
    
    }

}

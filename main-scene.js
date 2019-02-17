class object_3d {
    
}


class Assignment_One_Scene extends Scene_Component {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);

        this.cont = context;
        this.GS = null;
        // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        // Locate the camera here (inverted matrix).
        const r = context.width / context.height;
        context.globals.graphics_state.camera_transform = Mat4.translation([0, 0, -35]);
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

        const shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4),
            'prism': new TriangularPrism()
        }
        this.submit_shapes(context, shapes);

        // Make some Material objects available to you:
        this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .6, .9, 1), {
            ambient: .4,
            diffusivity: .4
        });
        this.plastic = this.clay.override({
            specularity: .6
        });
        
        this.lights = [new Light(Vec.of(10, 10, 20, 1), Color.of(1, .4, 1, 1), 100000)];

        this.blue = Color.of(.05, .05, 1, 1);
        this.yellow = Color.of(1, 1, 0, 1);
        this.green = Color.of(0, 1, 0, 1);
        this.gray = Color.of(.5, .5, .5, 1);
        this.red = Color.of(1, 0, 0, 1)
        this.dull_red = Color.of(.65, .1, .1, 1);
        this.dull_green =Color.of(.1, .6, .1, 1);
        this.dull_blue = Color.of(.15, .15, .65, 1);
        this.dark = Color.of(.2, .25, .2, 1);
        this.brown = Color.of(.4, .3, .25, 1);
        this.orange = Color.of(1, .7, 0, 1);
        this.white = Color.of(1, 1, .8, 1);

        this.t = 0;



        var open = new TreeOpenning();
        var end = new TreeBranchEnd();
        
        var spike0 = new TreeSpike(Math.PI*0, 6, Math.PI*0, -Math.PI*1/8);
        
        var segA1 = new TreeSegment(Math.PI*21/23, 4, Math.PI*0, Math.PI*0, .95, Math.PI*0, Math.PI*1/8);
        var branchA2 = new TreeBranch(1.5, Math.PI*0, .95);
        var segA2 = new TreeSegment(Math.PI*0, 3, Math.PI*1, Math.PI*1/5, .8, Math.PI*1, Math.PI*1/11);
        //openA2
        //endA2
        var segA3 = new TreeSegment(Math.PI*10/7, 5, Math.PI*0, Math.PI*0, .8, Math.PI*1, Math.PI*1/9);
        //openA3
        
        var branchB1 = new TreeBranch(0, Math.PI*0, .69);
        var branchB2 = new TreeBranch(0, Math.PI*2/5, .7);
        var branchB3 = new TreeBranch(0, Math.PI*4/5, .71);
        var branchB4 = new TreeBranch(0, Math.PI*6/5, .73);
        var branchB5 = new TreeBranch(0, Math.PI*8/5, .72);

        var segC1 = new TreeSegment(Math.PI*1/20, 4, Math.PI*0, Math.PI*-1/5, .9, Math.PI*1, Math.PI*2/9);
        var segC2 = new TreeSegment(Math.PI*-1/15, 4, Math.PI*0, Math.PI*-1/15, .7, Math.PI*1, Math.PI*-3/9);
        

        var b_c = .15;
        var ruleA = new TreeProductionRule(1, [branchA2, segA2, open, end, segA1, segA3, open]);
        var ruleB = new TreeProductionRule(b_c, [branchB1, open, end, branchB2, open, end, 
                                            branchB3, open, end, branchB4, open, end, branchB5, open, end])
        var ruleC = new TreeProductionRule(b_c*.8, [segC1, segC2, spike0]);

        
        
        var tree_prod = new TreeProduction([ruleC, ruleB, ruleA]);
        /*
        tree_prod.add_rule(b_c*.75*.63, ruleC);
        tree_prod.add_rule(b_c*.75, ruleB);
        tree_prod.add_rule(b_c, ruleA);
        */

        this.tree_model = tree_prod.get_model();
        this.tree_model.copy_onto_graphics_card(context.gl);
    }


    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    make_control_panel() {
        this.key_triggered_button("Hover in Place", ["m"], () => {
            this.hover = !this.hover;
        });
        this.key_triggered_button("Pause Time", ["n"], () => {
            this.paused = !this.paused;
        });
    }

    //give the matrix 

    draw_axes(graphics_state, distance) {
        var T; var R; var S; var M;
        //draw axis cubes
        T = Mat4.translation( Vec.of( 0, 0, 0 ) );
        S = Mat4.scale( Vec.of( .1, .1, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(graphics_state, M, this.clay.override({color: this.gray})); // center
        T = Mat4.translation( Vec.of( distance, 0, 0 ) );
        S = Mat4.scale( Vec.of( .5, .1, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(graphics_state, M, this.clay.override({color: this.red})); // +x
        T = Mat4.translation( Vec.of( -distance, 0, 0 ) );
        S = Mat4.scale( Vec.of( .5, .1, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(graphics_state, M, this.clay.override({color: this.dull_red})); // -x
        T = Mat4.translation( Vec.of( 0, distance, 0 ) );
        S = Mat4.scale( Vec.of( .1, .5, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(graphics_state, M, this.clay.override({color: this.green})); // +y
        T = Mat4.translation( Vec.of( 0, -distance, 0 ) );
        S = Mat4.scale( Vec.of( .1, .5, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(graphics_state, M, this.clay.override({color: this.dull_green})); // -y
        T = Mat4.translation( Vec.of( 0, 0, distance ) );
        S = Mat4.scale( Vec.of( .1, .1, .5 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(graphics_state, M, this.clay.override({color: this.blue})); // +z
        T = Mat4.translation( Vec.of( 0, 0, -distance ) );
        S = Mat4.scale( Vec.of( .1, .1, .5 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(graphics_state, M, this.clay.override({color: this.dull_blue})); // -z
    }

    display(graphics_state) {
        this.GS = graphics_state;
        graphics_state.lights = this.lights;


        let m = Mat4.identity();
                
        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;

        
        
        var T; var R; var S; var M;

        this.draw_axes(graphics_state, 12);

        R = Mat4.rotation(-Math.PI*1/2, Vec.of(1, 0, 0));
        this.tree_model.draw(graphics_state, R, this.clay.override({color: this.white}));
    }
}

window.Assignment_One_Scene = window.classes.Assignment_One_Scene = Assignment_One_Scene;

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


        var spike0 = new TreeSpike(Math.PI*0, 4, Math.PI*0, Math.PI*0);
        var segA1 = new TreeSegment(Math.PI*5/23, 3, Math.PI*0, Math.PI*0, .9, Math.PI*0, Math.PI*1/8);
        var branchA2 = new TreeBranch(.4, Math.PI*0, .95);
        var segA2 = new TreeSegment(Math.PI*0, 4, Math.PI*1, Math.PI*1/4, .7, Math.PI*1, Math.PI*1/11);
        var openA2 = new TreeOpenning();
        var branch_endA2 = new TreeBranchEnd();
        var segA3 = new TreeSegment(Math.PI*1/7, 4, Math.PI*0, Math.PI*0, .7, Math.PI*1, Math.PI*2/9);
        var openA3 = new TreeOpenning();

        var rule1 = new TreeProductionRule(1, [segA1, branchA2, segA2, openA2, branch_endA2, segA3, openA3]);

        var tree_prod = new TreeProduction(spike0);
        tree_prod.add_rule(.1, rule1);

        var tree = tree_prod.generate_tree(1);
        console.log(tree.to_string());
        this.tree_prod = tree_prod;
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


        this.tree_prod.create_shapes(graphics_state, this.cont.gl, this.clay.override({color: this.white})); //TODO: do this once not every frame
        this.tree_prod.draw_tree(1, graphics_state, m);

    }
}

window.Assignment_One_Scene = window.classes.Assignment_One_Scene = Assignment_One_Scene;

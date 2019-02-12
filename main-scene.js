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


    draw_segment(seg, m) {
        seg.draw(this.GS, m, this.clay.override({color: this.white}));
    }

    get_segment_matrix(base_length, base_theta, base_phi, end_size, end_theta, end_phi) {
        var end_tilt = Mat4.rotation(end_phi, Vec.of(Math.cos(end_theta+Math.PI*1/2), Math.sin(end_theta+Math.PI*1/2), 0));
        var lengthwise_tilt = Mat4.rotation(base_phi, Vec.of(Math.cos(base_theta+Math.PI*1/2), Math.sin(base_theta+Math.PI*1/2), 0));
        var length_T = Mat4.translation(Vec.of(0, 0, base_length));
        var end_S = Mat4.scale(Vec.of(end_size, end_size, end_size));
        return Mat4.identity().times(lengthwise_tilt).times(length_T).times(end_tilt).times(end_S);
    }

    create_segment(m) {
        var seg = new Segment(m);
        seg.copy_onto_graphics_card(this.cont.gl);
        return seg;
    }

    create_spike(m) {
        var spike = new Spike(m);
        spike.copy_onto_graphics_card(this.cont.gl);
        return spike;
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

    }
}

window.Assignment_One_Scene = window.classes.Assignment_One_Scene = Assignment_One_Scene;

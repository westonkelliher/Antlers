class Assignment_Two_Skeleton extends Scene_Component {
    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);
        this.cont = context;
        // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

        // Locate the camera here (inverted matrix).
        const r = context.width / context.height;
        context.globals.graphics_state.camera_transform = Mat4.translation([0, 0, -35]);
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

        // At the beginning of our program, load one of each of these shape
        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
        // design.  Once you've told the GPU what the design of a cube is,
        // it would be redundant to tell it again.  You should just re-use
        // the one called "box" more than once in display() to draw
        // multiple cubes.  Don't define more than one blueprint for the
        // same thing here.
        const shapes = {
            'square': new Square(),
            'circle': new Circle(15),
            'pyramid': new Tetrahedron(false),
            'simplebox': new SimpleCube(),
            'box': new Cube(),
            'cylinder': new Cylinder(15),
            'cone': new Cone(20),
            'ball': new Subdivision_Sphere(4),
	    	'rock': new Rock(1),
	    	'apple': new Apple()
        }
        this.submit_shapes(context, shapes);
        this.shape_count = Object.keys(shapes).length;

        // Make some Material objects available to you:
        this.oranges = context.get_instance(Phong_Shader).material(Color.of(.3, .3, .8, 1), {
	    	ambient: .4,
	    	diffusivity: .4
		});
        this.clay = context.get_instance(Phong_Shader).material(Color.of(.75, .55, .45, 1), {
            ambient: .4,
            diffusivity: .4
        });
        this.plastic = this.clay.override({
            specularity: .6
        });
        this.texture_base = context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {
            ambient: 1,
            diffusivity: 0.4,
            specularity: 0.3
        });
        this.bone = context.get_instance(Phong_Shader).material(Color.of(.95, .95, .9, 1), {
            ambient: .4,
            diffusivity: .45,
            specularity: .1
        });
        this.red = context.get_instance(Phong_Shader).material(Color.of(.9, .3, .2, 1), {
            ambient: .4,
            diffusivity: .45,
            specularity: .1
        });

        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures = {

        };
        for (let t in shape_textures)
            this.shape_materials[t] = this.texture_base.override({
                texture: context.get_instance(shape_textures[t])
            });
        
        this.lights = [new Light(Vec.of(10, 10, 20, 1), Color.of(1, .4, 1, 1), 100000)];

        this.t = 0;

        this.initialize_demo();
    }


    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    make_control_panel() {
        this.key_triggered_button("Pause Time", ["n"], () => {
            this.paused = !this.paused;
        });
    }


    initialize_demo() {
        this.saved_trees = new SavedTrees(this.cont);

        this.saved_trees.spike_tree_1.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_3.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_5.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_7.copy_onto_graphics_card(this.cont.gl);

        let T1 = Mat4.translation(Vec.of(0, -100, 0));
	// this.draw_walk_ups(T1); // no static trees for this demo

	this.draw_grower(m, t%21);

	// camera control
	let duration = 21;
	if (!this.paused) {
	    this.control_camera_1(t%duration, duration)
	}
    }

    


    play_demo(t) {
        let m = Mat4.rotation(-Math.PI*.5, Vec.of(1, 0, 0)).times(Mat4.scale(.0625, .0625, .0625));
        
        let T = Mat4.translation(Vec.of(200, 0, 0));
	let s = 1.6;
	let S = Mat4.scale(Vec.of(s, s, s));
        this.saved_trees.spike_tree_1.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.spike_tree_3.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.spike_tree_5.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.spike_tree_7.complex_draw(m, this.gs);

        m = Mat4.rotation(-Math.PI*.5, Vec.of(1, 0, 0)).times(Mat4.scale(.25, .25, .25));
        m = m.times(Mat4.translation(Vec.of(0, 60, 0)));
        T = Mat4.translation(Vec.of(50, 0, 0));
        
        this.saved_trees.cont_tree_1.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.cont_tree_3.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.cont_tree_5.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.cont_tree_7.complex_draw(m, this.gs);

        m = Mat4.rotation(-Math.PI*.5, Vec.of(1, 0, 0)).times(Mat4.scale(.25, .25, .25));
        m = m.times(Mat4.translation(Vec.of(0, 160, 0)));
        T = Mat4.translation(Vec.of(50, 0, 0));
        
        this.saved_trees.big_cont_tree_1.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.big_cont_tree_3.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.big_cont_tree_5.complex_draw(m, this.gs);
        m = m.times(T).times(S);
        this.saved_trees.big_cont_tree_7.complex_draw(m, this.gs);
   
	
    }


    reset_cam() {
	this.gs.camera_transform = Mat4.identity();
	this.cam_mult(Mat4.rotation(Math.PI*.5, Vec.of(-1, 0, 0)));
    }
    cam_mult(m) {
	this.gs.camera_transform = this.gs.camera_transform.times(m);
    }
    from_to(start, end, t, duration) {
	return start+(end-start)*(t/duration);
    }
    control_camera_1(t, duration) {
        let start_height = 1;
        let end_height = 10;
        let start_dist = 4;
        let end_dist = 27;
        let start_theta = Math.PI*3/2;
        let end_theta = Math.PI*2/2;
        let start_look = Vec.of(0, 0, 0);
        let T = Mat4.translation(start_look);
        let Dist = Mat4.translation(Vec.of(0, this.from_to(start_dist, end_dist, t, duration),
					   -1*this.from_to(start_height, end_height, t, duration)));
        let Theta = Mat4.rotation(this.from_to(start_theta, end_theta, t, duration), Vec.of(0,0,1));
        this.reset_cam();
        this.cam_mult(Dist);
        this.cam_mult(Theta);
        this.cam_mult(T);
    }
    display(graphics_state) {
        this.gs = graphics_state;
        // Use the lights stored in this.lights.
        graphics_state.lights = this.lights;
                
        // Find how much time has passed in seconds, and use that to place shapes.
        if (!this.paused)
            this.t += graphics_state.animation_delta_time / 1000;
        const t = this.t;

        //draw axes
        this.draw_axes(12);

	// draw tree
	this.play_demo(t);

    }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;

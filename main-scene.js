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
	    'rock': new Rock(1)
        }
        this.submit_shapes(context, shapes);
        this.shape_count = Object.keys(shapes).length;

        // Make some Material objects available to you:
        this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
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

        // Load some textures for the demo shapes
        this.shape_materials = {};
        const shape_textures = {
            square: "assets/grass.jpg",
            box: "assets/even-dice-cubemap.png",
            ball: "assets/soccer_sph_s_resize.png",
            cylinder: "assets/treebark.png",
            pyramid: "assets/tetrahedron-texture2.png",
            simplebox: "assets/tetrahedron-texture2.png",
            cone: "assets/hypnosis.jpg",
            circle: "assets/hypnosis.jpg"
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

    draw_axes(distance) {
        var T; var R; var S; var M;
        //draw axis cubes                                                                                                                                                        
        T = Mat4.translation( Vec.of( 0, 0, 0 ) );
        S = Mat4.scale( Vec.of( .1, .1, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(this.gs, M, this.plastic); // center 
        T = Mat4.translation( Vec.of( distance, 0, 0 ) );
        S = Mat4.scale( Vec.of( .5, .1, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(this.gs, M, this.plastic); // +x                                                                                    
        T = Mat4.translation( Vec.of( -distance, 0, 0 ) );
        S = Mat4.scale( Vec.of( .5, .1, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(this.gs, M, this.plastic); // -x                                                                               
        T = Mat4.translation( Vec.of( 0, distance, 0 ) );
        S = Mat4.scale( Vec.of( .1, .5, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(this.gs, M, this.plastic); // +y                                                                                  
        T = Mat4.translation( Vec.of( 0, -distance, 0 ) );
        S = Mat4.scale( Vec.of( .1, .5, .1 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(this.gs, M, this.plastic); // -y                                                                             
        T = Mat4.translation( Vec.of( 0, 0, distance ) );
        S = Mat4.scale( Vec.of( .1, .1, .5 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(this.gs, M, this.plastic); // +z                                                                                   
        T = Mat4.translation( Vec.of( 0, 0, -distance ) );
        S = Mat4.scale( Vec.of( .1, .1, .5 ) );
        M = Mat4.identity();
        M = M.times( T ).times( S );
        this.shapes.box.draw(this.gs, M, this.plastic); // -z                                                                              
    }


    initialize_demo() {

        this.saved_trees = new SavedTrees(this.cont);
    }

    play_demo(t) {
        let m = Mat4.identity();

        let T1 = Mat4.translation(Vec.of(0, -100, 0));
	// this.draw_walk_ups(T1); // no static trees for this demo

	this.draw_grower(m, t%21);
	
    }


    draw_grower(m, t) {
	let ntime = 20;
	let fps = 10;
	if (t < 0 || t > ntime) {
	    //do nothing
	    return;
	}
	let index = Math.floor(t*fps);
	let s = Math.sqrt(index)/80 + index/800;
	let S = Mat4.scale(Vec.of(s, s, s));
	this.saved_trees.grower[index].complex_draw(m.times(S), this.gs);
    }
    
    draw_walk_ups(m) {
	let wus = this.saved_trees.walk_up_trees;
	for (let i = 0; i < wus.length; i++) {
	    let R = Mat4.rotation(4*i, Vec.of(0, 0, 1));
	    let s = .6;
	    let S = Mat4.scale(Vec.of(wus[i][0]*s, wus[i][0]*s, wus[i][0]*s));
	    let T = Mat4.translation(Vec.of(wus[i][1]*4+(1-2*(i%2))*15, wus[i][2]*2+i*6, 0));
	    let M = m.times(T).times(R).times(S);
	    wus[i][3].complex_draw(M, this.gs);
	}
	
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

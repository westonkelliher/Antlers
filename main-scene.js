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
            square: "assets/grass.jpg",
            box: "assets/even-dice-cubemap.png",
            ball: "assets/soccer_sph_s_resize.png",
            cylinder: "assets/treebark.png",
            pyramid: "assets/tetrahedron-texture2.png",
            simplebox: "assets/tetrahedron-texture2.png",
            cone: "assets/hypnosis.jpg",
            circle: "assets/hypnosis.jpg",
	    	head: "assets/head.jpg",
            body: "assets/body.png",
            arms: "assets/arms.png"
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


	create_person(m,t, stiff){
        var T; var R; var S; var Body; var T1; var T2;

        let torsoHeight = .6;
        let legHeight = .6;
        let bodyHeight = legHeight + torsoHeight;

        let headRadius = .5;
        let bodyRadius = .5;

		let leg_speed = 4;

		let tilt = Mat4.rotation(Math.PI*1/2, Vec.of(1, 0, 0));
        let theta = Mat4.rotation(Math.PI, Vec.of(0, 0, 1));

        //Legs
        if (stiff == undefined){
        var Legs;
        T1 = Mat4.translation(Vec.of(-bodyRadius/2,-torsoHeight,0));
        T2 = Mat4.translation(Vec.of(0,2*torsoHeight,0));
        S = Mat4.scale(Vec.of(bodyRadius/2,torsoHeight,bodyRadius/2));
        R = Mat4.rotation(Math.sin(t*leg_speed), Vec.of(1,0,0));
        Legs = m.times(T2).times(R).times(T1).times(S);
        this.shapes['box'].draw(this.gs, Legs,this.oranges);

		T1 = Mat4.translation(Vec.of(bodyRadius/2,-torsoHeight,0));
        T2 = Mat4.translation(Vec.of(0,2*torsoHeight,0));
        S = Mat4.scale(Vec.of(bodyRadius/2,torsoHeight,bodyRadius/2));
        R = Mat4.rotation(Math.sin(-t*leg_speed), Vec.of(1,0,0));

        Legs = m.times(T2).times(R).times(T1).times(S);
        this.shapes['box'].draw(this.gs, Legs,this.oranges);
        }
        else {
        	T1 = Mat4.translation(Vec.of(-bodyRadius/2,-torsoHeight,0));
        T2 = Mat4.translation(Vec.of(0,2*torsoHeight,0));
        S = Mat4.scale(Vec.of(bodyRadius/2,torsoHeight,bodyRadius/2));
        Legs = m.times(T2).times(T1).times(S);
        this.shapes['box'].draw(this.gs, Legs,this.oranges);

		T1 = Mat4.translation(Vec.of(bodyRadius/2,-torsoHeight,0));
        T2 = Mat4.translation(Vec.of(0,2*torsoHeight,0));
        R = Mat4.rotation(Math.sin(-t*leg_speed), Vec.of(1,0,0));

        Legs = m.times(T2).times(T1).times(S);
        this.shapes['box'].draw(this.gs, Legs,this.oranges);
        }

        //Torso
        var Torso;
        T = Mat4.translation(Vec.of(0,0 + torsoHeight + legHeight * 2,0));
        S = Mat4.scale(Vec.of(bodyRadius,torsoHeight,bodyRadius/2));
        R = Mat4.rotation(Math.PI/2, Vec.of(0,0,1));

        Torso = m.times(T).times(S).times(R);
        this.shapes['box'].draw(this.gs, Torso,this.shape_materials['body']);

        //Arms
        var Arms;
        T = Mat4.translation(Vec.of(0 + bodyRadius + bodyRadius/2,0 + torsoHeight + legHeight * 4 -.1,0));
        S = Mat4.scale(Vec.of(bodyRadius/2,torsoHeight*1.4,bodyRadius/2));
        R = Mat4.rotation(Math.sin(t), Vec.of(1,0,0));

        Arms = m.times(T).times(S);
        this.shapes['box'].draw(this.gs, Arms,this.plastic);

        T = Mat4.translation(Vec.of(0 - (bodyRadius + bodyRadius/2),0 + torsoHeight + legHeight * 4 -.1,0));
        S = Mat4.scale(Vec.of(bodyRadius/2,torsoHeight*1.4,bodyRadius/2));
        R = Mat4.rotation(Math.sin(-t), Vec.of(1,0,0));
        Arms = m.times(T).times(S);
        this.shapes['box'].draw(this.gs, Arms,this.plastic);


        //Head
        var Head;
        S = Mat4.scale(Vec.of(headRadius,headRadius,headRadius - .1));
        R = Mat4.rotation(Math.PI/2, Vec.of(0,0,1));
        T = Mat4.translation(Vec.of(0,0 + torsoHeight * 2 + legHeight * 2 + headRadius,0));
        Head = m.times(T).times(S).times(R);
        this.shapes['box'].draw(this.gs, Head,this.shape_materials['head']);
    


    }

    initialize_demo() {

        this.saved_trees = new SavedTrees(this.cont);
    }

    
    draw_grower(m, t) {
	let ntime = 40;
	let fps = 10;
	if (t < 0 || t > ntime) {
	    //do nothing
	    return;
	}
	let index = Math.floor(t*fps);
	let s = Math.sqrt(index)/200 + index/2000;
	let S = Mat4.scale(Vec.of(s, s, s));
	this.saved_trees.grower[index].complex_draw(m.times(S), this.gs);
    }
    
    draw_walk_ups(m) {
	let wus = this.saved_trees.walk_up_trees;
	for (let i = 0; i < wus.length; i++) {
	    let R = Mat4.rotation(4*i, Vec.of(0, 0, 1));
	    let s = .6;
	    let S = Mat4.scale(Vec.of(wus[i][0]*s, wus[i][0]*s, wus[i][0]*s));
	    let T = Mat4.translation(Vec.of(wus[i][1]*4+(1-2*(i%2))*10, wus[i][2]*2+i*6, 0));
	    let M = m.times(T).times(R).times(S);
	    wus[i][3].complex_draw(M, this.gs);
	}
	
    }

    draw_grass(m, x, y) {
	for(let i = -x; i <= x; i++){
	    for(var j = -y; j <= y; j++){
                let T = Mat4.translation(Vec.of(i*2, j*2, 0))
                let M = m.times(T);
                this.shapes['square'].draw(this.gs, M,this.shape_materials['square']);
	    }	
        }
    }

    draw_rocks(m, x, y) {
    	for(let i = -x; i <= x; i++){
	    	for(let j = -y; j <= y; j++){
                let T = Mat4.translation(Vec.of(i, j, 0));
                let T2 = Mat4.translation(Vec.of(1, 0, 0))
                let R = Mat4.rotation(i*2+j, Vec.of());
                let M = m.times(T2).times(R).times(T);
                this.shapes['rock'].draw(this.gs, M, this.bone);
	    	}	
        }
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
		let start_height = .2;
		let end_height = 1;
		let start_dist = 1;
		let end_dist = 3;
		let start_theta = Math.PI*1/2;
		let end_theta = Math.PI*3/2;
		let start_look = Vec.of(-10, 0, 0);
		let T = Mat4.translation(start_look);
		let Dist = Mat4.translation(Vec.of(0, this.from_to(start_dist, end_dist, t, duration),
				-1*this.from_to(start_height, end_height, t, duration)));
		let Theta = Mat4.rotation(this.from_to(start_theta, end_theta, t, duration), Vec.of(0,0,1));
		this.reset_cam();
		this.cam_mult(Dist);
		this.cam_mult(Theta);
		this.cam_mult(T);
	}

	control_camera_2(t, duration) {
		let start_height = 1;
		let end_height = 2;
		let start_dist = 13;
		let end_dist = 6;
		let start_theta = Math.PI*3/2;
		let end_theta = Math.PI*5/2;
		let start_y = 0;
		let end_y = -110;
		let start_look = Vec.of(0, 0, 0);
		let T = Mat4.translation(start_look);
		let Dist = Mat4.translation(Vec.of(0, this.from_to(start_dist, end_dist, t, duration),
				-1*this.from_to(start_height, end_height, t, duration)));
		let Theta = Mat4.rotation(this.from_to(start_theta, end_theta, t, duration), Vec.of(0,0,1));
		let runT = Mat4.translation(Vec.of(0, this.from_to(start_y, end_y, t, duration), 0));
		this.reset_cam();
		this.cam_mult(Dist);
		this.cam_mult(Theta);
		this.cam_mult(T);
		this.cam_mult(runT);
	}
	control_camera_3(t, duration) {
		let start_height = 2;
		let end_height = 2;
		let start_dist = 6;
		let end_dist = 5;
		let start_theta = Math.PI*1/2;
		let end_theta = Math.PI*1/2;
		let start_y = -110;
		let end_y = -118;
		let start_look = Vec.of(0, 0, 0);
		let T = Mat4.translation(start_look);
		let Dist = Mat4.translation(Vec.of(0, this.from_to(start_dist, end_dist, t, duration),
				-1*this.from_to(start_height, end_height, t, duration)));
		let Theta = Mat4.rotation(this.from_to(start_theta, end_theta, t, duration), Vec.of(0,0,1));
		let runT = Mat4.translation(Vec.of(0, this.from_to(start_y, end_y, t, duration), 0));
		this.reset_cam();
		this.cam_mult(Dist);
		this.cam_mult(Theta);
		this.cam_mult(T);
		this.cam_mult(runT);
	}

	control_camera_4(t, duration) {
		let start_height = 2;
		let end_height = 6;
		let start_dist = 5;
		let end_dist = 50;
		let start_theta = Math.PI*1/2;
		let end_theta = Math.PI*4/2;
		let start_y = -118;
		let end_y = -118;
		let start_look = Vec.of(0, 0, 0);
		let T = Mat4.translation(start_look);
		let Dist = Mat4.translation(Vec.of(0, this.from_to(start_dist, end_dist, t, duration),
				-1*this.from_to(start_height, end_height, t, duration)));
		let Theta = Mat4.rotation(this.from_to(start_theta, end_theta, t, duration), Vec.of(0,0,1));
		let runT = Mat4.translation(Vec.of(0, this.from_to(start_y, end_y, t, duration), 0));
		this.reset_cam();
		this.cam_mult(Dist);
		this.cam_mult(Theta);
		this.cam_mult(T);
		this.cam_mult(runT);
	}

    play_demo(t) {
        let m = Mat4.identity();

		let d1 = 20;
		let d2 = 10;
        let d3 = .5;
        let d4 = 40;
        if (t < d1) {
        	this.phase_1(t, d1);
        }
        else if (t < d1+d2){
        	this.phase_2(t-d1, d2);
        }
        else if (t < d1+d2+d3) {
			this.phase_3(t-d1-d2, d3);
        }
        else if (t < d1+d2+d3+d4) {
			this.phase_4(t-d1-d2-d3, d4);
        }

		let S = Mat4.scale(Vec.of(3, 3, 1));
		let T = Mat4.translation(Vec.of(0, 60, 0));
		this.draw_grass(m.times(T).times(S), 5, 15);
		
		this.draw_rocks(m.times(T).times(S), 3, 10);

        let T1 = Mat4.translation(Vec.of(0, 0, 0));
		this.draw_walk_ups(T1);

		//this.draw_grower(m, t%20);
	
    }

    phase_1(t, duration) {
		if (!this.paused) {
			this.control_camera_1(t%duration, duration);
		}
    }conso

	phase_2(t, duration) {
		let wait = duration/6;
		if (!this.paused && t > wait) {
			this.control_camera_2((t-wait)%(duration-wait), (duration-wait));
		}
		let tilt = Mat4.rotation(Math.PI*1/2, Vec.of(1, 0, 0));
        let theta = Mat4.rotation(Math.PI, Vec.of(0, 0, 1));
        let start_y = -25;
        let end_y = 110;
        let runT = Mat4.translation(Vec.of(0, 0, this.from_to(start_y, end_y, t, duration)));
		this.create_person(theta.times(tilt).times(runT), t);
		let ballT = Mat4.translation(Vec.of(0, 4.25, 0));
		let ballS = Mat4.scale(Vec.of(.8, .8, .8));
		this.shapes['ball'].draw(this.gs, Mat4.identity().times(theta).times(tilt).times(runT).times(ballT).times(ballS), this.red);
	}

	phase_3(t, duration) {
		if (!this.paused) {
			this.control_camera_3(t%duration, duration);
		}
		let tilt = Mat4.rotation(Math.PI*1/2, Vec.of(1, 0, 0));
        let theta = Mat4.rotation(Math.PI, Vec.of(0, 0, 1));
        let start_y = -25;
        let end_y = 110;
        let T = Mat4.translation(Vec.of(0, 0, 110));
        let tripT = Mat4.translation(Vec.of(0, .2*t/duration, 3*t/duration));
        let fall_tilt = Mat4.rotation(Math.PI*.5*t/duration, Vec.of(1, 0, 0));
		this.create_person(theta.times(tilt).times(T).times(tripT).times(fall_tilt), t, true);
		let ballT = Mat4.translation(Vec.of(0, 4.25, 0));
		let ballS = Mat4.scale(Vec.of(.8, .8, .8));
		this.shapes['ball'].draw(this.gs, theta.times(tilt).times(T).times(tripT).times(fall_tilt).times(ballT).times(ballS), this.red);
    }

    phase_4(t, duration) {
		if (!this.paused) {
			this.control_camera_4(t%duration, duration);
		}
		let tilt = Mat4.rotation(Math.PI*1/2, Vec.of(1, 0, 0));
        let theta = Mat4.rotation(Math.PI, Vec.of(0, 0, 1));
        let T = Mat4.translation(Vec.of(0, 0, 110));
        let tripT = Mat4.translation(Vec.of(0, .2, 3));
        let fall_tilt = Mat4.rotation(Math.PI*.5, Vec.of(1, 0, 0));
		this.create_person(theta.times(tilt).times(T).times(tripT).times(fall_tilt), t, true);

		T = Mat4.translation(Vec.of(0, 118, 0));
		let s = 3;
		let S = Mat4.scale(Vec.of(s, s, s));
		this.draw_grower(T.times(S), t);
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
        this.play_demo(t-30);

    }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;

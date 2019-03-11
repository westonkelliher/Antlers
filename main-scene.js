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
            'ball': new Subdivision_Sphere(4)
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
            square: "assets/butterfly.png",
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
        var end = new GrowingBranchEnd();

        var seg0 = new GrowingSegment(0, 0, 0, 1, 0 ,0);
        var branch0 = new GrowingBranch(0, 0, 0);
        var spike1 = new GrowingSegment(4, 0, 0, 0, 0, 0);
        var spike2 = new GrowingSegment(7, 0, 0, 0, 0, 0);

        var seg1 = new GrowingSegment(4, Math.PI*0, Math.PI*-.15, .87, -Math.PI*0, Math.PI*0);
        var seg2 = new GrowingSegment(4, Math.PI*0, Math.PI*0, .87, Math.PI*0, -Math.PI*0);
        var seg3 = new GrowingSegment(4, -Math.PI*.7, Math.PI*.05, .87, Math.PI*0, Math.PI*0);
        var seg4 = new GrowingSegment(6, Math.PI*0, -Math.PI*.05, .5, Math.PI*0, Math.PI*0);
        var seg5 = new GrowingSegment(6, Math.PI*0, -Math.PI*.05, .5, Math.PI*0, Math.PI*.05);
        var seg6 = new GrowingSegment(6, Math.PI*0, -Math.PI*.15, .87, Math.PI*0, Math.PI*.05);
        var seg7 = new GrowingSegment(4, Math.PI*0, Math.PI*0, .87, Math.PI*0, Math.PI*0);
        var seg8 = new GrowingSegment(6, Math.PI*0, -Math.PI*.1, .87, Math.PI*0, Math.PI*0);
        var seg9 = new GrowingSegment(6, Math.PI*0, -Math.PI*.15, .87, Math.PI*0, Math.PI*0);

        var branch1 = new GrowingBranch(2, Math.PI*.9, .75);
        var branch2 = new GrowingBranch(2, -Math.PI*1, .75);
        var branch3 = new GrowingBranch(2, Math.PI*0, .5);
        var branch4 = new GrowingBranch(2, -Math.PI*2/3, .5);
        var branch5 = new GrowingBranch(2, -Math.PI*4/3, .5);

        var a_b = .5;
        var b_c = .4;
        var ruleA = new GrowingRule(1, [branch1, seg1, end, seg2, branch3, end, seg3]);
        var ruleB = new GrowingRule(a_b, [branch1, seg1, end, seg2, seg3])
        var ruleC = new GrowingRule(a_b*b_c, [seg4, spike2]);

        var tree_prod = new GrowingTree([ruleC, ruleB, ruleA]);
        tree_prod.init(this.cont.gl, this.gs, this.bone);

        var rule0 = new GrowingRule(0, []);
        ruleA.make_interpolable(ruleB);
        this.rule = ruleA;
    
        this.tree_prod = tree_prod;

        this.saved_trees = new SavedTrees();

        this.saved_trees.spike_tree_1.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_2.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_3.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_4.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_5.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_6.copy_onto_graphics_card(this.cont.gl);
        this.saved_trees.spike_tree_7.copy_onto_graphics_card(this.cont.gl);

    }

    play_demo(t) {
        let m = Mat4.rotation(-Math.PI*.5, Vec.of(1, 0, 0)).times(Mat4.scale(.25, .25, .25));
        
        let T = Mat4.translation(Vec.of(50, 0, 0));
        
        this.saved_trees.spike_tree_1.draw(this.gs, m, this.bone);
        m = m.times(T);
        this.saved_trees.spike_tree_2.draw(this.gs, m, this.bone);
        m = m.times(T);
        this.saved_trees.spike_tree_3.draw(this.gs, m, this.bone);
        m = m.times(T);
        this.saved_trees.spike_tree_4.draw(this.gs, m, this.bone);
        m = m.times(T);
        this.saved_trees.spike_tree_5.draw(this.gs, m, this.bone);
        m = m.times(T);
        this.saved_trees.spike_tree_6.draw(this.gs, m, this.bone);
        m = m.times(T);
        this.saved_trees.spike_tree_7.draw(this.gs, m, this.bone);
        m = m.times(T);
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
        this.play_demo(t);

    }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;

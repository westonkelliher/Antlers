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
        var end = new TreeBranchEnd();

        var spike0 = new TreeSegment(6, Math.PI*0, -Math.PI*1/8);

        var segA1 = new TreeSegment(4, Math.PI*21/23, Math.PI*0, .95, Math.PI*0, Math.PI*1/8);
        var branchA2 = new TreeBranch(1.5, Math.PI*0, .95);
        var segA2 = new TreeSegment(4, Math.PI*1, Math.PI*1/5, .8, Math.PI*1, Math.PI*1/11);
        //openA2                                                                                                                                                                 
        //endA2                                                                                                                                                                  
        var segA3 = new TreeSegment(5, Math.PI*10/7, Math.PI*0, .8, Math.PI*1, Math.PI*1/9);
        //openA3                                                                                                                                                                 

        var branchB1 = new TreeBranch(-.2, Math.PI*0, .7);
        var branchB2 = new TreeBranch(-.2, Math.PI*2/5, .7);
        var branchB3 = new TreeBranch(-.2, Math.PI*4/5, .71);
        var branchB4 = new TreeBranch(-.2, Math.PI*6/5, .73);
        var branchB5 = new TreeBranch(-.2, Math.PI*8/5, .72);

        var segC1 = new TreeSegment(4, Math.PI*1/20, Math.PI*-1/5, .9, Math.PI*1, Math.PI*2/9);
        var segC2 = new TreeSegment(4, Math.PI*-1/15, Math.PI*-1/15, .7, Math.PI*1, Math.PI*-3/9);


        var b_c = .45;
        var ruleA = new TreeProductionRule(20, [branchA2, segA2, end, segA1, segA3]);
        var ruleB = new TreeProductionRule(b_c, [branchB1, end, branchB2, end,
                                            branchB3, end, branchB4, end, branchB5, end])
        var ruleC = new TreeProductionRule(b_c*.8, [segC1, segC2, spike0]);

        var tree_prod = new TreeProduction([ruleC, ruleB, ruleA]);

        
        

        this.tree_prod = tree_prod;
        this.tree_model = tree_prod.get_model();
        this.tree_model.copy_onto_graphics_card(this.cont.gl);

        //create a new tree:

        //1 - define segments and branches

        //2 - define rules made of those segments and branches

        //3 - define production tree from those rules (and define threshholds)

        //4 - generate model from production tree
    }

    play_demo() {

        //Pre-loading 
        var R = Mat4.rotation(-Math.PI*1/2, Vec.of(1, 0, 0));
        this.tree_model.draw(this.gs, R, this.bone);
        


        //re-make model every frame
        //var T = Mat4.translation(Vec.of(10, 10, 0));
        //this.tree_prod.init(this.cont.gl, this.gs, this.bone);
        //this.tree_prod.draw_tree(1, T.times(R));
        
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
        //this.draw_axes(12);
        this.play_demo();

        
        // Draw some demo textured shapes
        /* let spacing = 6;
        let m = Mat4.translation(Vec.of(-1 * (spacing / 2) * (this.shape_count - 1), 0, 0));
        for (let k in this.shapes) {
            this.shapes[k].draw(
                graphics_state,
                m.times(Mat4.rotation(t, Vec.of(0, 1, 0))),
                this.shape_materials[k] || this.plastic);
            m = m.times(Mat4.translation(Vec.of(spacing, 0, 0)));
        }*/
    }
}

window.Assignment_Two_Skeleton = window.classes.Assignment_Two_Skeleton = Assignment_Two_Skeleton;

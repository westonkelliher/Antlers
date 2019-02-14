// Here's a complete, working example of a Shape subclass.  It is a blueprint for a cube where each side is of length 2.
window.Cube = window.classes.Cube = class Cube extends Shape {
    constructor() {
        // Name the values we'll define per each vertex.  They'll have positions and normals.
        super("positions", "normals");

        // First, specify the vertex positions -- just a bunch of points that exist at the corners of an imaginary cube.
        this.positions.push(...Vec.cast(
            [-1, -1, -1], [ 1, -1, -1], [-1, -1,  1], [ 1, -1,  1],
            [ 1,  1, -1], [-1,  1, -1], [ 1,  1,  1], [-1,  1,  1],
            [-1, -1, -1], [-1, -1,  1], [-1,  1, -1], [-1,  1,  1],
            [ 1, -1,  1], [ 1, -1, -1], [ 1,  1,  1], [ 1,  1, -1],
            [-1, -1,  1], [ 1, -1,  1], [-1,  1,  1], [ 1,  1,  1],
            [ 1, -1, -1], [-1, -1, -1], [ 1,  1, -1], [-1,  1, -1]));
        /*this.positions.push(...Vec.cast(
            [-1, -1, -1], [1, -1, -1],  [-1, -1, 1], [1, -1, 1], //bottom plane
            [-1, 1, -1], [1, 1, -1],  [-1, 1, 1], [1, 1, 1] //top plane
        ));*/

        // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
        // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
        this.normals.push(...Vec.cast(
            [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0],
            [ 0,  1,  0], [ 0,  1,  0], [ 0,  1,  0], [ 0,  1,  0],
            [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], [-1,  0,  0],
            [ 1,  0,  0], [ 1,  0,  0], [ 1,  0,  0], [ 1,  0,  0],
            [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1],
            [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1]));
        
        /*this.normals.push(...Vec.cast(
            [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0],
            [ 0, 1, 0 ], [ 0, 1, 0 ], [ ]
        ));*/

        // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
        // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
        // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
        this.indices.push(
            0, 1, 2, 1, 3, 2,
            4, 5, 6, 5, 7, 6,
            8, 9, 10, 9, 11, 10,
            12, 13, 14, 13, 15, 14,
            16, 17, 18, 17, 19, 18,
            20, 21, 22, 21, 23, 22);

        // It stinks to manage arrays this big.  Later we'll show code that generates these same cube vertices more automatically.
    }
}

window.CircleN = window.classes.CircleN = class CircleN extends Shape {
    constructor(n) {
        // Name the values we'll define per each vertex.  They'll have positions and normals.
        super("positions", "normals");
        
        this.positions.push([0, 0, 0]);
        this.normals.push([0, 0, 1]);
        for (let i = 0; i < n; i++) {
            this.positions.push([Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0]);
            this.normals.push([0, 0, 1]);
            this.indices.push(0, i+1, i == n-1 ? 1 : i+2);
        }
        
        
    }
}

window.Segment = window.classes.Segment = class Segment extends Shape {
    constructor(m) {
        super("positions", "normals");
        
        var n = 16;

        this.positions.push([0, 0, 0]);
        this.normals.push([0, 0, -1]);
        for (let i = 0; i < n; i++) {
            this.positions.push([Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0]);
            this.normals.push([Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0]);
            //this.indices.push(0, i+1, i == n-1 ? 1 : i+2);
        }

        for (let i = 0; i < n; i++) {
            this.positions.push(m.times(Vec.of(Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0, 1)).to3());
            this.normals.push(m.times(Vec.of(Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0, 0)).to3());
            //this.indices.push(n+1, i+n+2, i == n-1 ? n+2 : i+n+3);
        }

        for (let i = 0; i < n; i++) {
            this.indices.push(i+1, i == n-1 ? 1 : i+2, i+n+1);
            this.indices.push(i+n+1, i == n-1 ? n+2 : i+n+2, i == n-1 ? 1 : i+2);
        }

    }
}

window.MultiShape = window.classes.MultiShape = class MultiShape extends Shape {
    constructor(shapes) {   //[M1, Shape1], [M2, Shape2], ... 
        super("positions", "normals");
        
        var indice_offset = 0;

        for (let p = 0; p < shapes.length; p++) {
            var M = shapes[p][0];
            console.log(M.toString());
            var shape = shapes[p][1];

            for (let i = 0; i < shape.positions.length; i++) {
                //console.log(Vec.of(...shape.positions[i]));
                this.positions.push( M.times(Vec.of(...shape.positions[i], 1)).to3() );
                this.normals.push( M.times(Vec.of(...shape.normals[i])).to3() );
            }
            for (let i = 0; i < shape.indices.length; i++) {
                //console.log(shape.indices[i]+indice_offset);
                this.indices.push(shape.indices[i]+indice_offset);
            }
            indice_offset += shape.positions.length;
        }

    }
}

window.Spike = window.classes.Spike = class Spike extends Shape {
    constructor(m) {
        super("positions", "normals");
        
        var n = 16;

        this.positions.push([0, 0, 0]);
        this.normals.push([0, 0, -1]);
        for (let i = 0; i < n; i++) {
            this.positions.push([Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0]);
            this.normals.push([Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), -1]);
            this.indices.push(0, i+1, i == n-1 ? 1 : i+2);
        }

        this.positions.push(m.times(Vec.of(0, 0, 0, 1)).to3() );
        this.normals.push(m.times(Vec.of(0, 0, 1, 1)).to3() );
        
        for (let i = 0; i < n; i++) {
            this.indices.push(i+1, i == n-1 ? 1 : i+2, n+1);
        }

    }
}



window.TriangularPrism = window.classes.TriangularPrism = class TriangularPrism extends Shape {
    constructor() { 
        // Name the values we'll define per each vertex.
        super("positions", "normals", "texture_coords");
        
        this.positions.push(...Vec.cast(
            [0, 0,  1], [ 0, 1,  1], [1, 0,  1],
            [0, 0, -1], [ 0, 1, -1], [1, 0, -1],
            [0, 0,  1], [ 0, 0, -1], [1, 0, -1], [1, 0, 1],
            [0, 0,  1], [ 0, 0, -1], [0, 1, -1], [0, 1, 1],
            [1, 0,  1], [ 1, 0, -1], [0, 1, -1], [0, 1, 1]));

        // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
        // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
        const r2 = Math.sqrt(2);
        this.normals.push(...Vec.cast(
            [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1],
            [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1],
            [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0],
            [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], [-1,  0,  0],
            [r2, r2,  0], [r2, r2,  0], [r2, r2,  0], [r2, r2,  0]));

        // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
        // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
        // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
        this.indices.push(
            0, 1, 2,
            3, 4, 5,
            6, 7, 8, 6, 8, 9,
            10, 11, 12, 10, 13, 12,
            14, 15, 16, 14, 17, 16);
    }
}

// The Tetrahedron shape demonstrates flat vs smooth shading (a boolean argument 
// selects which one).  It is also our first 3D, non-planar shape.
window.Tetrahedron = window.classes.Tetrahedron = class Tetrahedron extends Shape {
    constructor(using_flat_shading) {
        super("positions", "normals", "texture_coords");
        var a = 1 / Math.sqrt(3);

        // Method 1:  A tetrahedron with shared vertices.  Compact, performs better,
        // but can't produce flat shading or discontinuous seams in textures.
        // Vertices are shared multiple times with this method.
        if (!using_flat_shading) {
            this.positions.push(...Vec.cast([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]));
            this.normals.push(...Vec.cast([-a, -a, -a], [1, 0, 0], [0, 1, 0], [0, 0, 1]));
            this.texture_coords.push(...Vec.cast([0, 0], [1, 0], [0, 1, ], [1, 1]));
            this.indices.push(0, 1, 2, 0, 1, 3, 0, 2, 3, 1, 2, 3);
        }
        // Method 2:  A tetrahedron with four independent triangles. This here makes Method 2 flat shaded, since values
        // of normal vectors can be constant per whole triangle. Repeat them for all three vertices.
        // Each face in Method 2 also gets its own set of texture coords (half the image is mapped onto each face). 
        // We couldn't do this with shared vertices since this features abrupt transitions when approaching the same
        // point from different directions.
        else {
            this.positions.push(...Vec.cast(
                [0, 0, 0], [1, 0, 0], [0, 1, 0],
                [0, 0, 0], [1, 0, 0], [0, 0, 1], 
                [0, 0, 0], [0, 1, 0], [0, 0, 1],
                [0, 0, 1], [1, 0, 0], [0, 1, 0]));

            this.normals.push(...Vec.cast(
                [0, 0, -1], [0, 0, -1], [0, 0, -1], 
                [0, -1, 0], [0, -1, 0], [0, -1, 0], 
                [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], 
                [a, a, a], [a, a, a], [a, a, a]));

            this.texture_coords.push(...Vec.cast(
                [0, 0], [1, 0], [1, 1], 
                [0, 0], [1, 0], [1, 1],
                [0, 0], [1, 0], [1, 1], 
                [0, 0], [1, 0], [1, 1]));

            // Notice all vertices are unique this time.
            this.indices.push(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
        }
    }
}

// This Shape defines a Sphere surface, with nice uniform triangles.  A subdivision surface (see
// Wikipedia article on those) is initially simple, then builds itself into a more and more 
// detailed shape of the same layout.  Each act of subdivision makes it a better approximation of 
// some desired mathematical surface by projecting each new point onto that surface's known 
// implicit equation.  For a sphere, we begin with a closed 3-simplex (a tetrahedron).  For each
// face, connect the midpoints of each edge together to make more faces.  Repeat recursively until 
// the desired level of detail is obtained.  Project all new vertices to unit vectors (onto the
// unit sphere) and group them into triangles by following the predictable pattern of the recursion.
window.Subdivision_Sphere = window.classes.Subdivision_Sphere = class Subdivision_Sphere extends Shape {
    constructor(max_subdivisions) {
        super("positions", "normals", "texture_coords");

        // Start from the following equilateral tetrahedron:
        this.positions.push(...Vec.cast([0, 0, -1], [0, .9428, .3333], [-.8165, -.4714, .3333], [.8165, -.4714, .3333]));

        // Begin recursion.
        this.subdivideTriangle(0, 1, 2, max_subdivisions);
        this.subdivideTriangle(3, 2, 1, max_subdivisions);
        this.subdivideTriangle(1, 0, 3, max_subdivisions);
        this.subdivideTriangle(0, 2, 3, max_subdivisions);

        for (let p of this.positions) {
            // Each point has a normal vector that simply goes to the point from the origin.
            this.normals.push(p.copy());

            // Textures are tricky.  A Subdivision sphere has no straight seams to which image 
            // edges in UV space can be mapped.  The only way to avoid artifacts is to smoothly 
            // wrap & unwrap the image in reverse - displaying the texture twice on the sphere.
            this.texture_coords.push(Vec.of(
                Math.asin(p[0] / Math.PI) + .5,
                Math.asin(p[1] / Math.PI) + .5))
        }
    }

    // Recurse through each level of detail by splitting triangle (a,b,c) into four smaller ones.
    subdivideTriangle(a, b, c, count) {
        // Base case of recursion - we've hit the finest level of detail we want.
        if (count <= 0) {
            this.indices.push(a, b, c);
            return;
        }

        // We're not at the base case.  So, build 3 new vertices at midpoints, and extrude them out to touch the unit sphere (length 1).
        var ab_vert = this.positions[a].mix(this.positions[b], 0.5).normalized(),
        ac_vert = this.positions[a].mix(this.positions[c], 0.5).normalized(),
        bc_vert = this.positions[b].mix(this.positions[c], 0.5).normalized();

        // Here, push() returns the indices of the three new vertices (plus one).
        var ab = this.positions.push(ab_vert) - 1,
            ac = this.positions.push(ac_vert) - 1,
            bc = this.positions.push(bc_vert) - 1;

        // Recurse on four smaller triangles, and we're done.  Skipping every fourth vertex index in our list takes you
        // down one level of detail, and so on, due to the way we're building it.
        this.subdivideTriangle( a, ab, ac, count - 1);
        this.subdivideTriangle(ab,  b, bc, count - 1);
        this.subdivideTriangle(ac, bc,  c, count - 1);
        this.subdivideTriangle(ab, bc, ac, count - 1);
    }
}

// Subclasses of Shader each store and manage a complete GPU program.  This Shader is 
// the simplest example of one.  It samples pixels from colors that are directly assigned 
// to the vertices.  Materials here are minimal, without any settings.
window.Basic_Shader = window.classes.Basic_Shader = class Basic_Shader extends Shader {
    material() {
        return {
            shader: this
        }
    }
    
    // The shader will pull single entries out of the vertex arrays, by their data fields'
    // names.  Map those names onto the arrays we'll pull them from.  This determines
    // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
    // Vertex buffers in the GPU can get their pointers matched up with pointers to 
    // attribute names in the GPU.  Shapes and Shaders can still be compatible even
    // if some vertex data feilds are unused. 
    map_attribute_name_to_buffer_name(name) {
        // Use a simple lookup table.
        return {
            object_space_pos: "positions",
            color: "colors"
        }[name];
    }

    // Define how to synchronize our JavaScript's variables to the GPU's:
    update_GPU(g_state, model_transform, material, gpu=this.g_addrs, gl=this.gl) {
        const PCM = g_state.projection_transform.times(g_state.camera_transform).times(model_transform);
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform_loc, false, Mat.flatten_2D_to_1D(PCM.transposed()));
    }

    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    shared_glsl_code() {
        return `
            precision mediump float;
            varying vec4 VERTEX_COLOR;`;
    }

    // ********* VERTEX SHADER *********
    vertex_glsl_code() {
        return `
            attribute vec4 color;
            attribute vec3 object_space_pos;
            uniform mat4 projection_camera_model_transform;

            void main() {
                // The vertex's final resting place (in NDCS).
                gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);

                // Use the hard-coded color of the vertex.
                VERTEX_COLOR = color;
            }`;
    }

    // ********* FRAGMENT SHADER *********
    fragment_glsl_code() {
        return `
            void main() {
                // The interpolation gets done directly on the per-vertex colors.
                gl_FragColor = VERTEX_COLOR;
            }`;
    }
}

// Simple "procedural" texture shader, with texture coordinates but without an input image.
window.Funny_Shader = window.classes.Funny_Shader = class Funny_Shader extends Shader {
    // Materials here are minimal, without any settings.
    material() {
        return {
            shader: this
        }
    }

    // We'll pull single entries out per vertex by field name.  Map those names onto the vertex arrays
    // names we'll pull them from. Use a simple lookup table.
    map_attribute_name_to_buffer_name(name) {
        return {
            object_space_pos: "positions",
            tex_coord: "texture_coords"
        }[name];
    }

    // Define how to synchronize our JavaScript's variables to the GPU's:
    update_GPU(g_state, model_transform, material, gpu=this.g_addrs, gl=this.gl) {
        const PCM = g_state.projection_transform.times(g_state.camera_transform).times(model_transform);
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform_loc, false, Mat.flatten_2D_to_1D(PCM.transposed()));
        gl.uniform1f(gpu.animation_time_loc, g_state.animation_time / 1000);
    }

    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    shared_glsl_code() {
        return `
            precision mediump float;
            varying vec2 f_tex_coord;`;
    }

    // ********* VERTEX SHADER *********
    vertex_glsl_code() {
        return `
            attribute vec3 object_space_pos;
            attribute vec2 tex_coord;
            uniform mat4 projection_camera_model_transform;

            void main() {
                // The vertex's final resting place (in NDCS).
                gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);

                // Directly use original texture coords and interpolate between.
                f_tex_coord = tex_coord;
            }`;
    }

    // ********* FRAGMENT SHADER *********
    fragment_glsl_code() {
        return `
            uniform float animation_time;
            void main() {
                float a = animation_time,
                    u = f_tex_coord.x,
                    v = f_tex_coord.y;   

                // Use an arbitrary math function to color in all pixels as a complex
                // function of the UV texture coordintaes of the pixel and of time.
                gl_FragColor = vec4(
                    2.0 * u * sin(17.0 * u ) + 3.0 * v * sin(11.0 * v ) + 1.0 * sin(13.0 * a),
                    3.0 * u * sin(18.0 * u ) + 4.0 * v * sin(12.0 * v ) + 2.0 * sin(14.0 * a),
                    4.0 * u * sin(19.0 * u ) + 5.0 * v * sin(13.0 * v ) + 3.0 * sin(15.0 * a),
                    5.0 * u * sin(20.0 * u ) + 6.0 * v * sin(14.0 * v ) + 4.0 * sin(16.0 * a));
            }`;
    }
}

// THE DEFAULT SHADER: This uses the Phong Reflection Model, with optional Gouraud shading. 
// Wikipedia has good defintions for these concepts.  Subclasses of class Shader each store 
// and manage a complete GPU program.  This particular one is a big "master shader" meant to 
// handle all sorts of lighting situations in a configurable way. 
// Phong Shading is the act of determining brightness of pixels via vector math.  It compares
// the normal vector at that pixel to the vectors toward the camera and light sources.
//
// *** How Shaders Work:
// The "vertex_glsl_code" string below is code that is sent to the graphics card at runtime, 
// where on each run it gets compiled and linked there.  Thereafter, all of your calls to draw 
// shapes will launch the vertex shader program once per vertex in the shape (three times per 
// triangle), sending results on to the next phase.  The purpose of this vertex shader program 
// is to calculate the final resting place of vertices in screen coordinates; each vertex 
// starts out in local object coordinates and then undergoes a matrix transform to get there.
//
// Likewise, the "fragment_glsl_code" string is used as the Fragment Shader program, which gets 
// sent to the graphics card at runtime.  The fragment shader runs once all the vertices in a 
// triangle / element finish their vertex shader programs, and thus have finished finding out 
// where they land on the screen.  The fragment shader fills in (shades) every pixel (fragment) 
// overlapping where the triangle landed.  It retrieves different values (such as vectors) that 
// are stored at three extreme points of the triangle, and then interpolates the values weighted 
// by the pixel's proximity to each extreme point, using them in formulas to determine color.
// The fragment colors may or may not become final pixel colors; there could already be other 
// triangles' fragments occupying the same pixels.  The Z-Buffer test is applied to see if the 
// new triangle is closer to the camera, and even if so, blending settings may interpolate some 
// of the old color into the result.  Finally, an image is displayed onscreen.
window.Phong_Shader = window.classes.Phong_Shader = class Phong_Shader extends Shader {

    // Define an internal class "Material" that stores the standard settings found in Phong lighting.
    material(color, properties) {
        // Possible properties: ambient, diffusivity, specularity, smoothness, texture.
        return new class Material {
            constructor(shader, color=Color.of(0, 0, 0, 1), ambient=0, diffusivity=1, specularity=1, smoothness=40) {
                // Assign defaults.
                Object.assign(this, {
                    shader,
                    color,
                    ambient,
                    diffusivity,
                    specularity,
                    smoothness
                });

                // Optionally override defaults.
                Object.assign(this, properties);
            }

            // Easily make temporary overridden versions of a base material, such as
            // of a different color or diffusivity.  Use "opacity" to override only that.
            override(properties) {
                const copied = new this.constructor();
                Object.assign(copied, this);
                Object.assign(copied, properties);
                copied.color = copied.color.copy();
                if (properties["opacity"] != undefined)
                    copied.color[3] = properties["opacity"];
                return copied;
            }
        }
        (this,color);
    }

    // We'll pull single entries out per vertex by field name.  Map
    // those names onto the vertex array names we'll pull them from.
    map_attribute_name_to_buffer_name(name) {
        // Use a simple lookup table.
        return {
            object_space_pos: "positions",
            normal: "normals",
            tex_coord: "texture_coords"
        }[name];
    }
    
    // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    shared_glsl_code() 
    {
        return `
            precision mediump float;

            // We're limited to only so many inputs in hardware.  Lights are costly (lots of sub-values).
            const int N_LIGHTS = 2;
            uniform float ambient, diffusivity, specularity, smoothness, animation_time, attenuation_factor[N_LIGHTS];

            // Flags for alternate shading methods
            uniform bool GOURAUD, COLOR_NORMALS, USE_TEXTURE;
            uniform vec4 lightPosition[N_LIGHTS], lightColor[N_LIGHTS], shapeColor;
            
            // Specifier "varying" means a variable's final value will be passed from the vertex shader
            // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the 
            // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).       
            varying vec3 N, E;                     
            varying vec2 f_tex_coord;             
            varying vec4 VERTEX_COLOR;            
            varying vec3 L[N_LIGHTS];
            varying float dist[N_LIGHTS];

            vec3 phong_model_lights( vec3 N ) {
                vec3 result = vec3(0.0);
                for(int i = 0; i < N_LIGHTS; i++) {
                    vec3 H = normalize( L[i] + E );
                    
                    float attenuation_multiplier = 1.0;// / (1.0 + attenuation_factor[i] * (dist[i] * dist[i]));
                    float diffuse  =      max( dot(N, L[i]), 0.0 );
                    float specular = pow( max( dot(N, H), 0.0 ), smoothness );

                    result += attenuation_multiplier * ( shapeColor.xyz * diffusivity * diffuse + lightColor[i].xyz * specularity * specular );
                }
                return result;
            }`;
    }

    // ********* VERTEX SHADER *********
    vertex_glsl_code() {
        return `
            attribute vec3 object_space_pos, normal;
            attribute vec2 tex_coord;

            uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform;
            uniform mat3 inverse_transpose_modelview;

            void main() {
                // The vertex's final resting place (in NDCS).
                gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);
                
                // The final normal vector in screen space.
                N = normalize( inverse_transpose_modelview * normal );
                
                // Directly use original texture coords and interpolate between.
                f_tex_coord = tex_coord;

                // Bypass all lighting code if we're lighting up vertices some other way.
                if( COLOR_NORMALS ) {
                    // In "normals" mode, rgb color = xyz quantity. Flash if it's negative.
                    VERTEX_COLOR = vec4( N[0] > 0.0 ? N[0] : sin( animation_time * 3.0   ) * -N[0],             
                                         N[1] > 0.0 ? N[1] : sin( animation_time * 15.0  ) * -N[1],
                                         N[2] > 0.0 ? N[2] : sin( animation_time * 45.0  ) * -N[2] , 1.0 );
                    return;
                }
                
                // The rest of this shader calculates some quantities that the Fragment shader will need:
                vec3 camera_space_pos = ( camera_model_transform * vec4(object_space_pos, 1.0) ).xyz;
                E = normalize( -camera_space_pos );

                // Light positions use homogeneous coords.  Use w = 0 for a directional light source -- a vector instead of a point.
                for( int i = 0; i < N_LIGHTS; i++ ) {
                    L[i] = normalize( ( camera_transform * lightPosition[i] ).xyz - lightPosition[i].w * camera_space_pos );

                    // Is it a point light source?  Calculate the distance to it from the object.  Otherwise use some arbitrary distance.
                    dist[i]  = lightPosition[i].w > 0.0 ? distance((camera_transform * lightPosition[i]).xyz, camera_space_pos)
                                                        : distance( attenuation_factor[i] * -lightPosition[i].xyz, object_space_pos.xyz );
                }

                // Gouraud shading mode?  If so, finalize the whole color calculation here in the vertex shader,
                // one per vertex, before we even break it down to pixels in the fragment shader.   As opposed 
                // to Smooth "Phong" Shading, where we *do* wait to calculate final color until the next shader.
                if( GOURAUD ) {
                    VERTEX_COLOR      = vec4( shapeColor.xyz * ambient, shapeColor.w);
                    VERTEX_COLOR.xyz += phong_model_lights( N );
                }
            }`;
    }

    // ********* FRAGMENT SHADER *********
    // A fragment is a pixel that's overlapped by the current triangle.
    // Fragments affect the final image or get discarded due to depth.
    fragment_glsl_code() {
        return `
            uniform sampler2D texture;

            void main() {
                // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
                // Otherwise, we already have final colors to smear (interpolate) across vertices.
                if( GOURAUD || COLOR_NORMALS ) {
                    gl_FragColor = VERTEX_COLOR;
                    return;
                }                                 
                // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                // Phong shading is not to be confused with the Phong Reflection Model.

                // Sample the texture image in the correct place.
                vec4 tex_color = texture2D( texture, f_tex_coord );                    

                // Compute an initial (ambient) color:
                if( USE_TEXTURE )
                    gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
                else
                    gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
                
                // Compute the final color with contributions from lights.
                gl_FragColor.xyz += phong_model_lights( N );
            }`;
    }

    // Define how to synchronize our JavaScript's variables to the GPU's:
    update_GPU(g_state, model_transform, material, gpu=this.g_addrs, gl=this.gl) {

        // First, send the matrices to the GPU, additionally cache-ing some products of them we know we'll need:
        this.update_matrices(g_state, model_transform, gpu, gl);
        gl.uniform1f(gpu.animation_time_loc, g_state.animation_time / 1000);

        if (g_state.gouraud === undefined) {
            g_state.gouraud = g_state.color_normals = false;
        }

        // Keep the flags seen by the shader program up-to-date and make sure they are declared.
        gl.uniform1i(gpu.GOURAUD_loc, g_state.gouraud);
        gl.uniform1i(gpu.COLOR_NORMALS_loc, g_state.color_normals);

        // Send the desired shape-wide material qualities to the graphics card, where they will
        // tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shapeColor_loc,  material.color);
        gl.uniform1f( gpu.ambient_loc,     material.ambient);
        gl.uniform1f( gpu.diffusivity_loc, material.diffusivity);
        gl.uniform1f( gpu.specularity_loc, material.specularity);
        gl.uniform1f( gpu.smoothness_loc,  material.smoothness);

        // NOTE: To signal not to draw a texture, omit the texture parameter from Materials.
        if (material.texture) {
            gpu.shader_attributes["tex_coord"].enabled = true;
            gl.uniform1f(gpu.USE_TEXTURE_loc, 1);
            gl.bindTexture(gl.TEXTURE_2D, material.texture.id);
        }
        else {
            gl.uniform1f(gpu.USE_TEXTURE_loc, 0);
            gpu.shader_attributes["tex_coord"].enabled = false;
        }

        if (!g_state.lights.length)
            return;
        var lightPositions_flattened = [],
            lightColors_flattened = [],
            lightAttenuations_flattened = [];
        for (var i = 0; i < 4 * g_state.lights.length; i++) {
            lightPositions_flattened.push(g_state.lights[Math.floor(i / 4)].position[i % 4]);
            lightColors_flattened.push(g_state.lights[Math.floor(i / 4)].color[i % 4]);
            lightAttenuations_flattened[Math.floor(i / 4)] = g_state.lights[Math.floor(i / 4)].attenuation;
        }
        gl.uniform4fv(gpu.lightPosition_loc, lightPositions_flattened);
        gl.uniform4fv(gpu.lightColor_loc, lightColors_flattened);
        gl.uniform1fv(gpu.attenuation_factor_loc, lightAttenuations_flattened);
    }

    // Helper function for sending matrices to GPU.
    update_matrices(g_state, model_transform, gpu, gl) {
        // (PCM will mean Projection * Camera * Model)
        let [P,C,M] = [g_state.projection_transform, g_state.camera_transform, model_transform],
            CM = C.times(M),
            PCM = P.times(CM),
            inv_CM = Mat4.inverse(CM).sub_block([0, 0], [3, 3]);

        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.                                  
        gl.uniformMatrix4fv(gpu.camera_transform_loc, false, Mat.flatten_2D_to_1D(C.transposed()));
        gl.uniformMatrix4fv(gpu.camera_model_transform_loc, false, Mat.flatten_2D_to_1D(CM.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform_loc, false, Mat.flatten_2D_to_1D(PCM.transposed()));
        gl.uniformMatrix3fv(gpu.inverse_transpose_modelview_loc, false, Mat.flatten_2D_to_1D(inv_CM));
    }
}

// Movement_Controls is a Scene_Component that can be attached to a canvas, like any 
// other Scene, but it is a Secondary Scene Component -- meant to stack alongside other
// scenes.  Rather than drawing anything it embeds both first-person and third-person
// style controls into the website.  These can be uesd to manually move your camera or
// other objects smoothly through your scene using key, mouse, and HTML button controls
// to help you explore what's in it.
window.Movement_Controls = window.classes.Movement_Controls = class Movement_Controls extends Scene_Component {
    constructor(context, control_box, canvas=context.canvas) {
        super(context, control_box);
        
        // Data members
        [this.context,this.roll,this.look_around_locked,this.invert] = [context, 0, true, true];
        [this.thrust,this.pos,this.z_axis] = [Vec.of(0, 0, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 0)];

        // The camera matrix is not actually stored here inside Movement_Controls; instead, track
        // an external matrix to modify. This target is a reference (made with closures) kept
        // in "globals" so it can be seen and set by other classes.  Initially, the default target
        // is the camera matrix that Shaders use, stored in the global graphics_state object.
        this.target = function() {
            return context.globals.movement_controls_target()
        };
        context.globals.movement_controls_target = function(t) {
            return context.globals.graphics_state.camera_transform
        };
        context.globals.movement_controls_invert = this.will_invert = ()=>true;
        context.globals.has_controls = true;

        [this.radians_per_frame,this.meters_per_frame,this.speed_multiplier] = [1 / 200, 20, 1];

        // *** Mouse controls: ***
        this.mouse = { "from_center": Vec.of(0, 0) };

        // Measure mouse steering, for rotating the flyaround camera:
        const mouse_position = ( e, rect=canvas.getBoundingClientRect() ) => Vec.of(
            e.clientX - (rect.left + rect.right) / 2,
            e.clientY - (rect.bottom + rect.top) / 2);

        // Set up mouse response.  The last one stops us from reacting if the mouse leaves the canvas.
        document.addEventListener("mouseup", e=>{
            this.mouse.anchor = undefined;
        });
        canvas.addEventListener("mousedown", e=>{
            e.preventDefault();
            this.mouse.anchor = mouse_position(e);
        });
        canvas.addEventListener("mousemove", e=>{
            e.preventDefault();
            this.mouse.from_center = mouse_position(e);
        }
        );
        canvas.addEventListener("mouseout", e=>{
            if (!this.mouse.anchor)
                this.mouse.from_center.scale(0)
        });
    }

    show_explanation(document_element) {}
    
    // This function of a scene sets up its keyboard shortcuts.
    make_control_panel() {
        const globals = this.globals;
        this.control_panel.innerHTML += "Click and drag the scene to <br> spin your viewpoint around it.<br>";
        this.key_triggered_button("Up", [" "], ()=>this.thrust[1] = -1, undefined, ()=>this.thrust[1] = 0);
        this.key_triggered_button("Forward", ["w"], ()=>this.thrust[2] = 1, undefined, ()=>this.thrust[2] = 0);
        this.new_line();
        this.key_triggered_button("Left", ["a"], ()=>this.thrust[0] = 1, undefined, ()=>this.thrust[0] = 0);
        this.key_triggered_button("Back", ["s"], ()=>this.thrust[2] = -1, undefined, ()=>this.thrust[2] = 0);
        this.key_triggered_button("Right", ["d"], ()=>this.thrust[0] = -1, undefined, ()=>this.thrust[0] = 0);
        this.new_line();
        this.key_triggered_button("Down", ["z"], ()=>this.thrust[1] = 1, undefined, ()=>this.thrust[1] = 0);

        const speed_controls = this.control_panel.appendChild(document.createElement("span"));
        speed_controls.style.margin = "30px";
        this.key_triggered_button("-", ["o"], ()=>this.speed_multiplier /= 1.2, "green", undefined, undefined, speed_controls);
        this.live_string(box=>{
            box.textContent = "Speed: " + this.speed_multiplier.toFixed(2)
        }, speed_controls);
        this.key_triggered_button("+", ["p"], ()=>this.speed_multiplier *= 1.2, "green", undefined, undefined, speed_controls);
        this.new_line();
        this.key_triggered_button("Roll left", [","], ()=>this.roll = 1, undefined, ()=>this.roll = 0);
        this.key_triggered_button("Roll right", ["."], ()=>this.roll = -1, undefined, ()=>this.roll = 0);
        this.new_line();
        this.key_triggered_button("(Un)freeze mouse look around", ["f"], ()=>this.look_around_locked ^= 1, "green");
        this.new_line();
        this.live_string(box=>box.textContent = "Position: " + this.pos[0].toFixed(2) + ", " + this.pos[1].toFixed(2) + ", " + this.pos[2].toFixed(2));
        this.new_line();
        // The facing directions are actually affected by the left hand rule:
        this.live_string(box=>box.textContent = "Facing: "
            + ((this.z_axis[0] > 0 ? "West " : "East ")
            + (this.z_axis[1] > 0 ? "Down " : "Up ")
            + (this.z_axis[2] > 0 ? "North" : "South")));
        this.new_line();
        this.key_triggered_button("Go to world origin", ["r"], ()=>this.target().set_identity(4, 4), "orange");
        this.new_line();
        this.key_triggered_button("Attach to global camera", ["Shift", "R"],
            () => globals.movement_controls_target = ()=>globals.graphics_state.camera_transform, "blue");
        this.new_line();
    }

    first_person_flyaround(radians_per_frame, meters_per_frame, leeway=70) {
        const sign = this.will_invert ? 1 : -1;
        const do_operation = this.target()[this.will_invert ? "pre_multiply" : "post_multiply"].bind(this.target());
        // Compare mouse's location to all four corners of a dead box.
        const offsets_from_dead_box = {
            plus: [this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway],
            minus: [this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway]
        };
        // Apply a camera rotation movement, but only when the mouse is past a minimum distance (leeway) from the canvas's center:
        if (!this.look_around_locked) {
            // start increasing until outside a leeway window from the center.
            // Steer according to "mouse_from_center" vector, but don't
            for (let i = 0; i < 2; i++) {
                let o = offsets_from_dead_box,
                    velocity = ((o.minus[i] > 0 && o.minus[i]) || (o.plus[i] < 0 && o.plus[i])) * radians_per_frame;
                    do_operation(Mat4.rotation(sign * velocity, Vec.of(i, 1 - i, 0)));
            }
        }

        if (this.roll != 0)
            do_operation(Mat4.rotation(sign * .1, Vec.of(0, 0, this.roll)));
        
        // Now apply translation movement of the camera, in the newest local coordinate frame.
        do_operation(Mat4.translation(this.thrust.times(sign * meters_per_frame)));
    }
    third_person_arcball(radians_per_frame) {
        const sign = this.will_invert ? 1 : -1;
        const do_operation = this.target()[this.will_invert ? "pre_multiply" : "post_multiply"].bind(this.target());

        // Spin the scene around a point on an axis determined by user mouse drag.
        const dragging_vector = this.mouse.from_center.minus(this.mouse.anchor);
        if (dragging_vector.norm() <= 0)
            return;

        // The presumed distance to the scene is a hard-coded 25 units.
        do_operation(Mat4.translation([0, 0, sign * 25]));
        do_operation(Mat4.rotation(radians_per_frame * dragging_vector.norm(), Vec.of(dragging_vector[1], dragging_vector[0], 0)));
        do_operation(Mat4.translation([0, 0, sign * -25]));
    }

    // Camera code starts here.
    display(graphics_state, dt=graphics_state.animation_delta_time / 1000) {
        const m = this.speed_multiplier * this.meters_per_frame,
            r = this.speed_multiplier * this.radians_per_frame;
        
        // Do first-person.  Scale the normal camera aiming speed by dt for smoothness.
        this.first_person_flyaround(dt * r, dt * m);

        // Also apply third-person "arcball" camera mode if a mouse drag is occurring.
        if (this.mouse.anchor)
            this.third_person_arcball(dt * r);

        const inv = Mat4.inverse(this.target());
        this.pos = inv.times(Vec.of(0, 0, 0, 1));
        this.z_axis = inv.times(Vec.of(0, 0, 1, 0));
    }
}

// This Scene_Component can be added to a display canvas.  This particular one
// sets up the machinery to draw a simple scene demonstrating a few concepts.
// Scroll down to the display() method at the bottom to see where the shapes are drawn.
window.Tutorial_Animation = window.classes.Tutorial_Animation = class Tutorial_Animation extends Scene_Component {

    // The scene begins by requesting the camera, shapes, and materials it will need.
    constructor(context, control_box) {
        super(context, control_box);
        // First, include a couple other helpful components, including one that moves you around:
        if (!context.globals.has_controls)
            context.register_scene_component(new Movement_Controls(context,control_box.parentElement.insertCell()));

        // Define the global camera and projection matrices, which are stored in a scratchpad for globals.  The projection is special 
        // because it determines how depth is treated when projecting 3D points onto a plane.  The function perspective() makes one.
        // Its input arguments are field of view, aspect ratio, and distances to the near plane and far plane.
        context.globals.graphics_state.camera_transform = Mat4.translation([0, 0, -30]);
        // Locate the camera here (inverted matrix).
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, .1, 1000);

        const shapes = {
            'triangle': new Triangle(),
            // At the beginning of our program, load one of each of these shape 
            'strip': new Square(),
            // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
            'bad_tetrahedron': new Tetrahedron(false),
            // design.  Once you've told the GPU what the design of a cube is,
            'tetrahedron': new Tetrahedron(true),
            // it would be redundant to tell it again.  You should just re-use
            'windmill': new Windmill(10),
            // the one called "box" more than once in display() to draw
            'box': new Cube(),
            // multiple cubes.  Don't define more than one blueprint for the
            'ball': new Subdivision_Sphere(4)
        };
        // same thing here.
        this.submit_shapes(context, shapes);

        [this.hover,this.t] = [false, 0];
        // Define a couple of data members called "hover" and "t".

        // *** Materials: *** Define more data members here, returned from the material() function of our shader.  Material objects contain
        //                    shader configurations.  They are used to light and color each shape.  Declare new materials as temps when
        //                    needed; they're just cheap wrappers for some numbers.  1st parameter:  Color (4 floats in RGBA format).
        this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
            ambient: .4,
            diffusivity: .4
        });
        this.plastic = this.clay.override({
            specularity: .6
        });
        this.glass = context.get_instance(Phong_Shader).material(Color.of(.5, .5, 1, .2), {
            ambient: .4,
            specularity: .4
        });
        this.fire = context.get_instance(Funny_Shader).material();
        this.stars = this.plastic.override({
            texture: context.get_instance("assets/stars.png")
        });

        // *** Lights: *** Values of vector or point lights.  They'll be consulted by the shader when coloring shapes.  Two different lights 
        //                 *per shape* are supported by in the example shader; more requires changing a number in it or other tricks.
        //                 Arguments to construct a Light(): Light source position or vector (homogeneous coordinates), color, and intensity.
        this.lights = [new Light(Vec.of(30, 30, 34, 1),Color.of(0, .4, 0, 1),100000), new Light(Vec.of(-10, -20, -14, 0),Color.of(1, 1, .3, 1),100)];
    }

    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    make_control_panel() {
        // This line adds stationary text.  The next line adds live text.
        this.control_panel.innerHTML += "Creature rotation angle: <br>";
        this.live_string(box=>{
            box.textContent = (this.hover ? 0 : (this.t % (2 * Math.PI)).toFixed(2)) + " radians"
        });
        this.new_line();
        this.key_triggered_button("Hover in place", ["h"], function() {
            this.hover ^= 1;
        });
    }

    // Write the demo's description (a big long string) onto the web document.
    show_explanation(document_element) 
    {
        document_element.innerHTML += `
            <p>
            If you've written a computer program before but not in JavaScript, rest assured that it is mostly the
            same as other languages. 
            <a href=https://piazza.com/class_profile/get_resource/j855t03rsfv1cn/j9k7wljazkdsb target='_blank'>
            This .pdf document</a> lists down the similarities and differences between C++ and JavaScript that you might
            encounter here.  Google "es6" instead of "JavaScript" when learning to avoid missing newer capabilities.  Generally,
            you'll want to get comfortable with imperative, object oriented, and functional programming styles to use
            this library.   
            </p><p>
            This first article is meant to show how best to organize a 3D graphics program in JavaScript using WebGL -- a \"hello world\"
            example, or more accurately, \"hello triangle\". A lot of \"boilerplate\" code is required just to get a single 3D triangle
            to draw on a web canvas, and it's not at all obvious how to organize that code so that you can be flexible
            later, when you'll probably want to dynamically switch out pieces of your program whenever you want - whether
            they be other shader programs, vertex arrays (shapes), textures (images), or entire scenes. You might even want
            those things to happen whenever the user of your program presses a button.    
            </p><p>This \"hello triangle\" example is organized to do all that while keeping its source code tiny. A ~500
            line library file called tiny-graphics.js sets up all the flexibility mentioned above, and it's shared by all
            pages on this encyclopedia.  That file can always be accessed <a href=/tiny-graphics.js>here</a>.  A file called
            dependencies.js contains all the code required by the particular article you're viewing on the encyclopedia of code.
            Every article you navigate to on the encyclopedia will provide you with a minimal copy of dependencies.js, containing
            only the code that your current article needs.    
            </p><p>If you have never written a graphics program before, you'll need to know what a transformation matrix is in 3D
            graphics. Check out <a href=https://piazza.com/class_profile/get_resource/j855t03rsfv1cn/j9k7wl8ijmks0 target='_blank'>
            this other .pdf document</a> explaining those, including the three special matrices (rotation,
            translation, and scale) that you'll see over and over in graphics programs like this one. Finally,
            scroll down to the source code at the bottom to see how these functions are used to generate
            special matrices that draw the shapes in the right places in the 3D world.    
            </p><p>The scene shown here demonstrates a lot of concepts at once using very little code.  These include
            drawing your first triangle, storing trivial shapes, storing lights and materials and shader programs, flat vs.
            smooth shading, and matrix transformations.   You can see all the parts of the scene being drawn by the code written
            in the "display" function; these parts are all independent from one another, so feel free delete whichever sections
            you want from there and the other shapes will remain.  Save your changes to produce your own page.  For pretty
            demonstrations of more advanced topics, such as <a href=/Surfaces_Demo>Surface Patch shapes</a>,
            <a href=/Inertia_Demo>Inertia</a>, <a href=/Collision_Demo>Collision Detection</a>, and <a href=/Ray_Tracer>Ray
            Tracing</a>, use the blue bar at the top of this page to visit the next articles.  To see how a minimal but
            'functional game works, check out <a href=/Billiards>Billiards</a>.  To train yourself to get matrix order
            right when placing shapes, play the <a href=/Bases_Game>Bases Game</a>.
            </p>
   `
    }
    draw_arm(graphics_state, model_transform) // An example of how to break up the work of drawing into other functions.
    {
        const arm = model_transform.times(Mat4.translation([0, 0, 3 + 1]));
        this.shapes.ball.draw(graphics_state, arm, this.plastic.override({
            color: Color.of(0, 0, 1, .7)
        }));
    }
    display(graphics_state) {
        let model_transform = Mat4.identity();
        // This will be a temporary matrix that helps us draw most shapes.
        // It starts over as the identity every single frame - coordinate axes at the origin.
        graphics_state.lights = this.lights;
        // Override graphics_state with the default lights of this class. 

        const yellow = Color.of(1, 1, 0, 1)
          , gray = Color.of(.5, .5, .5, 1)
          , green = Color.of(0, .5, 0, 1);
        /**********************************
      Start coding down here!!!!
      **********************************/
        // From here on down it's just some example shapes drawn for you -- freely replace them 
        // with your own!  Notice the usage of the functions translation(), scale(), and rotation()
        // to generate matrices, and the functions times(), which generates products of matrices.

        model_transform = model_transform.times(Mat4.translation([0, 5, 0]));
        this.shapes.triangle.draw(graphics_state, model_transform, this.stars);
        // Draw the top triangle.

        model_transform = model_transform.times(Mat4.translation([0, -2, 0]));
        // Tweak our coordinate system downward for the next shape.
        this.shapes.strip.draw(graphics_state, model_transform, this.plastic.override({
            color: gray
        }));
        // Draw the square.
        // Find how much time has passed in seconds. Use that as input to build
        const t = this.t = graphics_state.animation_time / 1000;
        // and store a couple rotation matrices that vary over time.
        const tilt_spin = Mat4.rotation(12 * t, Vec.of(.1, .8, .1))
          , funny_orbit = Mat4.rotation(2 * t, Vec.of(Math.cos(t), Math.sin(t), .7 * Math.cos(t)));

        // All the shapes in a scene can share influence of the same pair of lights.  Alternatively, here's what happens when you
        // use different lights on part of a scene.  All the shapes below this line of code will use these moving lights instead.
        graphics_state.lights = [
            new Light(tilt_spin.times(Vec.of(30, 30, 34, 1)),Color.of(0, .4, 0, 1),100000),
            new Light(tilt_spin.times(Vec.of(-10, -20, -14, 0)),Color.of(1, 1, .3, 1),100 * Math.cos(t / 10))];

        // The post_multiply() function is like times(), but be careful with it; it modifies the originally stored matrix in
        // place rather than generating a new matrix, which could throw off your attempts to maintain a history of matrices. 
        model_transform.post_multiply(Mat4.translation([0, -2, 0]));
        // In the constructor, we requested two tetrahedron shapes, one with flat shading and one with smooth.
        this.shapes.tetrahedron.draw(graphics_state, model_transform.times(funny_orbit), this.plastic);
        // Show the flat tetrahedron.

        model_transform.post_multiply(Mat4.translation([0, -2, 0]));
        this.shapes.bad_tetrahedron.draw(graphics_state, model_transform.times(funny_orbit), // Show the smooth tetrahedron.  It's worse.
        this.plastic.override({
            color: Color.of(.5, .5, .5, 1)
        }));

        // Draw three of the "windmill" shape.  The first one spins over time.  The second demonstrates a custom shader, because
        // the material "fire" above was built from a different shader class than the others.  The third shows off transparency.
        model_transform.post_multiply(Mat4.translation([0, -2, 0]));
        this.shapes.windmill.draw(graphics_state, model_transform.times(tilt_spin), this.plastic);
        model_transform.post_multiply(Mat4.translation([0, -2, 0]));
        this.shapes.windmill.draw(graphics_state, model_transform, this.fire);
        model_transform.post_multiply(Mat4.translation([0, -2, 0]));
        this.shapes.windmill.draw(graphics_state, model_transform, this.glass);

        // Now to demonstrate some more useful (but harder to build) shapes:  A Cube and a Subdivision_Sphere.
        // If you look in those two classes they're a bit less trivial than the previous shapes.
        model_transform.post_multiply(Mat4.translation([0, -2, 0]));
        // Draw the ground plane:
        this.shapes.box.draw(graphics_state, model_transform.times(Mat4.scale([15, .1, 15])), this.plastic.override({
            color: green
        }));

        model_transform = model_transform.times(Mat4.translation(Vec.of(10, 10, 0)));
        // Move up off the ground.
        // Spin the coordinate system if the hover button hasn't been pressed:
        if (!this.hover)
            model_transform = model_transform.times(Mat4.rotation(-this.t, Vec.of(0, 1, 0)));
        // Begin drawing a "creature" with two arms.   
        this.shapes.ball.draw(graphics_state, model_transform, this.plastic.override({
            color: Color.of(.8, .8, .8, 1)
        }));
        // Placing shapes that barely touch each other requires knowing and adding half the length of each.
        model_transform = model_transform.times(Mat4.translation(Vec.of(0, -(1 + .2), 0)));
        this.shapes.box.draw(graphics_state, model_transform.times(Mat4.scale([3, .2, 3])), this.plastic.override({
            color: yellow
        }));
        // Each loop iteration, the following will draw the same thing on a different side due to a reflection:
        for (let side of [-1, 1]) // For each of the two values -1 and 1, reflect the
        {
            let flipped = model_transform.times(Mat4.scale([1, 1, side]));
            // coordinate system (or not) depending on the value.
            this.draw_arm(graphics_state, flipped);
            // Example of how to call your own function, passing
        }
        // in your matrix.
    }
}

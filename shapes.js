// includes MultiShape, Segment, and Spike


window.MultiShape = window.classes.MultiShape = class MultiShape extends Shape {
    constructor(shapes) {   //[M1, Shape1], [M2, Shape2], ... 
        super("positions", "normals");
        
        var indice_offset = 0;

        for (let p = 0; p < shapes.length; p++) {
            var M = shapes[p][0];
            var shape = shapes[p][1];

            for (let i = 0; i < shape.positions.length; i++) {
                this.positions.push( M.times(Vec.of(...shape.positions[i], 1)).to3() );
                this.normals.push( M.times(Vec.of(...shape.normals[i])).to3() );
            }
            for (let i = 0; i < shape.indices.length; i++) {
                this.indices.push(shape.indices[i]+indice_offset);
            }
            indice_offset += shape.positions.length;
        }

    }
}


window.Spike = window.classes.Spike = class Spike extends Shape {
    constructor(base_length, base_theta, base_phi) {
        super("positions", "normals");
        
        var n = 16;
        var remainder = base_theta%(Math.PI*2/n);
        var m = Mat4.rotation(base_theta - remainder, Vec.of(0, 0, 1));

        this.positions.push([0, 0, 0]);
        this.normals.push([0, 0, -1]);
        for (let i = 0; i < n; i++) {
            this.positions.push(m.times(Vec.of(Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0, 1)).to3());
            this.normals.push(m.times(Vec.of(Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0)).to3());
            //this.indices.push(0, i+1, i == n-1 ? 1 : i+2);
        }

        var phi = Mat4.rotation(base_phi, Vec.of(0, 1, 0));
        var theta = Mat4.rotation(base_theta, Vec.of(0, 0, 1));
        var T = Mat4.translation(Vec.of(0, 0, base_length));
        m = theta.times(phi).times(T);

        this.positions.push(m.times(Vec.of(0, 0, 0, 1)).to3() );
        this.normals.push(m.times(Vec.of(0, 0, 1, 0)).to3() );
        
        
        for (let i = 0; i < n; i++) {
            this.indices.push(i+1, i == n-1 ? 1 : i+2, n+1);
            
        }

    }
}


window.Grape = window.classes.Grape = class Grape extends Spike {
    constructor(base_length, base_theta, base_phi) {
        super("positions", "normals", "texture_coords");

//          // Start from the following equilateral tetrahedron:
//         this.positions.push(...Vec.cast([0, 0, -1], [0, .9428, .3333], [-.8165, -.4714, .3333], [.8165, -.4714, .3333]));

//         // Begin recursion.
//         this.subdivideTriangle(0, 1, 2, 10);
//         this.subdivideTriangle(3, 2, 1, 10);
//         this.subdivideTriangle(1, 0, 3, 10);
//         this.subdivideTriangle(0, 2, 3, 10);

//         for (let p of this.positions) {
//             this.normals.push(p.copy());
//             this.texture_coords.push(Vec.of(
//                 0.5 + Math.atan2(p[2], p[0]) / (2 * Math.PI),
//                 0.5 - Math.asin(p[1]) / Math.PI));
//         }

//         // Fix the UV seam by duplicating vertices with offset UV
//         let tex = this.texture_coords;
//         for (let i = 0; i < this.indices.length; i += 3) {
//             const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
//             if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
//                 && [a, b, c].some(x => tex[x][0] < 0.5))
//             {
//                 for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
//                     if (tex[q[0]][0] < 0.5) {
//                         this.indices[q[1]] = this.positions.length;
//                         this.positions.push(this.positions[q[0]].copy());
//                         this.normals.push(this.normals[q[0]].copy());
//                         tex.push(tex[q[0]].plus(Vec.of(1, 0)));
//                     }
//                 }
//             }
//         }
//     }

//     subdivideTriangle(a, b, c, count) {
//         if (count <= 0) {
//             this.indices.push(a, b, c);
//             return;
//         }

//         let ab_vert = this.positions[a].mix(this.positions[b], 0.5).normalized(),
//             ac_vert = this.positions[a].mix(this.positions[c], 0.5).normalized(),
//             bc_vert = this.positions[b].mix(this.positions[c], 0.5).normalized();

//         let ab = this.positions.push(ab_vert) - 1,
//             ac = this.positions.push(ac_vert) - 1,
//             bc = this.positions.push(bc_vert) - 1;

//         this.subdivideTriangle( a, ab, ac, count - 1);
//         this.subdivideTriangle(ab,  b, bc, count - 1);
//         this.subdivideTriangle(ac, bc,  c, count - 1);
//         this.subdivideTriangle(ab, bc, ac, count - 1);
//     }
    }
    

    }

window.Leaf = window.classes.Leaf = class Leaf extends Spike {
    constructor(base_length, base_theta, base_phi) {
        super("positions", "normals");
        
        var n = 20;
        var remainder = base_theta%(Math.PI*2/n);
        var m = Mat4.rotation(Math.PI, Vec.of(0, 0, 1));

        var len = 10;
        var wid = 5;

//        right side
        var w = 0;
        var l = len;

        this.positions.push([0,0,0]);
        this.normals.push([0,0,-1]);

        for (let i = 0; i < n; i++){
                
                if(i < 1/2*n){
                    this.positions.push(m.times(Vec.of(w,0,l)).to3());
                    this.normals.push(m.times(Vec.of(w,0,l)).to3());
                    this.positions.push(m.times(Vec.of(w+wid/n+wid/n/5,0, l-len/n+len/n/4)).to3());
                    this.normals.push(m.times(Vec.of(w+wid/n+wid/n/5,0, l-len/n+len/n/4)).to3()); 
                    w = w+wid/n;
                    l = l-len/n;

                }
                else{
                    this.positions.push(m.times(Vec.of(w,0,l)).to3());
                    this.normals.push(m.times(Vec.of(w,0,l)).to3());
                    this.positions.push(m.times(Vec.of(w-wid/n-wid/n/2,0, l-len/n+len/n/10)).to3());
                    this.normals.push(m.times(Vec.of(w-wid/n-wid/n/2,0, l-len/n+len/n/10)).to3());
                    w = w - wid/n;
                    l = l -len/n
                }

               
                this.positions.push(m.times(Vec.of(0,0,0,1)).to3());
                this.normals.push(m.times(Vec.of(0,0,0,1)).to3());

            

        }





        for (let i = 0; i < 3*n; i++){
           this.indices.push(i+1, i == 3*n-1 ? 1 : i+2, 3*n+1);
        }

//         left side
        var w = 0;
        var l = len;

        var m = Mat4.rotation(0*Math.PI, Vec.of(0, 0, 1));
     

        for (let i = 0; i < n; i++){
            if(i < 1/2*n){
                    this.positions.push(m.times(Vec.of(w,0,l)).to3());
                    this.normals.push(m.times(Vec.of(w,0,l)).to3());
                    this.positions.push(m.times(Vec.of(w+wid/n+wid/n/5,0, l-len/n+len/n/4)).to3());
                    this.normals.push(m.times(Vec.of(w+wid/n+wid/n/5,0, l-len/n+len/n/4)).to3()); 
                    w = w+wid/n;
                    l = l-len/n;

                }
                else{
                    this.positions.push(m.times(Vec.of(w,0,l)).to3());
                    this.normals.push(m.times(Vec.of(w,0,l)).to3());
                    this.positions.push(m.times(Vec.of(w-wid/n-wid/n/2,0, l-len/n+len/n/10)).to3());
                    this.normals.push(m.times(Vec.of(w-wid/n-wid/n/2,0, l-len/n+len/n/10)).to3());
                    w = w - wid/n;
                    l = l -len/n
                }

               
                this.positions.push(m.times(Vec.of(0,0,0,1)).to3());
                this.normals.push(m.times(Vec.of(0,0,0,1)).to3());
        }



        for (let i = 3*n; i < 6*n; i++){
           this.indices.push(i+1, i == 3*n-1 ? 1 : i+2, 3*n+1);
        }

    }
}


window.Segment = window.classes.Segment = class Segment extends Shape {
    constructor(base_length, base_theta, base_phi, end_size, end_theta, end_phi) {
        super("positions", "normals");
        
        var n = 16;
        var remainder = base_theta%(Math.PI*2/n);
        var m = Mat4.rotation(base_theta - remainder, Vec.of(0, 0, 1));


        this.positions.push([0, 0, 0]);
        this.normals.push([0, 0, -1]);
        for (let i = 0; i < n; i++) {
            this.positions.push(m.times(Vec.of(Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0, 1)).to3());
            this.normals.push(m.times(Vec.of(Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0)).to3());
            //this.indices.push(0, i+1, i == n-1 ? 1 : i+2);
        }

        var phi = Mat4.rotation(base_phi, Vec.of(0, 1, 0));
        var theta = Mat4.rotation(base_theta, Vec.of(0, 0, 1));
        var T = Mat4.translation(Vec.of(0, 0, base_length));
        var S = Mat4.scale(Vec.of(end_size, end_size, end_size));
        var tilt = Mat4.rotation(end_phi, Vec.of(Math.cos(end_theta+Math.PI*1/2), Math.sin(end_theta+Math.PI*1/2), 0));
        m = theta.times(phi).times(T).times(tilt).times(S);

        for (let i = 0; i < n; i++) {
            this.positions.push(m.times(Vec.of(Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0, 1)).to3());
            this.normals.push(m.times(Vec.of(Math.cos(Math.PI*2*i/n), Math.sin(Math.PI*2*i/n), 0, 0)).to3());
            //this.indices.push(n+1, i+n+2, i == n-1 ? n+2 : i+n+3);
        }
        
        
        for (let i = 0; i < n; i++) {
            this.indices.push(i+1, i == n-1 ? 1 : i+2, i+n+1);
            this.indices.push(i+n+1, i == n-1 ? n+1 : i+n+2, i == n-1 ? 1 : i+2);
        }

    }
}


window.Square = window.classes.Square = class Square extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");
        this.positions.push(     ...Vec.cast([-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0] ));
        this.normals.push(       ...Vec.cast([ 0,  0, 1], [0,  0, 1], [ 0, 0, 1], [0, 0, 1] ));
        this.texture_coords.push(...Vec.cast([ 0, 0],     [1, 0],     [ 0, 1],    [1, 1]   ));
        this.indices.push(0, 1, 2, 1, 3, 2);
    }
}

window.Circle = window.classes.Circle = class Circle extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([0, 0, 0], [1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1], [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([0.5, 0.5], [1, 0.5]));

        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 0]));
            this.normals.push(...Vec.cast(  [0,    0,    1]));
            this.texture_coords.push(...Vec.cast([(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                0, id - 1, id);
        }
    }
}

window.Cube = window.classes.Cube = class Cube extends Shape {
    constructor() {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast(
            [-1,  1, -1], [-1, -1, -1], [ 1,  1, -1], [ 1, -1, -1],
            [-1, -1,  1], [ 1, -1,  1], [-1,  1,  1], [ 1,  1,  1],
            [-1,  1,  1], [ 1,  1,  1], [-1,  1, -1], [ 1,  1, -1],
            [-1, -1, -1], [ 1, -1, -1], [-1, -1,  1], [ 1, -1,  1],
            [-1, -1, -1], [-1, -1,  1], [-1,  1, -1], [-1,  1,  1],
            [ 1, -1, -1], [ 1, -1,  1], [ 1,  1, -1], [ 1,  1,  1] 
        ));

        this.texture_coords.push(...Vec.cast(
            [0,    2/3], [0.25, 2/3], [0,    1/3], [0.25, 1/3],
            [0.5,  2/3], [0.5,  1/3], [0.75, 2/3], [0.75, 1/3],
            [0.75, 2/3], [0.75, 1/3], [1,    2/3], [1,    1/3],
            [0.25, 2/3], [0.25, 1/3], [0.5,  2/3], [0.5,  1/3],
            [0.25, 2/3], [0.5,  2/3], [0.25, 1  ], [0.5,  1  ],
            [0.25, 1/3], [0.5,  1/3], [0.25, 0  ], [0.5,  0  ]
        )); 

        this.normals.push(...Vec.cast(
            ...Array(4).fill([ 0,  0, -1]),
            ...Array(4).fill([ 0,  0,  1]),
            ...Array(4).fill([ 0,  1,  0]),
            ...Array(4).fill([ 0, -1,  0]),
            ...Array(4).fill([-1,  0,  0]),
            ...Array(4).fill([ 1,  0,  0])
        ));

        this.indices.push(
            0, 2, 1, 1, 2, 3,
            4, 5, 6, 5, 7, 6,
            8, 9, 10, 9, 11, 10,    
            12, 13, 14, 13, 15, 14,
            16, 19, 18, 16, 17, 19,
            20, 22, 21, 21, 22, 23
        );
    }
}


window.SimpleCube = window.classes.SimpleCube = class SimpleCube extends Shape {
    constructor() {
      super( "positions", "normals", "texture_coords" );
      for( var i = 0; i < 3; i++ )                    
        for( var j = 0; j < 2; j++ ) {
          var square_transform = Mat4.rotation( i == 0 ? Math.PI/2 : 0, Vec.of(1, 0, 0) )
                         .times( Mat4.rotation( Math.PI * j - ( i == 1 ? Math.PI/2 : 0 ), Vec.of( 0, 1, 0 ) ) )
                         .times( Mat4.translation([ 0, 0, 1 ]) );
          Square.insert_transformed_copy_into( this, [], square_transform );
      }
    }
}

window.Tetrahedron = window.classes.Tetrahedron = class Tetrahedron extends Shape {
    constructor(using_flat_shading) {
        super("positions", "normals", "texture_coords");
        const s3 = Math.sqrt(3) / 4,
            v1 = Vec.of(Math.sqrt(8/9), -1/3, 0),
            v2 = Vec.of(-Math.sqrt(2/9), -1/3, Math.sqrt(2/3)),
            v3 = Vec.of(-Math.sqrt(2/9), -1/3, -Math.sqrt(2/3)),
            v4 = Vec.of(0, 1, 0);

        this.positions.push(...Vec.cast(
            v1, v2, v3,
            v1, v3, v4,
            v1, v2, v4,
            v2, v3, v4));

        this.normals.push(...Vec.cast(
            ...Array(3).fill(v1.plus(v2).plus(v3).normalized()),
            ...Array(3).fill(v1.plus(v3).plus(v4).normalized()),
            ...Array(3).fill(v1.plus(v2).plus(v4).normalized()),
            ...Array(3).fill(v2.plus(v3).plus(v4).normalized())));

        this.texture_coords.push(...Vec.cast(
            [0.25, s3], [0.75, s3], [0.5, 0], 
            [0.25, s3], [0.5,  0 ], [0,   0],
            [0.25, s3], [0.75, s3], [0.5, 2 * s3], 
            [0.75, s3], [0.5,  0 ], [1,   0]));

        this.indices.push(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
    }
}

window.Cylinder = window.classes.Cylinder = class Cylinder extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 1], [1, 0, -1]));
        this.normals.push(...Vec.cast(  [1, 0, 0], [1, 0,  0]));
        this.texture_coords.push(...Vec.cast([0, 1], [0, 0]));

        for (let i = 0; i < sections; ++i) {
            const ratio = (i + 1) / sections,
                angle = 2 * Math.PI * ratio,
                v = Vec.of(Math.cos(angle), Math.sin(angle)),
                id = 2 * i + 2;

            this.positions.push(...Vec.cast([v[0], v[1], 1], [v[0], v[1], -1]));
            this.normals.push(...Vec.cast(  [v[0], v[1], 0], [v[0], v[1],  0]));
            this.texture_coords.push(...Vec.cast([ratio, 1], [ratio, 0]));
            this.indices.push(
                id, id - 1, id + 1,
                id, id - 1, id - 2);
        }
    }
}

window.Cone = window.classes.Cone = class Cone extends Shape {
    constructor(sections) {
        super("positions", "normals", "texture_coords");

        this.positions.push(...Vec.cast([1, 0, 0]));
        this.normals.push(...Vec.cast(  [0, 0, 1]));
        this.texture_coords.push(...Vec.cast([1, 0.5]));

        let t = Vec.of(0, 0, 1);
        for (let i = 0; i < sections; ++i) {
            const angle = 2 * Math.PI * (i + 1) / sections,
                v = Vec.of(Math.cos(angle), Math.sin(angle), 0),
                id = 2 * i + 1;

            this.positions.push(...Vec.cast(t, v));
            this.normals.push(...Vec.cast(
                v.mix(this.positions[id - 1], 0.5).plus(t).normalized(),
                v.plus(t).normalized()));
            this.texture_coords.push(...Vec.cast([0.5, 0.5], [(v[0] + 1) / 2, (v[1] + 1) / 2]));
            this.indices.push(
                id - 1, id, id + 1);
        }
    }
}

// This Shape defines a Sphere surface, with nice (mostly) uniform triangles.  A subdivision surface
// (see) Wikipedia article on those) is initially simple, then builds itself into a more and more 
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
            this.normals.push(p.copy());
            this.texture_coords.push(Vec.of(
                0.5 + Math.atan2(p[2], p[0]) / (2 * Math.PI),
                0.5 - Math.asin(p[1]) / Math.PI));
        }

        // Fix the UV seam by duplicating vertices with offset UV
        let tex = this.texture_coords;
        for (let i = 0; i < this.indices.length; i += 3) {
            const a = this.indices[i], b = this.indices[i + 1], c = this.indices[i + 2];
            if ([[a, b], [a, c], [b, c]].some(x => (Math.abs(tex[x[0]][0] - tex[x[1]][0]) > 0.5))
                && [a, b, c].some(x => tex[x][0] < 0.5))
            {
                for (let q of [[a, i], [b, i + 1], [c, i + 2]]) {
                    if (tex[q[0]][0] < 0.5) {
                        this.indices[q[1]] = this.positions.length;
                        this.positions.push(this.positions[q[0]].copy());
                        this.normals.push(this.normals[q[0]].copy());
                        tex.push(tex[q[0]].plus(Vec.of(1, 0)));
                    }
                }
            }
        }
    }

    subdivideTriangle(a, b, c, count) {
        if (count <= 0) {
            this.indices.push(a, b, c);
            return;
        }

        let ab_vert = this.positions[a].mix(this.positions[b], 0.5).normalized(),
            ac_vert = this.positions[a].mix(this.positions[c], 0.5).normalized(),
            bc_vert = this.positions[b].mix(this.positions[c], 0.5).normalized();

        let ab = this.positions.push(ab_vert) - 1,
            ac = this.positions.push(ac_vert) - 1,
            bc = this.positions.push(bc_vert) - 1;

        this.subdivideTriangle( a, ab, ac, count - 1);
        this.subdivideTriangle(ab,  b, bc, count - 1);
        this.subdivideTriangle(ac, bc,  c, count - 1);
        this.subdivideTriangle(ab, bc, ac, count - 1);
    }
}

// Animate wire fram spaceships from the Elite game for BBC Micro, Commodore 64, Acorn Electron, etc.
// https://elite.bbcelite.com/deep_dives/ship_blueprints.html

// Built on:
// One Formula That Demystifies 3D Graphics
// by Tsoding
// https://www.youtube.com/watch?v=qjWkNZ0SXfo
// https://github.com/tsoding/formula

const BACKGROUND = "#101010"
const FOREGROUND = "#50FF50"

// Animate Elite ships
const elite_ships = true

//console.log(game)
game.width = 800
game.height = 800
const ctx = game.getContext("2d")
//console.log(ctx)

// Clear screen
function clear() {
	ctx.fillStyle = BACKGROUND
	ctx.fillRect(0, 0, game.width, game.height)
}

// Draw a point on screen as a square size*size pixels
function point({x, y}, size) {
	ctx.fillStyle = FOREGROUND
	ctx.fillRect(x - size/2, y - size/2, size, size)
}

// Scales -1..1 world to game width and height
function screen({x, y}) {
	// -1..1 -> 0..2 -> 0..1 -> 0..w/h
	return {
		x: (x+1)/2*game.width,
		y: (1 - (y+1)/2)*game.height
	}
}

// Perspective projection
// Projects point from x, y, z world to 2D plane
function project({x, y, z}, focal) {
	return {
		x: focal * x/z,
		y: focal * y/z
	}
}

// Move point along z axis
function translate_z({x, y, z}, dz) {
	//return {x, y, z: z + dz}
	return {x, y, z: z + dz}
}

// Rotate around y axis
function rotate_xz({x, y, z}, angle_rad) {
	const c = Math.cos(angle_rad)
	const s = Math.sin(angle_rad)
	return {
		x: x*c - z*s,
		y,
		z: x*s + z*c
	}
}

// Rotate around z axis
function rotate_xy({x, y, z}, angle_rad) {
	const c = Math.cos(angle_rad)
	const s = Math.sin(angle_rad)
	return {
		x: x*c - y*s,
		y: x*s + y*c,
		z
	}
}

// Rotate around x axis
function rotate_yz({x, y, z}, angle_rad) {
	const c = Math.cos(angle_rad)
	const s = Math.sin(angle_rad)
	return {
		x,
		y: y*c - z*s,
		z: y*s + z*c,
	}
}

// Draw a line on screen
function line(p1, p2) {
	ctx.lineWidth = 2
	ctx.strokeStyle = FOREGROUND
	ctx.beginPath()
	ctx.moveTo(p1.x, p1.y)
	ctx.lineTo(p2.x, p2.y)
	ctx.stroke()
}

const FPS = 60
let dz = 1
let angle_rad = 0

// Corners of the box moving away from the eye
function frame1() {
	const dt = 1/FPS
	dz += 1*dt
	angle_rad += Math.PI*dt
	clear()
	for (const v of vs) {
		point(screen(project(translate_z(rotate_xz(v, angle_rad), dz), 1)))
	}
	setTimeout(frame1, 1000/FPS)
}

// Convert Elite ship point data format to format used in this demo
// Data is scaled to max_size 0..1
function scaleEliteVertex(vs_arr, max_size) {
	let vs = []
	let max_x = 0
	let max_y = 0
	let max_z = 0
	let max = 0
	for (const elm of vs_arr) {
		// x, y and z is at 0, 1 and 2
		if (Math.abs(elm[0]) > max_x) max_x = Math.abs(elm[0])
		if (Math.abs(elm[1]) > max_y) max_y = Math.abs(elm[1])
		if (Math.abs(elm[2]) > max_z) max_z = Math.abs(elm[2])
	}
	//console.log("Max x: " + max_x)
	//console.log("Max y: " + max_y)
	//console.log("Max z: " + max_z)
	
	if (max_x > max) max = max_x
	if (max_y > max) max = max_y
	if (max_z > max) max = max_z
	//console.log("max: " + max)
	
	for (const elm of vs_arr) {
		vs.push({
			x: elm[0]/max*max_size,
			y: elm[1]/max*max_size,
			z: elm[2]/max*max_size,
		})
	}
	return vs
}

// Convert Elite ship edges to format used in this demo
function convertEliteEdges(fs_arr) {
	let fs = []
	for (const elm of fs_arr) {
		fs.push([
			elm[0],
			elm[1],
		])
	}
	return fs
}

if (elite_ships) {
	vs = scaleEliteVertex(vs_raw, 0.3)
	fs = convertEliteEdges(fs_raw)
}

// Display rotating model at fixed distance from eye
function frame() {
	const draw_dots = false
	const draw_vertices = true
	const dt = 1/FPS
	const focal = 1.5
	//dz += 1*dt
	angle_rad += Math.PI*dt
	clear()
	if (draw_dots) {
		for (const v of vs) {
			point(screen(project(translate_z(rotate_xz(rotate_xy(rotate_yz(v, angle_rad), angle_rad/2), angle_rad/4), dz), focal)), 10)
		}
	}
	if (draw_vertices) {
		for (const f of fs) {
			for (let i = 0; i < f.length; i++) {
				const a = vs[f[i]]
				const b = vs[f[(i+1)%f.length]]
				line(screen(project(translate_z(rotate_xz(rotate_xy(rotate_yz(a, angle_rad), angle_rad/2), angle_rad/4), dz), focal)),
					screen(project(translate_z(rotate_xz(rotate_xy(rotate_yz(b, angle_rad), angle_rad/2), angle_rad/4), dz), focal)))
			}
		}
	}
	setTimeout(frame, 1000/FPS)
}

//setTimeout(frame1, 1000/FPS)
setTimeout(frame, 1000/FPS)
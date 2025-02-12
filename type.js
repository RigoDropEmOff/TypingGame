//canvas and ctx creation
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
canvas.width = '1000';
canvas.height = '600';
document.getElementsByTagName('body')[0].appendChild(canvas);
//load the audio file
var popSound = new Audio('pop.mp3');
var dieSound = new Audio('die.mp3');
//set the volume
popSound.volume = 0.5;
dieSound.volume = 0.5;
//keypress handler, turns keycode into character stored in chr variable
function key_down_handler(event) {
    key_pressed = true;
    if (event.keyCode == 8) {
        chr = 'backspace';
    } else {
        chr = (String.fromCharCode(event.keyCode)).toLowerCase();
    }
}
document.addEventListener('keydown', key_down_handler);
//game
//Global Variables
var chr;    //character pressed
var key_pressed = false;    //key_pressed boolean
var current_word = '';  //current input string
var word_index = 0;     //
var word_x;     // input x-position
var word_y;     // input y-position
var started = false;    //bool to check if user has typed "start"
var word_list = ['phone', 'buzzbar', 'park','skateboard','true','carwash','wallet', 'rigo','function'];
var focus = 0;  //which enemy is in focus
var word_speed = 0; //speed word is moving by
var start_time = new Date().getTime() / 1000;   //start-time in seconds
var delta_time = 0.0;
var c = 0;  //used to start time, fix later
var word_counter = 0;   //number of enemies destroyed
var spawnrate = 0;  //number of words at the screen at the same time
var game_is_over = false;  
var score = 0;
var in_settings = false;
var difficulty = 0;
var menu_enemy = [];

function start_clock(){
    if (started === true && c === 0) {
        start_time = new Date().getTime() / 1000;
        c++;
    }
}
function get_wpm( ) {
    /* calculates wpm */
    var minutes = delta_time / 60;
    var wpm = Math.floor(word_counter / minutes);
    ctx.fillStyle = "orange";
    ctx.font = "10px Arial"
    ctx.fillText(wpm.toString(), 900, 50);
}
class Enemy{
    constructor(text, x_pos, y_pos, dead, placeholder_x, chrs_correct){
        this.text = text;
        this.x_pos = x_pos;
        this.y_pos;
        this.dead = dead;
        this.placeholder_x = placeholder_x;
        this.chrs_correct = chrs_correct;
    }
    draw(){
        if (this.dead == false){
            this.placeholder_x = this.x_pos;    //set placeholder
            for (var i = 0; i < this.text.length; i++){
                var ch = this.text.charAt(i);
                if (i < this.chrs_correct && this == enemies[focus]){
                    ctx.fillStyle = 'blue';
                } else{
                    ctx.fillStyle = 'white';
                }
                ctx.font = '20px Arial';
                ctx.fillText(ch, this.x_pos, this.y_pos);
                this.x_pos += ctx.measureText(ch).width;
            }
            this.x_pos = this.placeholder_x;    //reset x location
        } else{
            this.text = word_list[Math.floor(Math.random() * word_list.length)];
            if (started) { this.x_pos = 0; }
            else { this.x_pos = -200; } //sets position off-screen if not started
            this.y_pos = Math.floor(Math.random() * canvas.height);
            if (this.y_pos > (canvas.height / 2)) {
                this.y_pos -= 20;
            } else {
                this.y_pos += 20;
            }
            this.dead = false;
    }
}
get_chrs_correct(){
    /*
    this function updates the chrs_correct variable to the correct 
    number of correct characters */
this.chrs_correct = 0;
for (var i = 0; i < this.text.length; i++){
    if (this.text.charAt(i) == current_word.charAt(i)){
        this.chrs_correct++;
    } else{
        break;
    }
}
}
}
function popAnimation(x, y) {
    const popRadius = 10;
    const numCircles = 10;
    const popSpeed = 2;

    for (let i = 0; i < numCircles; i++) {
        setTimeout(() => {
            const circle = {
                x: x,
                y: y,
                radius: 0,
                color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
                maxRadius: popRadius + Math.random() * popRadius,
                speed: popSpeed + Math.random() * popSpeed
            };

            const animateCircle = () => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                ctx.fillStyle = circle.color;
                ctx.fill();

                if (circle.radius < circle.maxRadius) {
                    circle.radius += circle.speed;
                    requestAnimationFrame(animateCircle);
                }
            };

            requestAnimationFrame(animateCircle);
        }, i * 50);
    }
}
//generate enemies
var enemies = [];
var spacing = canvas.width / 8;
for (var i = 0; i < 8; i++) {
    enemies[i] = new Enemy('', spacing * i, 200, true,'');
    spawnrate++
}

function start_or_lose(){
    /* start and lose menus */
    if (started != true && in_settings === false){
        enemies[0].text = "start";
        enemies[0].x_pos = 450;
        enemies[0].y_pos = 200;
        enemies[1].text = "options";
        enemies[1].x_pos = 450;
        enemies[1].y_pos = 300;
        if (game_is_over){
            game_over();
        }
    }
    // check if enemy is off-screen
    for(enemy of enemies) {
        if(enemy.x_pos > canvas.width){
            started = false;    //stop game
            spawnrate = 6;
            enemies.splice(5, enemies.length - 5);
            word_speed = 0; //stop movement
            for (e of enemies){
                e.x_pos = -200;
            }
            game_is_over = true;
            score = Math.floor(delta_time);
            game_over();    //call the game_over function
            break;
        }
    }
}

function settings_menu(){
    enemies[0].text = "medium";
    enemies[0].x_pos = 450;
    enemies[0].y_pos = 200;
    enemies[1].text = "extreme";
    enemies[1].x_pos = 450;
    enemies[1].y_pos = 300;

    if(current_word === enemies[0].text){
        difficulty = 0;
        in_settings = false;
    } else if (current_word === enemies[0].text){
        difficulty = 1;
        in_settings = false;
    }
}
function game_over() {
	/* this function displays game-over screen */
	ctx.fillStyle = "white";
	ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", 100, 50);
    ctx.fillStyle = "white";
	ctx.fillText("You survived for " + score.toString() + " seconds.", 100, 150);
	ctx.fillText("You killed " + word_counter.toString() + " words.", 100, 250);
    dieSound.currentTime = 0;
    dieSound.play();
}

function draw_input() {
    /* 
        loops through current word and colors 
        characters accordingly 
    */
    for (var i = 0; i < current_word.length; i++) {
        var ch = current_word.charAt(i);
        if (i < enemies[focus].chrs_correct) {
            ctx.fillStyle = 'white';
        } else {
            ctx.fillStyle = 'red';
        }
        ctx.font = '50px Arial';
        ctx.fillText(ch, word_x, word_y);
        word_x += ctx.measureText(ch).width;
    }
}

function find_focus() {
    /* finds focus based on first character of word
       and how far it is from the end of the screen */
    if (started === false) {
    	if (current_word.charAt(0) === 's') {
    		focus = 0;
    	} else if (current_word.charAt(0) === 'o') {
    		focus = 1;
    	}
    } else {
        var highest = -10000;
        for (enemy of enemies) {
            if (current_word.charAt(0) === enemy.text.charAt(0)) {
                if (enemy.x_pos > highest) {
                    highest = enemy.x_pos;
                    focus = enemies.indexOf(enemy);
                }
            } 
        }
    }
}

var placeholder_time = 0.0;

function dynamic_difficulty() {
	/* increases numbers of words on screen every 5 seconds */
	if (started === true && placeholder_time === 0.0) {
		placeholder_time = delta_time;
	}
	if (delta_time - placeholder_time > 5) {
		spawnrate++;
		placeholder_time = 0.0;
	}
    if (enemies.length < spawnrate) {
        // Spawn new enemies with a random horizontal spacing
        const randomSpacing = Math.random() * (canvas.width / spawnrate);
        const newX = -randomSpacing;
        const newY = Math.random() * (canvas.height - 40) + 20; // Adjust vertical position as needed
        enemies[enemies.length] = new Enemy('', newX, newY, true, '');
    }
}
/*var lastSpawnTime = 0; // Variable to keep track of the last enemy spawn time

    // Check if it's time to spawn a new enemy
    if (delta_time - lastSpawnTime > 0.5) { // Adjust the delay as needed (0.5 seconds here)
        if (enemies.length < spawnrate) {
            enemies[enemies.length] = new Enemy('', -50, 200, true, '');
            lastSpawnTime = delta_time; // Update last spawn time
        }
    }*/

function draw() { // the game-loop
    // clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    start_clock(); // starts clock once game starts

    delta_time = (new Date().getTime() / 1000) - start_time; // seconds after start

    if (in_settings) {
    	settings_menu();
    }
    dynamic_difficulty(); // enables harder and harder
    start_or_lose(); // handles start and lose of game
    get_wpm(); // displays wpm
    find_focus(); // finds which enemy to focus

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw(); // draws enemy
        enemies[i].x_pos += word_speed;// moves enemy
    }
    // calculate stuff
    word_x = 800; // reset x
    word_y = 350; // reset y

    if (key_pressed) {
        if (chr == ' ') {
            word_index = 0; // reset word index
            chrs_correct = 0; // reset chrs correct
            if (current_word == enemies[focus].text) {
            	console.log('re');
            	started = true;   // starts game
                word_speed = 1;   // words start moving (after start)
                in_settings = false;
                if (started === false) {
                	in_settings = true; // turn on settings menu
                }
                enemies[focus].dead = true; // random_word is destroyed
                word_counter++; // increase enemies destroyed
                popAnimation(enemies[focus].placeholder_x, enemies[focus].y_pos);
                //play the popping sound
                popSound.currentTime = 0; //reset audio to start
                popSound.play();
            }
            current_word = ''; // word is reset
        } else if (chr == 'backspace') {
            current_word = current_word.slice(0, -1); // removes last character
            if (word_index != 0) { word_index--; } // decrease word index
        } else {
            word_index++;
            current_word += chr; // adds character to word
        }
        key_pressed = false; // not accepting keypress
    }

    enemies[focus].get_chrs_correct(); // updates chrs_correct

    draw_input(); // display the current guess
    
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

// since it is a class both letter are capitilized
// player class. Shows the image that the player is, the height and width
//also the shape of it
game.PlayerEntity = me.Entity.extend({
	init: function(x, y, settings) {
		this._super(me.Entity, 'init', [x, y, {
			image: "player", 
			width: 64,
			height: 64,
			spritewidth: "64",
			spriteheight: "64",
			getShape: function(){
				return(new me.Rect(0, 0, 100, 70)).toPolygon();
			} 
			}]);
		//sets the speed of the character
		this.type ="PlayerEntity";
		this.health = 20;
		this.body.setVelocity(5, 20);
		//keeps track of what direction your character is going
		this.facing = "right";
		//keeps track of what time it is for the game
		this.now = new Date().getTime();
		//lets the character hit the other characters over and over again
		this.lastHit = this.now;
		this.lastAttack = new Date().getTime();
		//where ever the player goes the screen follows
		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);


		//this anmiantion is used for when we are just standing
		this.renderable.addAnimation("idle", [78]);
		//adds animation to orcs/ characters walk
		// 80 at the end is the speed of the walk
		// the numbers in the brackets are the different pics we are using for the animation
		this.renderable.addAnimation("walk", [117, 118, 119, 120, 121, 122, 123, 124, 125], 80);
		//adds animation to the action attack
		this.renderable.addAnimation("attack", [65, 66, 67, 68, 69, 70, 71, 72], 80);

		//sets currect animation
		this.renderable.setCurrentAnimation("idle");

	},

	update: function(delta){
		//updates this.now
		this.now = new Date().getTime();
		//checks and sees if the right key is pressed
		if(me.input.isKeyPressed("right")){
			// adds the position of my x by adding the velocity defined above in
			// setVelocity() and multiplying it by me.timer.tick
			// me.timer.tick makes the movement look smooth
			this.body.vel.x += this.body.accel.x * me.timer.tick;
			//checks what way your character is going
			this.facing = "right";
			//flips the character so he doesnt go backwards
			this.flipX(true);
			//if we press the wrong button then the else statement will go into effect
			// if statement binds the left key so that we can move left
		}else if(me.input.isKeyPressed("left")){
			this.facing = "left";
			this.body.vel.x -=this.body.accel.x * me.timer.tick;
			this.flipX(false);

			}else{
			this.body.vel.x = 0;
		}
		//not in else statement because jumping involves the y axis not the x
		// binds the space bar so that we can jump
		if(me.input.isKeyPressed("jump") && !this.body.jumping && !this.body.falling){
			this.body.jumping = true;
			this.body.vel.y -= this.body.accel.y * me.timer.tick;
		}


		//if attack key is pressed character will attack
		if(me.input.isKeyPressed("attack")){
			//checks if it has gone through its animation stage
			if(!this.renderable.isCurrentAnimation("attack")){
				//sets the current animation to attackand once that is over
				// goes back to the idle animation
				this.renderable.setCurrentAnimation("attack", "idle");
				//makes it so that the next time we start this sequence we begin
				// from the the first animation, not wherever we left off when we
				// switched to another animation
				//this.renderable.setCurrentAnimationFrame();
			}
		}
		//checks if character is moving
		//checks that we dont have an attack animation going on
		else if(this.body.vel.x !== 0 && !this.renderable.isCurrentAnimation("attack")){
		//if statement checks to see whats going on with the character
		if(!this.renderable.isCurrentAnimation("walk")){
			this.renderable.setCurrentAnimation("walk");
		}
	}//else statement fixes the error of the character walking backwards
	else if(!this.renderable.isCurrentAnimation("attack")){
		this.renderable.setCurrentAnimation("idle");
	}

		//checks for collisions
		me.collision.check(this, true, this.collideHandler.bind(this), true);

		

		// tells the code above to work
		this.body.update(delta);
		
		//another call to the parent class
		this._super(me.Entity, "update", [delta]);
		return true;
	},

	loseHealth: function(damage){
		this.health = this.health - damage;
		console.log(this.health);		
	},
	// tells us if we collide with the enemy base
	collideHandler: function(response){
		if(response.b.type==='EnemyBaseEntity'){
			var ydif = this.pos.y - response.b.pos.y;
			var xdif = this.pos.x - response.b.pos.x;
 			
 			//checks to see when character collides with enemy base
			//console.log("xdif " + xdif + "ydif " + ydif);

			//jumping through the top of the enemy base
			if(ydif<-40 && xdif< 70 && xdif>-35){
				this.body.falling = false;
				this.body.vel.y = -1;
			}
			//the the player goes more than the number placed then it will stop moving
			//facing code allows us to move away from the base
			// xdif makes sure that both if statements wont trigger
			else if(xdif>-35 && this.facing==='right' && (xdif<0)){
				//stops player from moving if they hit the base
				this.body.vel.x = 0;
				// moves player back a bit
				this.pos.x = this.pos.x - 1;
				//else if statement is used if the character is facing left
			}else if(xdif<70 && this.facing ==='left'  && xdif>0){
				this.body.vel.x = 0;
				this.pos.x = this.pos.x +1;
			}
			//checks if the current animation is attack
			if(this.renderable.isCurrentAnimation("attack") && this.now-this.lastHit >= 1000){
				console.log("tower Hit");
				this.lastHit = this.now;
				//character dies
				response.b.loseHealth();
			}
		}else if(response.b.type==='EnemyCreep'){
			var xdif = this.pos.x - response.b.pos.x;
			var ydif = this.pos.y - response.b.pos.y;

			if (xdif>0) {
				this.pos.x = this.pos.x + 1;
				if (this.facing==="left") {
					this.vel.x = 0;
				}
			}else{
				this.pos.x = this.pos.x - 1;
				if(this.facing==="right"){
					this.vel.x = 0;
				}
			}
			
			if(this.renderable.isCurrentAnimation("attack") && this.now-this.lastHit >= 1000
					&& (Math.abs(ydif) <=40) && 
					((xdif>0) && this.facing==="left")	|| ((xdif<0) &&)
					){
				this.lastHit = this.now;
				response.b.loseHealth(1);
			}
		}
	}

});

//loads the player base from melon js
game.PlayerBaseEntity = me.Entity.extend({
	init : function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, {
			image: "tower",
			width: 100,
			height: 100,
			spritewidth: "100",
			spriteheight: "100",
			getShape: function(){
				return (new me.Rect(0, 0, 100, 70)).toPolygon();
			}
		}]);
		//tells us the tower has not been destroyed
		this.broken = false;
		//gives the tower a health
		this.health = 10;
		//even if we cannot see the screen it will still update
		this.alwaysUpdate = true;
		//if someone runs into the tower it will be able to collide
		this.body.onCollision = this.onCollision.bind(this);

		//type that can be used later during other collisons
		this.type = "PlayerBase";
		//adds animation to the tower
		this.renderable.addAnimation("idle", [0]);
		this.renderable.addAnimation("broken", [1]);
		this.renderable.setCurrentAnimation("idle");
	},

	update:function(delta){
		// tells us to die if health is less than zero
		if(this.health<=0){
			this.broken = true;
			this.renderable.setCurrentAnimation("broken");
		}
		this.body.update(delta);

		this._super(me.Entity, "update", [delta]);
		return true;
	},

	//function for loosing health when attacking
	loseHealth: function(damage){
		this.health = this.health - damage;

	},

	onCollision: function(){

	}

});
// _____________________________________________________________________________________________________________________________




//loads the player base from melon js
game.EnemyBaseEntity = me.Entity.extend({
	init : function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, {
			image: "tower",
			width: 100,
			height: 100,
			spritewidth: "100",
			spriteheight: "100",
			getShape: function(){
				return (new me.Rect(0, 0, 100, 70)).toPolygon();
			}
		}]);
		//tells us the tower has not been destroyed
		this.broken = false;
		//gives the tower a health
		this.health = 10;
		//even if we cannot see the screen it will still update
		this.alwaysUpdate = true;
		//if someone runs into the tower it will be able to collide
		this.body.onCollision = this.onCollision.bind(this);

		//type that can be used later during other collisons
		this.type = "EnemyBaseEntity";

		//renderable used to set animaton
		//sets the animation to the enemy base
		this.renderable.addAnimation("idle", [0]);
		this.renderable.addAnimation("broken", [1]);
		this.renderable.setCurrentAnimation("idle");
	},

	update:function(delta){
		// tells us to die if health is less than zeron
		if(this.health<=0){
			this.broken = true;
			this.renderable.setCurrentAnimation("broken");
		}
		this.body.update(delta);

		this._super(me.Entity, "update", [delta]);
		return true;
	},

	onCollision: function(){
		
	},

	loseHealth: function(){
		//losses health
		this.health--;
	}

});
// line 85- 91 makes the player move while walking

game.EnemyCreep = me.Entity.extend({
	init: function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, {
			//loads our image creep 1 from our resources folder
			image: "creep1",
			width: 32,
			height: 64,
			spritewidth: "32",
			spriteheight: "64",
			getShape: function(){
				return (new me.Rect(0, 0, 32, 64)).toPolygon();
			}
		}]);
		this.health = 10;
		this.alwaysUpdate = true;
		//this.attacking lets us know if the enemy is currently attacking
		this.attacking = false;
		//keeps track of when our creep last attacked anything
		this.lastAttacking = new Date().getTime();
		// keeps track of last thing our creep hit anything
		this.lastHit = new Date().getTime();
		this.now = new Date().getTime();
		//sets veloctiy
		this.body.setVelocity(3, 20);

		this.type = "EnemyCreep";

		//sets animation/ how fast it walks
		this.renderable.addAnimation("walk", [3, 4, 5], 80);
		//sets the current animation of the character
		this.renderable.setCurrentAnimation("walk");
	},

	loseHealth: function (damage){
		this.health = this.health - damage;	
	},

	update: function(delta){
		if(this.health <= 0) {
			me.game.world.removeChild(this);
		}   

		this.now = new Date().getTime();
		//has player accelerate
		this.body.vel.x -= this.body.accel.x * me.timer.tick;

		//checks for collisions with our player
		//if there are collisions it passes it to collide handler
		me.collision.check(this, true, this.collideHandler.bind(this), true);

		this.body.update(delta);

		this._super(me.Entity, "update", [delta]);

		return true;

	},

	//handels collisons with the player
	//any lines of code that deal with the collisions above get sent down here and passed through
	collideHandler: function(response) {
		//some simple code to start it off
		//shows what we are colliding with
		if(response.b.type === 'PlayerBase') {
			//tells if we are attacking
			this.attacking = true;
			//timer that tells the last time the player attacked
			//this.lastAttacking=this.now;
			//sets velocity to zero
			this.body.vel.x = 0;
			//if we get to close to the base we will stop
			//keeps moving the creep to the right to maintain its position
			this.pos.x = this.pos.x + 1;
			//checks that it has been at least one second since this creep has hit a base
			//checks another timer
			//lets you attack again if you had attacked the last second
			if((this.now-this.lastHit >= 1000)){
				//updates the last hit timer
				this.lastHit = this.now;
				//makes the player base call its loose health function and passes it at a
				//damage of 1
				//a function that causes the player to loose some health
				response.b.loseHealth(1);
			}
		}else if (response.b.type==='PlayerEntity'){
			var xdif = this.pos.x - response.b.pos.x;

			this.attacking = true;
			//timer that tells the last time the player attacked
			//this.lastAttacking=this.now;
			//sets velocity to zero
			if (xdif>0) {
				this.pos.x = this.pos.x + 1;
				//checks that it has been at least one second since this creep has hit a base
				//checks another timer
				this.body.vel.x = 0;
				//if we get to close to the base we will stop
				//keeps moving the creep to the right to maintain its position
				//lets you attack again if you had attacked the last second
			}
			if((this.now-this.lastHit >= 1000)  && xdif>0){
				//updates the last hit timer
				this.lastHit = this.now;
				//makes the player base call its loose health function and passes it at a
				//damage of 1
				//a function that causes the player to loose some health
				response.b.loseHealth(1);
			}

		}
	}
});

//handles timers in the game
game.GameManager = Object.extend({
	init: function(x, y, settings){
		this.now = new Date().getTime();
		this.lastCreep = new Date().getTime();

		this.alwaysUpdate = true;
	},

	update: function(){
		this.now = new Date().getTime();

		//controls when the creep spons
		if(Math.round(this.now/1000)%10 ===0 && (this.now - this.lastCreep >= 1000)){
			//controls when the creep spons
			this.lastCreep = this.now;
			//bulids a creep and puts it into the world
			var creepe = me.pool.pull("EnemyCreep", 1000, 0, {});
			me.game.world.addChild(creepe, 5);

		}

		return true;
	}
});

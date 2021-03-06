game.PlayerEntity = me.Entity.extend({
	init: function(x, y, settings) {
			this.setSuper();
			this.setPlayerTimers();
			this.setAttributes();
			this.type = "PlayerEntity";
			this.setFlags();

			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

			this.addAnimation();

			this.renderable.setCurrentAnimation("idle");
	},

	setSuper: function(){
		this._super(me.Entity, 'init', [x, y, {
				image: "player",
				width: 64,
				height: 64,
				spritewidth: "64",
				spriteheight: "64",
				getShape: function() {
					return(new me.Rect (0, 0, 64, 64)).toPolygon();
				}
			}]);
	},

	setPlayerTimers: function() {
		this.now = new Date().getTime();
		this.lastHit = this.now;
		this.lastAttack = new Date().getTime();

	},

	setAttributes: function() {
		this.health = game.data.playerHealth;
		this.body.setVelocity(game.data.playerMoveSpeed, 20);
		this.attack = game.data.playerAttack
	},

	setFlags: function() {
			// keeps track of which directiion your character is going
		this.facing = "right";
		this.dead = false;
		this.attacking = false;
	},

	addAnimation: function() {
		this.renderable.addAnimation("idle", [78]);
		this.renderable.addAnimation("walk", [117, 118, 119, 120, 121, 123, 124, 125], 80);
		this.renderable.addAnimation("attack", [65, 66, 67, 68, 69, 70, 71, 72], 80);

	},

	update: function(delta){
		this.now = new Date().getTime();

		this.dead = checkIfDead();

		this.checkKeyPressedAndMoved();

			if(this.attacking) {
				if(!this.renderable.isCurrentAnimation("attack")){
					// sets the current animation to attack and once that is over
					// goes back to the idle animation
					this.renderable.setCurrentAnimation("attack", "idle");
					// Makes it so that the next time we start this sequence we begin
					// from the first animation, not wherever we left off when
					// switched to another animation
					this.renderable.setAnimationFrame();
				}
			}
   			else if(this.body.vel.x !== 0 && !this.renderable.isCurrentAnimation("attack")) {
				if(!this.renderable.isCurrentAnimation("walk")) {
				this.renderable.setCurrentAnimation("walk");
				}
			}else if(!this.renderable.isCurrentAnimation("attack")) {
				this.renderable.setCurrentAnimation("idle");
			}

			me.collision.check(this, true, this.collideHandler.bind(this), true);
			this.body.update(delta);

			this._super(me.Entity, "update", [delta]);
			return true;
		},

		checkIfDead: function() {
			if(this.health <= 0){
				return true;
		}
		return false;

		},

		checkKeyPressesAndMoved: function() {
			if(me.input.isKeyPressed("right")){

			}else if (me.input.isKeyPressed("left")) {
				this.moveLeft();
			}else{
				this.body.vel.x = 0;
			}

			if(me.input.isKeyPressed("jump") && !this.body.jumping && !this.body.falling) {
				this.jump();
			}

			this.attacking = me.input.isKeyPressed("attack")
		},

		moveRight: function(){
			// adds the pos. of my x by adding the velocity defined above in
			// setVelocity() and multiplying it by me.timer.tick
			// me.timer.tick makes the movement smooth
				this.body.vel.x += this.body.accel.x * me.timer.tick;
				this.facing = "right";
				this.flipX(true);
			// flips character
			// animates the character
		},

		moveLeft: function() {
			this.facing = "left";
			this.body.vel.x -=this.body.accel.x * me.timer.tick;
			this.flipX(false);
		},

		jump: function() {
			this.body.jumping = true;
			this.body.vel.y -= this.body.accel.y * me.timer.tick;
		}

		loseHealth: function(damage) {
			this.health = this.health - damage;
		},

		collideHandler: function (response) {
			if(response.b.type==='EnemyBaseEntity'){
				this.collideWithEnemyBase(response);
			}else if(response.b.type==='EnemyCreep'){
				this.collideWithEnemyCreep(response);
			}
		},

		collideWithEnemyBase: function(response){
				var xdif = this.pos.x - response.b.pos.x;
				var ydif = this.pos.y - response.b.pos.y;

				if (xdif>0) {
					// this.pos.x = this.pos.x + 1;
					if(this.facing==="left"){
						this.body.vel.x = 0;
					}

				}else{
					// this.pos.x = this.pos.x - 1;
					if(this.facing==="right"){
						this.body.vel.x = 0;
				}
			}

				if(this.renderable.isCurrentAnimation("attack") && this.now-this.lastHit >= game.data.playerAttackTimer
						&& (Math.abs(ydif) <=40) && (((xdif>0 ) && this.facing==="left") 
						|| ((xdif < 0) && this.facing=== "right"))) {
					this.lastHit = this.now;
				// if the creeps health is less than our attack, execute code in if statement
					if(response.b.health <= game.data.playerAttack) {
						// adds one gold for a creep kill
						game.data.gold += 1;
						console.log("Current gold:" + game.data.gold);
					}

					response.b.loseHealth(game.data.playerAttack);
				}
		}
		collideWithEnemyCreep: function(response){
				var xdif = this.pos.x - response.b.pos.x;
				var ydif = this.pos.y - response.b.pos.y;
         
                this.stopMovement(xdif);

				if(this.renderable.isCurrentAnimation("attack") && this.now-this.lastHit >= game.data.playerAttackTimer
						&& (Math.abs(ydif) <=40) && (((xdif>0 ) && this.facing==="left") 
						|| ((xdif < 0) && this.facing=== "right"))) {
					this.lastHit = this.now;
				// if the creeps health is less than our attack, execute code in if statement
					if(response.b.health <= game.data.playerAttack) {
						// adds one gold for a creep kill
						game.data.gold += 1;
						console.log("Current gold:" + game.data.gold);
					}

					response.b.loseHealth(game.data.playerAttack);
				    }
	},

	stopMovement: function(xdif){
		if (xdif>0) {
					// this.pos.x = this.pos.x + 1;
					if(this.facing==="left"){
						this.body.vel.x = 0;
					}

				}else{
					// this.pos.x = this.pos.x - 1;
					if(this.facing==="right"){
						this.body.vel.x = 0;
				}
			}
	}


});

game.GameManager = Object.extend({
	init: function(x, y, settings) {
		this.now = new Date().getTime();
		this.lastCreep = new Date().getTime();
		this.paused = false;
		this.alwaysUpdate = true;

	},

	update: function() {
		this.now = new Date().getTime();

		if(game.data.player.dead) {
			me.state.current().resetPlayer(10, 0);
			me.game.world.removeChild(game.data.player);
			me.state.current().resetPlayer(10, 0);

		}

		if(!Math.round(this.now/1000)%20 ===0 && (this.now - this.lastCreep >= 1000)){
			game.data.gold +=1;
			console.log("Current gold: " + game.data.gold);
			 
		}


		if(!Math.round(this.now/1000)%10 ===0 && (this.now - this.lastCreep >= 1000)){
			this.lastCreep = this.now;
			var creepe = me.pool.pull("EnemyCreep", 1000, 0, {});
			me.game.world.addChild(creepe, 5);
		}

		return true;
	}
});
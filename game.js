const scoreEl = document.querySelector('#scoreEl')
const canvas = document.querySelector('canvas')
const startBtn = document.querySelector('#startBtn')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const backgroundImage = new Image();
backgroundImage.src = './images/asfalt-light.png';

class Player {
    constructor() {
        this.position = {
            x: 200,
            y: 200
        }

        this.velocity = {
            x: 0,
            y: 0
        }
        this.opacity = 1

        const image = new Image();
        image.src = './images/spaceship.png';
        image.onload = () => {
            const scale = 0.15;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            };
        };
    }

    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    update() {
        if (this.image) {
            this.draw()
            this.position.x += this.velocity.x;
        }
    }
}

class Projectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;

        this.radius = 4;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Particle {
    constructor({position, velocity, radius, color}) {
        this.position = position;
        this.velocity = velocity;

        this.radius = radius;
        this.color = color;
        this.opacity = 1;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.opacity -= 0.01;
    }
}

class InvaderProjectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;

        this.width = 3;
        this.height = 10;
    }

    draw() {
        c.fillStyle = 'white';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor({position}) {
        this.position = {
            x: 200,
            y: 200
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        const image = new Image();
        image.src = './images/invader.png';
        image.onload = () => {
            const scale = 1;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: position.x,
                y: position.y
            };
        };
    }

    draw() {
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    update({velocity}) {
        if (this.image) {
            this.draw();
            this.position.x += velocity.x;
            this.position.y += velocity.y;
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile({
            position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            velocity: {
                x: 0,
                y: 5
            }
        }));
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        };

        this.velocity = {
            x: 3,
            y: 0
        };

        this.invaders = [];
        const columns = Math.floor(Math.random() * 10 + 5);
        const rows = Math.floor(Math.random() * 5 + 2);

        this.width = columns * 30;

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    position: {
                        x: x * 30,
                        y: y * 30
                    }
                }));
            }
        }
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        this.velocity.y = 0;

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x;
            this.velocity.y = 30;
        }
    }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];
const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
    over: false,
    active: false
};
let score = 0;

function createParticles({object, color}) {
    for (let i = 0; i < 15; i++) {
        particles.push(
            new Particle({
                position: {
                    x: object.position.x + object.width / 2,
                    y: object.position.y + object.height / 2
                },
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2
                },
                radius: Math.random() * 3,
                color: color || 'BAA0DE'
            })
        );
    }
}

function animate() {
    if (!game.active) return;
    requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    player.update();
    particles.forEach((particle, i) => {
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1);
            }, 0);
        } else {
            particle.update();
        }
    });

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
            }, 0);
        } else invaderProjectile.update();

        if (
            invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width
        ) {
            console.log('you lose');

            setTimeout(() => {
                invaderProjectiles.splice(index, 1);
                player.opacity = 0;
                game.over = true;
            }, 0);

            setTimeout(() => {
                game.active = false;
                startBtn.disabled = false;
            }, 2000);
            createParticles({
                object: player,
                color: 'white'
            });
        }
    });

    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            });
        } else {
            projectile.update();
        }
    });

    grids.forEach((grid, gridIndex) => {
        grid.update();
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
        }
        grid.invaders.forEach((invader, i) => {
            invader.update({velocity: grid.velocity});

            projectiles.forEach((projectile, j) => {
                if (
                    projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y
                ) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find((invader2) => invader2 === invader);
                        const projectileFound = projectiles.find((projectile2) => projectile2 === projectile);

                        if (invaderFound && projectileFound) {
                            score += 100;
                            console.log(score);
                            scoreEl.innerHTML = `Score: ${score}`;

                            createParticles({
                                object: invader
                            });
                            grid.invaders.splice(i, 1);
                            projectiles.splice(j, 1);

                            if (grid.invaders.length === 0) {
                                grids.splice(gridIndex, 1);
                            }
                        }
                    }, 0);
                }
            });
        });
    });

    if (keys.a.pressed && player.position.x >= 0) {
        player.velocity.x = -5;
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5;
    } else {
        player.velocity.x = 0;
    }

    if (keys.space.pressed) {
        if (frames % 5 === 0) {
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -5
                }
            }));
        }
    }

    frames++;
}

function startGame() {
    game.active = true;
    game.over = false;
    score = 0;
    scoreEl.innerHTML = `Score: ${score}`;
    startBtn.disabled = true;
    player.opacity = 1;
    projectiles.length = 0;
    invaderProjectiles.length = 0;
    particles.length = 0;
    grids.length = 0;
    grids.push(new Grid());
    animate();
}

startBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (game.over) return;
    switch (e.key) {
        case 'a':
            keys.a.pressed = true;
            break;
        case 'd':
            keys.d.pressed = true;
            break;
        case ' ':
            keys.space.pressed = true;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case ' ':
            keys.space.pressed = false;
            break;
    }
})

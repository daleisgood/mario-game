const { Client, Account, Databases, ID, Query } = Appwrite;
const projectId = "66a8953c001c84761438";
const databaseId = "66a8b0bf00080f729b2e";
const collectionId = "66a8b0dd0006819f3ad4";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("66a8953c001c84761438");

const account = new Account(client);
const database = new Databases(client);

function register(event) {
  account
    .create(
      ID.unique(),
      event.target.elements["register-email"].value,
      event.target.elements["register-password"].value,
      event.target.elements["register-username"].value
    )
    .then((response) => {
      console.log(response);
      database.createDocument(databaseId, collectionId, response.$id, {
        userId: response.$id,
        highscore: 0,
      });

      account.createEmailSession(
        event.target.elements["register-email"].value,
        event.target.elements["register-password"].value
      );
    })
    .then(() => {
      showDisplay();
    })
    .catch((error) => console.error(error));
  event.preventDefault();
}

function login(event) {}

function showDisplay() {
  const modalElement = document.getElementById("modal");
  modalElement.classList.add("hidden");
}

showDisplay();

function startGame() {
  kaboom({
    global: true,
    fullscreen: true,
    scale: 2,
    clearColor: [0, 0, 0, 1],
  });

  //Speed identifiers
  const moveSpeed = 120;
  const jumpForce = 360;
  const bigJumpForce = 550;
  let currentJumpForce = jumpForce;
  const fallDeath = 400;
  const enemySpeed = 20;

  // Game Logic
  let isJumping = true;
  //sample kasi firstime magrepo sa github haha
  loadSprite("coin", "./img/coin.png"); //"wbKxhcd.png"
  loadSprite("evil-shroom", "./img/blue-evil-shroom.png"); //KPO3ffR9.png
  loadSprite("brick", "./img/brick.png"); // pogC9x5
  loadSprite("block", "./img/block.png"); //M6rwarW
  loadSprite("mario", "./img/mario.png"); //Wb1qfhK.png
  loadSprite("mushroom", "./img/shroom.png"); //0wMd92p.png
  loadSprite("surprise", "./img/surprise.png"); //gesQ1KP.png
  loadSprite("unbox", "./img/unbox.png"); //bdrLpi6.png
  loadSprite("pipe-top-left", "./img/pipe-TL.png"); // ReTPiWY.png
  loadSprite("pipe-top-right", "./img/pipe-TR.png"); //hj2GK4n.png
  loadSprite("pipe-bottom-left", "./img/pipe-BL.png"); //c1cYSbt.png
  loadSprite("pipe-bottom-right", "./img/pipe-BR.png"); //nqQ79eI.png
  loadSprite("blue-block", "./img/blue-block.png"); //fVscIbn.png
  loadSprite("blue-brick", "./img/blue-brick.png"); //3e5YRQd.png
  loadSprite("blue-steel", "./img/blue-steel.png"); // gqVoI2b.png
  loadSprite("blue-evil-shroom", "./img/blue-evil-shroom.png"); //SvV4ueD.png
  loadSprite("blue-surprise", "./img/blue-surprise.png"); // RMqCc1G.png

  scene("game", ({ level, score }) => {
    layers(["bg", "obj", "ui"], "obj");

    const maps = [
      [
        "                                                    ",
        "                                                    ",
        "                                                    ",
        "                                                    ",
        "                                                    ",
        "         %    =*=%=                                 ",
        "                                                    ",
        "                                    -+              ",
        "                       ^    ^       ()              ",
        "========================================    ========",
      ],
      [
        "?                                                        ?",
        "?                                                        ?",
        "?                                                        ?",
        "?                                                        ?",
        "?                                                        ?",
        "?                                                        ?",
        "?                                                        ?",
        "?        @@@@@@                              x x         ?",
        "?                                          x x x         ?",
        "?                                        x x x x   x   -+?",
        "?                      ^    ^          x x x x x   x   ()?",
        "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
      ],
    ];
    const levelCfg = {
      width: 20,
      height: 20,
      "=": [sprite("block"), solid()],
      $: [sprite("coin"), "coin"],
      "%": [sprite("surprise"), solid(), "coin-surprise"],
      "*": [sprite("surprise"), solid(), "mushroom-surprise"],
      "}": [sprite("unbox"), solid()],
      "(": [sprite("pipe-bottom-left"), solid(), scale(0.5)],
      ")": [sprite("pipe-bottom-right"), solid(), scale(0.5)],
      "-": [sprite("pipe-top-left"), solid(), scale(0.5), "pipe"],
      "+": [sprite("pipe-top-right"), solid(), scale(0.5), "pipe"],
      "^": [sprite("evil-shroom"), solid(), scale(0.5), "dangerous"],
      "#": [sprite("mushroom"), solid(), "mushroom", body()],
      "!": [sprite("blue-block"), solid(), scale(0.5)],
      "?": [sprite("blue-brick"), solid(), scale(0.5)],
      z: [sprite("blue-evil-shroom"), solid(), scale(0.5), "dangerous"],
      "@": [sprite("blue-surprise"), solid(), scale(0.5), "coin-surprise"],
      x: [sprite("blue-brick"), solid(), scale(0.5)],
    };

    const gameLevel = addLevel(maps[level], levelCfg);

    const scoreLabel = add([
      text(score),
      pos(30, 6),
      layer("ui"),
      {
        value: score,
      },
    ]);

    add([text(" level " + parseInt(level + 1)), pos(40, 6)]);

    const player = add([
      sprite("mario", solid()),
      pos(30, 0),
      body(),
      big(),
      origin("bot"),
    ]);

    function big() {
      let timer = 0;
      let isBig = false;
      return {
        update() {
          if (isBig) {
            currentJumpForce = bigJumpForce;
            timer -= dt();
            if (timer <= 0) {
              this.smallify();
            }
          }
        },
        isBig() {
          return isBig;
        },
        smallify() {
          this.scale = vec2(1);
          currentJumpForce = jumpForce;
          timer = 0;
          isBig = false;
        },
        biggify(time) {
          this.scale = vec2(2);
          timer = time;
          isBig = true;
        },
      };
    }

    player.on("headbump", (obj) => {
      if (obj.is("coin-surprise")) {
        gameLevel.spawn("$", obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn("}", obj.gridPos.add(0, 0));
      }
      if (obj.is("mushroom-surprise")) {
        gameLevel.spawn("#", obj.gridPos.sub(0, 1));
        destroy(obj);
        gameLevel.spawn("}", obj.gridPos.add(0, 0));
      }
    });

    action("mushroom", (m) => {
      m.move(20, 0);
    });

    player.collides("mushroom", (m) => {
      destroy(m);
      player.biggify(6);
    });

    player.collides("coin", (c) => {
      destroy(c);
      scoreLabel.value++;
      scoreLabel.text = scoreLabel.value;
    });

    action("dangerous", (d) => {
      d.move(-enemySpeed, 0);
    });

    player.collides("dangerous", (d) => {
      if (isJumping) {
        destroy(d);
      } else {
        go("lose", { score: scoreLabel.value });
      }
    });

    player.action(() => {
      camPos(player.pos);
      if (player.pos.y >= fallDeath) {
        go("lose", { score: scoreLabel.value });
      }
    });

    player.collides("pipe", () => {
      keyPress("down", () => {
        go("game", {
          level: (level + 1) % maps.length,
          score: scoreLabel.value,
        });
      });
    });

    keyDown("left", () => {
      player.move(-moveSpeed, 0);
    });

    keyDown("right", () => {
      player.move(moveSpeed, 0);
    });

    player.action(() => {
      if (player.grounded()) {
        isJumping = false;
      }
    });

    keyPress("space", () => {
      if (player.grounded()) {
        isJumping = true;
        player.jump(currentJumpForce);
      }
    });

    scene("lose", ({ score }) => {
      add([text(score, 32), origin("center"), pos(width() / 2, height() / 2)]);
    });
  });

  start("game", { level: 0, score: 0 });
}

startGame();

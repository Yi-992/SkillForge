import { useEffect, useRef } from "react";
import Phaser from "phaser";

function TetrisModal({ onClose }) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (containerRef.current) containerRef.current.innerHTML = "";

    class TetrisScene extends Phaser.Scene {
      constructor() {
        super("Tetris");
        this.cols = 10;
        this.rows = 20;
        this.tile = 26;

        this.baseDropDelay = 800;
        this.dropDelay = 800;

        this.moveDelay = 120;
        this.rotateDelay = 200;

        this.lastDrop = 0;
        this.lastMove = 0;
        this.lastRotate = 0;

        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
      }

      preload() {
        this.load.audio("move", "/sfx/move.wav");
        this.load.audio("rotate", "/sfx/rotate.wav");
        this.load.audio("drop", "/sfx/drop.wav");
        this.load.audio("clear", "/sfx/clear.wav");
        this.load.audio("gameover", "/sfx/gameover.wav");
      }

      create() {
        this.sfx = {
          move: this.sound.add("move"),
          rotate: this.sound.add("rotate"),
          drop: this.sound.add("drop"),
          clear: this.sound.add("clear"),
          gameover: this.sound.add("gameover")
        };

        this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));

        this.shapes = [
          [[1, 1, 1, 1]],
          [[1, 1], [1, 1]],
          [[0, 1, 0], [1, 1, 1]],
          [[1, 0, 0], [1, 1, 1]],
          [[0, 0, 1], [1, 1, 1]],
          [[0, 1, 1], [1, 1, 0]],
          [[1, 1, 0], [0, 1, 1]]
        ];

        this.colors = [
          0x38bdf8,
          0xfbbf24,
          0xa78bfa,
          0xfb7185,
          0x34d399,
          0xf97316,
          0x22d3ee
        ];

        this.graphics = this.add.graphics();
        this.nextPreview = this.add.graphics();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.nextIndex = Phaser.Math.Between(0, this.shapes.length - 1);
        this.spawnPiece();

        this.scoreText = this.add.text(300, 40, "Score: 0", { fontSize: "18px", color: "#e5e7eb" });
        this.linesText = this.add.text(300, 70, "Lines: 0", { fontSize: "18px", color: "#e5e7eb" });
        this.levelText = this.add.text(300, 100, "Level: 1", { fontSize: "18px", color: "#93c5fd" });

        this.gameOverText = this.add.text(40, 230, "GAME OVER", {
          fontSize: "32px",
          color: "#ef4444",
          fontStyle: "bold"
        }).setVisible(false);
      }

      spawnPiece() {
        const i = this.nextIndex;
        this.nextIndex = Phaser.Math.Between(0, this.shapes.length - 1);

        this.piece = {
          shape: this.shapes[i],
          color: this.colors[i],
          x: Math.floor(this.cols / 2) - 1,
          y: 0
        };

        if (this.collide(0, 0)) {
          this.endGame();
        }
      }

      endGame() {
        this.gameOver = true;
        this.sfx.gameover.play();
        this.gameOverText.setVisible(true);
      }

      rotate(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
      }

      collide(offsetX = 0, offsetY = 0, testShape = null) {
        const shape = testShape || this.piece.shape;
        for (let y = 0; y < shape.length; y++) {
          for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
              const nx = x + this.piece.x + offsetX;
              const ny = y + this.piece.y + offsetY;
              if (
                nx < 0 ||
                nx >= this.cols ||
                ny >= this.rows ||
                (ny >= 0 && this.board[ny][nx])
              ) return true;
            }
          }
        }
        return false;
      }

      merge() {
        this.piece.shape.forEach((row, y) => {
          row.forEach((v, x) => {
            if (v) this.board[y + this.piece.y][x + this.piece.x] = this.piece.color;
          });
        });
      }

      sweep() {
        let cleared = 0;
        outer: for (let y = this.rows - 1; y >= 0; y--) {
          for (let x = 0; x < this.cols; x++) {
            if (!this.board[y][x]) continue outer;
          }
          this.board.splice(y, 1);
          this.board.unshift(Array(this.cols).fill(0));
          cleared++;
          y++;
        }

        if (cleared > 0) {
          this.sfx.clear.play();
          this.lines += cleared;
          this.score += cleared * 100 * this.level;
          this.level = Math.floor(this.lines / 10) + 1;
          this.dropDelay = Math.max(100, 800 - (this.level - 1) * 60);

          this.scoreText.setText("Score: " + this.score);
          this.linesText.setText("Lines: " + this.lines);
          this.levelText.setText("Level: " + this.level);

          this.cameras.main.shake(100, 0.01);
        }
      }

      hardDrop() {
        while (!this.collide(0, 1)) {
          this.piece.y++;
        }
        this.merge();
        this.sfx.drop.play();
        this.sweep();
        this.spawnPiece();
      }

      update(time) {
        if (this.gameOver) return;

        if (this.cursors.left.isDown && time - this.lastMove > this.moveDelay) {
          if (!this.collide(-1, 0)) {
            this.piece.x--;
            this.sfx.move.play();
          }
          this.lastMove = time;
        }

        if (this.cursors.right.isDown && time - this.lastMove > this.moveDelay) {
          if (!this.collide(1, 0)) {
            this.piece.x++;
            this.sfx.move.play();
          }
          this.lastMove = time;
        }

        if (this.cursors.up.isDown && time - this.lastRotate > this.rotateDelay) {
          const r = this.rotate(this.piece.shape);
          if (!this.collide(0, 0, r)) {
            this.piece.shape = r;
            this.sfx.rotate.play();
          }
          this.lastRotate = time;
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.hardDrop();
        }

        const speed = this.cursors.down.isDown ? 80 : this.dropDelay;

        if (time - this.lastDrop > speed) {
          if (!this.collide(0, 1)) {
            this.piece.y++;
          } else {
            this.merge();
            this.sfx.drop.play();
            this.sweep();
            this.spawnPiece();
          }
          this.lastDrop = time;
        }

        this.draw();
      }

      draw() {
        this.graphics.clear();
        this.graphics.fillStyle(0x020617);
        this.graphics.fillRoundedRect(0, 0, 260, 520, 12);

        for (let y = 0; y < this.rows; y++) {
          for (let x = 0; x < this.cols; x++) {
            if (this.board[y][x]) {
              this.graphics.fillStyle(this.board[y][x]);
              this.graphics.fillRect(x * this.tile + 6, y * this.tile + 6, this.tile - 2, this.tile - 2);
            }
          }
        }

        this.piece.shape.forEach((row, y) => {
          row.forEach((v, x) => {
            if (v) {
              this.graphics.fillStyle(this.piece.color);
              this.graphics.fillRect(
                (this.piece.x + x) * this.tile + 6,
                (this.piece.y + y) * this.tile + 6,
                this.tile - 2,
                this.tile - 2
              );
            }
          });
        });

        // Next preview
        this.nextPreview.clear();
        this.nextPreview.fillStyle(0x020617);
        this.nextPreview.fillRect(300, 140, 120, 120);

        const shape = this.shapes[this.nextIndex];
        const color = this.colors[this.nextIndex];
        shape.forEach((row, y) =>
          row.forEach((v, x) => {
            if (v) {
              this.nextPreview.fillStyle(color);
              this.nextPreview.fillRect(320 + x * 20, 160 + y * 20, 18, 18);
            }
          })
        );
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 500,
      height: 520,
      parent: containerRef.current,
      backgroundColor: "#0f172a",
      scene: TetrisScene
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      initializedRef.current = false;
    };
  }, []);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>✕</button>
        <h2 style={{ color: "#1e3a8a", marginBottom: 12 }}>Tetris</h2>
        <div ref={containerRef} />
      </div>
    </div>
  );
}

// ===== Styles =====
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 200
};

const modalStyle = {
  background: "white",
  borderRadius: 16,
  padding: 24,
  width: "90%",
  maxWidth: 640,
  boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
  position: "relative"
};

const closeBtn = {
  position: "absolute",
  top: 12,
  right: 12,
  border: "none",
  background: "transparent",
  fontSize: 20,
  cursor: "pointer"
};

export default TetrisModal;

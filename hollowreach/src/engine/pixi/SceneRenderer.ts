import { Application, Container, Graphics } from 'pixi.js';
import { useGame } from '@game/state/store';
import { Content } from '@game/content';
import { evalCondition } from '@game/systems/dialogue/conditions';
import type { GameState, SceneDef, SceneHotspot } from '@game/types';
import { buildScene, type BuiltScene } from './IsoScene';
import { screenToTile } from './iso';
import { RainLayer } from './atmosphere/RainLayer';
import { FogLayer } from './atmosphere/FogLayer';
import { gradeForMinute } from './atmosphere/DayNight';

// Top-level Pixi orchestrator. Owns the Application, the camera-transformed world
// container, the screen-space atmosphere layers, and the day/night grade. It
// subscribes to the Zustand store: scene rebuilds happen on `sceneEpoch`, while
// cheap per-frame updates (player position, visible hotspots, grade) react to
// `revision` and the clock. Input (hover/click/pan/zoom) is handled here and
// dispatched back into the store.

export class SceneRenderer {
  private app = new Application();
  private world = new Container();
  private atmosphere = new Container();
  private grade = new Graphics();
  private rain = new RainLayer();
  private fog = new FogLayer();
  private built: BuiltScene | null = null;
  private sceneId = '';
  private hovered: string | null = null;
  private unsub: (() => void)[] = [];
  private dragging = false;
  private dragStart = { x: 0, y: 0, px: 0, py: 0 };
  private camera = { x: 0, y: 0, zoom: 1 };
  private destroyed = false;

  async mount(host: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: host,
      antialias: true,
      background: '#0b0f14',
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });
    if (this.destroyed) {
      this.app.destroy(true);
      return;
    }
    host.appendChild(this.app.canvas);

    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.atmosphere);
    this.app.stage.addChild(this.grade);
    this.atmosphere.addChild(this.fog.view, this.rain.view);
    this.atmosphere.eventMode = 'none';
    this.grade.eventMode = 'none';

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.bindInput();

    this.resizeAtmosphere();
    this.app.renderer.on('resize', () => this.resizeAtmosphere());

    // React to store changes.
    const store = useGame;
    this.unsub.push(
      store.subscribe((s, prev) => {
        if (s.sceneEpoch !== prev.sceneEpoch || (s.game && s.game.location.scene !== this.sceneId)) {
          this.rebuild();
        }
        if (s.revision !== prev.revision) this.syncDynamic();
      }),
    );

    this.rebuild();
    this.app.ticker.add((t) => this.tick(t.deltaTime));
  }

  private rebuild(): void {
    const state = useGame.getState();
    const g = state.game;
    if (!g) return;
    const scene = Content.scene(g.location.scene);
    if (!scene) return;
    this.sceneId = scene.id;

    this.world.removeChildren();
    this.built = buildScene(scene, this.app.screen.width, this.app.screen.height, hashSeed(scene.id));
    this.world.addChild(this.built.root);

    // Centre the camera on the player.
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.applyCamera();
    this.configureWeather(scene, g);
    this.syncDynamic();
  }

  private configureWeather(scene: SceneDef, g: GameState): void {
    const reduce = g.settings.reducedMotion;
    this.rain.configure(scene.weather.rain, scene.weather.wind, reduce);
    const fogColor = scene.weather.fogColor ? parseInt(scene.weather.fogColor.replace('#', ''), 16) : 0x2a3744;
    this.fog.configure(scene.weather.fog, fogColor, reduce);
  }

  private visibleHotspots(scene: SceneDef, g: GameState): SceneHotspot[] {
    return scene.hotspots.filter((h) => !h.revealWhen || evalCondition(g, h.revealWhen));
  }

  private syncDynamic(): void {
    const g = useGame.getState().game;
    if (!g || !this.built) return;
    const scene = Content.scene(g.location.scene)!;
    this.built.setPlayer(g.location.x, g.location.y);
    this.built.setHotspots(this.visibleHotspots(scene, g), this.hovered);
    this.updateGrade(g);
    this.followPlayer(g);
  }

  private updateGrade(g: GameState): void {
    const grade = gradeForMinute(g.clock.minutes % 1440);
    this.grade.clear();
    this.grade
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill({ color: grade.tint, alpha: g.settings.highContrast ? grade.alpha * 0.5 : grade.alpha });
    this.grade.blendMode = 'multiply';
  }

  private followPlayer(g: GameState): void {
    if (!this.built) return;
    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;
    const px = (g.location.x - g.location.y) * (this.built.cfg.tileWidth / 2) + this.built.cfg.originX;
    const py = (g.location.x + g.location.y) * (this.built.cfg.tileHeight / 2) + this.built.cfg.originY;
    // Ease the camera toward keeping the player centred.
    this.camera.x += ((cx - px) * this.camera.zoom - this.camera.x) * 0.12;
    this.camera.y += ((cy - py) * this.camera.zoom - this.camera.y) * 0.12;
    this.applyCamera();
  }

  private applyCamera(): void {
    this.world.scale.set(this.camera.zoom);
    this.world.position.set(this.camera.x, this.camera.y);
  }

  private resizeAtmosphere(): void {
    this.rain.resize(this.app.screen.width, this.app.screen.height);
    this.fog.resize(this.app.screen.width, this.app.screen.height);
    const g = useGame.getState().game;
    if (g) this.updateGrade(g);
  }

  private bindInput(): void {
    const stage = this.app.stage;
    stage.on('pointermove', (e) => {
      const tile = this.toTile(e.global.x, e.global.y);
      if (this.dragging) {
        this.camera.x = this.dragStart.px + (e.global.x - this.dragStart.x);
        this.camera.y = this.dragStart.py + (e.global.y - this.dragStart.y);
        this.applyCamera();
        return;
      }
      const hs = this.built?.hotspotAt(tile.x, tile.y) ?? null;
      const id = hs?.id ?? null;
      if (id !== this.hovered) {
        this.hovered = id;
        this.syncDynamic();
        this.app.canvas.style.cursor = id ? 'pointer' : 'default';
      }
    });

    stage.on('pointerdown', (e) => {
      this.dragging = true;
      this.dragStart = { x: e.global.x, y: e.global.y, px: this.camera.x, py: this.camera.y };
    });

    const endDrag = (e: { global: { x: number; y: number } }) => {
      const moved = Math.hypot(e.global.x - this.dragStart.x, e.global.y - this.dragStart.y);
      this.dragging = false;
      if (moved < 6) this.handleClick(e.global.x, e.global.y);
    };
    stage.on('pointerup', endDrag);
    stage.on('pointerupoutside', () => (this.dragging = false));

    this.app.canvas.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const factor = ev.deltaY > 0 ? 0.9 : 1.1;
      this.camera.zoom = clamp(this.camera.zoom * factor, 0.55, 2.2);
      this.applyCamera();
    });
  }

  private handleClick(sx: number, sy: number): void {
    const store = useGame.getState();
    if (store.dialogue || store.overlay) return;
    const g = store.game;
    if (!g || !this.built) return;
    const tile = this.toTile(sx, sy);
    const hs = this.built.hotspotAt(tile.x, tile.y);
    if (hs) {
      store.interact(hs.id);
    } else {
      const scene = Content.scene(g.location.scene)!;
      if (tile.x >= 0 && tile.y >= 0 && tile.x < scene.width && tile.y < scene.height) {
        store.movePlayer(tile.x, tile.y);
      }
    }
  }

  private toTile(sx: number, sy: number): { x: number; y: number } {
    if (!this.built) return { x: -1, y: -1 };
    // Undo camera transform first.
    const wx = (sx - this.camera.x) / this.camera.zoom;
    const wy = (sy - this.camera.y) / this.camera.zoom;
    return screenToTile(wx, wy, this.built.cfg);
  }

  private tick(dt: number): void {
    this.rain.tick(dt);
    this.fog.tick(dt);
  }

  destroy(): void {
    this.destroyed = true;
    this.unsub.forEach((u) => u());
    this.unsub = [];
    try {
      this.app.destroy(true, { children: true });
    } catch {
      /* already torn down */
    }
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h >>> 0;
}

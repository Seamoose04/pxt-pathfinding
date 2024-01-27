class Vector2 {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    static distance(start: Vector2, end: Vector2) {
        let xDist = end.x - start.x;
        let yDist = end.y - start.y;
        return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
    }
}
class Node {
    position: Vector2;
    parent: Node;
    G: int16;
    constructor(position: Vector2, parent: Node) {
        this.position = position;
        this.parent = parent;
        if (this.parent) {
            this.G = this.parent.G + 1;
        }
    }
}
class NodeList {
    list: Array<Node>;
    constructor() {
        this.list = [];
    }
    add(node: Node) {
        this.list.push(node);
    }
    size() {
        return this.list.length;
    }
    get(index: number) {
        return this.list[index];
    }
    containsPosition(node: Vector2) {
        for (let i = 0; i < this.size(); i++) {
            if (this.list[i].position.x == node.x && this.list[i].position.y == node.y) {
                return this.list[i];
            }
        }
        return null;
    }
    removeElement(node: Node) {
        let index = this.list.indexOf(node);
        if (index != -1) {
            this.list.removeAt(index);
            return true;
        }
        return false;
    }
}
class PathFinder {
    origin: Node;
    sprite: Sprite;
    followTarget: Sprite;

    map: tiles.TileMapData;
    openList: NodeList;
    closedList: NodeList;

    constructor(map: tiles.TileMapData) {
        this.origin.G = 0;
        this.map = map;
    }

    attachSprite(sprite: Sprite) {
        this.sprite = sprite;
    }

    updatePathfinding(target: Sprite) {
        this.origin = new Node(new Vector2(this.sprite.x, this.sprite.y), null);
        if (Vector2.distance(new Vector2(this.followTarget.x, this.followTarget.y), new Vector2(this.sprite.x, this.sprite.y)) < 5) {
            let path = this.findPath(new Vector2(target.tilemapLocation().col, target.tilemapLocation().row));
            let next = path[path.length-1];
            this.followTarget.setPosition(next.x, next.y);
        }
    }

    findPath(goal: Vector2) {
        let showProcess = false;     //show Process
        let width = tileUtil.tilemapProperty(this.map, tileUtil.TilemapProperty.Columns);
        let height = tileUtil.tilemapProperty(this.map, tileUtil.TilemapProperty.Rows);
        // for (let x = 0; x < width; x++) {
        //     for (let y = 0; y < height; y++) {
                // if (!this.map.isWall(x, y)) {
                    // tiles.setTileAt(tiles.getTileLocation(x, y), assets.tile`Background`);
                // }
        //     }
        // }
        this.openList = new NodeList();
        this.closedList = new NodeList();
        this.openList.add(this.origin);
        let offsets = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        while (this.openList.size() > 0) {
            let currentSquare: Node;
            let lowestF = Infinity;
            for (let j = 0; j < this.openList.size(); j++) {
                let F = this.calculateF(this.openList.get(j), goal);
                if (F < lowestF) {
                    lowestF = F;
                    currentSquare = this.openList.get(j);
                }
            }
            this.openList.removeElement(currentSquare);
            this.closedList.add(currentSquare);
            // if (showProcess) {
            //     tiles.setTileAt(tiles.getTileLocation(currentSquare.position.x, currentSquare.position.y), assets.tile`Closed`);
            // }
            for (let k = 0; k < offsets.length; k++) {
                let nodePos = new Vector2(currentSquare.position.x + offsets[k][0], currentSquare.position.y + offsets[k][1]);
                let closed = this.closedList.containsPosition(nodePos);
                if (this.getWalkable(nodePos) && !closed) {
                    let position = this.openList.containsPosition(nodePos);
                    if (position) {
                        if (currentSquare.G + 1 < position.G) {
                            position.parent = currentSquare;
                            position.G = currentSquare.G + 1;
                        }
                    } else {
                        this.openList.add(new Node(nodePos, currentSquare));
                        // if (showProcess) {
                        //     tiles.setTileAt(tiles.getTileLocation(nodePos.x, nodePos.y), assets.tile`Open`);
                        // }
                    }
                }
            }
            let node = this.closedList.containsPosition(goal);
            if (node != null) {
                let path2 = [];
                while (node.parent) {
                    // if (showProcess) {
                    //     tiles.setTileAt(tiles.getTileLocation(node.position.x, node.position.y), assets.tile`BestPath`);
                    // }
                    path2.push(node.position);
                    node = node.parent;
                }
                return path2;
            }
        }
        return null;
    }

    calculateF(node: Node, goal: Vector2) {
        let G = node.G;
        let H = Vector2.distance(node.position, goal);
        return G + H;
    }

    getWalkable(position: Vector2) {
        if (this.closedList.containsPosition(position)) {
            return false;
        }
        if (this.map.isWall(position.x, position.y)) {
            return false;
        }
        if (position.x < 0 || position.x >= tileUtil.tilemapProperty(this.map, tileUtil.TilemapProperty.Columns)) {
            return false;
        }
        if (position.y < 0 || position.y >= tileUtil.tilemapProperty(this.map, tileUtil.TilemapProperty.Rows)) {
            return false;
        }

        return true;
    }
}
// class Enemy {
//     sprite: Sprite;
//     currentTarget: Sprite;
//     pathfinder: PathFinder;
//     constructor(column: number, row: number, tilemap: tiles.TileMapData) {
//         this.sprite = sprites.create(assets.image`enemyIMG`, SpriteKind.Enemy);
//         tiles.placeOnTile(this.sprite, tiles.getTileLocation(column, row))
//         this.currentTarget = sprites.create(assets.image`enemyTargetIMG`, SpriteKind.EnemyTarget);
//         tiles.placeOnTile(this.currentTarget, tiles.getTileLocation(column, row));
//         this.currentTarget.setFlag(SpriteFlag.Invisible, true);    // show hint
//         this.pathfinder = new PathFinder(tilemap);
//         this.sprite.follow(this.currentTarget);
//     }
//     updatePath(goal: Vector2) {
//         if (this.currentTarget.tilemapLocation().col != goal.x || this.currentTarget.tilemapLocation().row != goal.y) {
//             this.pathfinder.origin.position = new Vector2(this.currentTarget.tilemapLocation().col, this.currentTarget.tilemapLocation().row);
//             let path22 = this.pathfinder.findPath(goal);
//             let next2 = path22[path22.length - 1];
//             tiles.placeOnTile(this.currentTarget, tiles.getTileLocation(next2.x, next2.y));
//         }
//     }
//     pathFind(target: Sprite) {
//         if (Vector2.distance(new Vector2(this.sprite.x, this.sprite.y), new Vector2(this.currentTarget.x, this.currentTarget.y)) < 5) {
//             this.updatePath(new Vector2(target.tilemapLocation().col, target.tilemapLocation().row));
//         }
//     }
//     setRandomPosition() {
//         tiles.placeOnRandomTile(this.sprite, assets.tile`Background`);
//         this.currentTarget.setPosition(this.sprite.x, this.sprite.y);
//     }
// }

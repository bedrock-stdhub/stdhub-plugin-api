import { Player, world } from '@minecraft/server';

const id2Player: Map<string, Player> = new Map();
const name2Player: Map<string, Player> = new Map();

world.afterEvents.playerSpawn.subscribe(event => {
  const player = event.player;
  id2Player.set(player.id, player);
  name2Player.set(player.name, player);
});

world.beforeEvents.playerLeave.subscribe(event => {
  const player = event.player;
  id2Player.delete(player.id);
  name2Player.delete(player.name);
});

export function $getPlayerById(id: string) {
  return id2Player.get(id);
}

export function $getPlayerByName(name: string) {
  return name2Player.get(name);
}
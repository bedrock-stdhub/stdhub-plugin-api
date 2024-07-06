import { Player, world } from '@minecraft/server';
import { $postJson } from './net';

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

export function $getAllPlayers() {
  return Array.from(id2Player.values());
}

export async function $getXuidByName(backendAddress: string, name: string) {
  const { body, response } = await $postJson(`${backendAddress}/xuid/get-xuid-by-name`, { name });
  if (response.status === 404) {
    return null;
  }
  else return <string> body.xuid;
}

export async function $getNameByXuid(backendAddress: string, xuid: string) {
  const { body, response } = await $postJson(`${backendAddress}/xuid/get-name-by-xuid`, { xuid });
  if (response.status === 404) {
    return null;
  }
  else return <string> body.name;
}
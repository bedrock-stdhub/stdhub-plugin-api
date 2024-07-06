import { Player, world } from '@minecraft/server';
import { $postJson } from './net';

/*
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
*/

export function $getPlayerById(id: string): Player | undefined {
  return world.getAllPlayers().filter(player => player.id === id)[0];
}

export function $getPlayerByName(name: string): Player | undefined {
  return world.getAllPlayers().filter(player => player.name === name)[0];
}

export async function $getXuidByName(backendAddress: string, name: string) {
  const { body, response } = await $postJson(`${backendAddress}/xuid/get-xuid-by-name`, { name });
  if (response.status === 404) {
    return undefined;
  }
  else return <string> body.xuid;
}

export async function $getNameByXuid(backendAddress: string, xuid: string) {
  const { body, response } = await $postJson(`${backendAddress}/xuid/get-name-by-xuid`, { xuid });
  if (response.status === 404) {
    return undefined;
  }
  else return <string> body.name;
}
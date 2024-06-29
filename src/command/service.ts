import {
  Player,
  ScriptEventCommandMessageAfterEventSignal,
  system,
} from '@minecraft/server';
import $tokenize from './tokenize';
import { Command } from './index';
import { $postJson } from '../net';
import { $getPlayerById } from '../player';
import { Terminal } from '../index';

const commands: Map<string, Command> = new Map();
let listenerRef: Parameters<ScriptEventCommandMessageAfterEventSignal['subscribe']>[0] | null = null;

const $terminal: Terminal = {
  sendMessage(message)  {
    console.log(message);
  }
};

export function $startService(namespace: string) {
  if (listenerRef) {
    throw 'Service already running';
  }
  listenerRef = system.afterEvents.scriptEventReceive.subscribe(event => {
    if (event.id !== `${namespace}:CommandDispatchEvent`) return;

    let caller: Player | Terminal;
    const { playerId, commandString } = JSON.parse(event.message);
    if (!playerId) {
      caller = $terminal;
    } else {
      const playerOrNull = $getPlayerById(playerId);
      if (!playerOrNull) return;
      else caller = playerOrNull;
    }

    const tokens = $tokenize(commandString);

    const commandName = tokens[0];
    const command = $findCommand(commandName);
    if (!command) {
      caller.sendMessage(
        `§cUnknown command: ${commandName}. Please check that the command exists and you have permission to use it.`
      );
      return;
    }
    const tokensWithoutCmdName = tokens.slice(1);
    try {
      command.$handle(caller, tokensWithoutCmdName);
    } catch (e) {
      if (typeof e === 'string') {
        caller.sendMessage(`§c${e}`);
      } else {
        caller.sendMessage(`§cInternal error: ${e}`);
      }
    }
  });
}

export function $stopService() {
  if (!listenerRef) {
    throw 'Service not running';
  }
  system.afterEvents.scriptEventReceive.unsubscribe(listenerRef);
  listenerRef = null;
}

export function $findCommand(name: string) {
  return commands.get(name);
}

export async function $registerCommand(backendAddress: string, namespace: string, commandName: string, command: Command) {
  const { ok } = await $postJson(`${backendAddress}/command/register`, {
    namespace,
    commandName
  });
  if (!ok || commands.has(commandName)) {
    throw `Command ${commandName} has been registered`;
  }
  commands.set(commandName, command);
}
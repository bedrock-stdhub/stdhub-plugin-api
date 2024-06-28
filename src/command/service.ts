import { ChatSendBeforeEventSignal, world } from '@minecraft/server';
import { Command } from './entity';
import $tokenize from './tokenize';

const commands: Map<string, Command> = new Map();
let listenerRef: Parameters<ChatSendBeforeEventSignal['subscribe']>[0] | null = null;

export function $startService(prefix: string) {
  if (listenerRef) {
    throw 'Service already running';
  }
  listenerRef = world.beforeEvents.chatSend.subscribe(event => {
    if (!event.message.startsWith(prefix)) return;

    const commandStr = event.message.slice(prefix.length);
    const tokens = $tokenize(commandStr);
    if (tokens.length === 0) return;

    event.cancel = true;

    const commandName = tokens[0];
    const command = $findCommand(commandName);
    if (!command) {
      event.sender.sendMessage(
        `§cUnknown command: ${commandName}. Please check that the command exists and you have permission to use it.`
      );
      return;
    }
    const tokensWithoutCmdName = tokens.slice(1);
    try {
      command.$handle(event.sender, tokensWithoutCmdName);
    } catch (e) {
      if (typeof e === 'string') {
        event.sender.sendMessage(`§c${e}`);
      } else {
        event.sender.sendMessage(`§cInternal error: ${e}`);
      }
    }
  });
}

export function $stopService() {
  if (!listenerRef) {
    throw 'Service not running';
  }
  world.beforeEvents.chatSend.unsubscribe(listenerRef);
  listenerRef = null;
}

export function $findCommand(name: string) {
  return commands.get(name);
}

export function $registerCommand(name: string, command: Command) {
  if (commands.get(name)) {
    throw `Command ${name} has been registered by others`;
  }
  commands.set(name, command);
}
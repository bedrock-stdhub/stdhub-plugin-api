import { $fetch, $postJson, FetchOptions } from './net';
import { $readFileAsBytes, $readFileAsText } from './file';
import { $readRootConfig, $readSubConfig } from './config';
import { $deleteData, $readData, $writeData } from './data';
import { variables } from '@minecraft/server-admin';
import { Command } from './command';
import { $registerCommand, $startService } from './command/service';
import { $getNameByXuid, $getPlayerById, $getPlayerByName, $getXuidByName } from './player';
import $log from './log';
import { world } from '@minecraft/server';
import {
  $addPlayerToGroup,
  $createGroup,
  $deleteGroup,
  $grantPermissionToGroup,
  $listAllGroups,
  $listAllPermissions,
  $listExplicitPermissions,
  $listGroupsOfPlayer,
  $listPlayersInGroup,
  $removePlayerFromGroup,
  $revokePermissionFromGroup,
} from './perm';

import { IStablePlayer } from './stable/IStablePlayer';

export class StdhubPluginApi {
  readonly namespace: string;
  readonly backendAddress: string;

  /**
   * Construct a StdhubApi object.
   * @param namespace The namespace, generally the plugin name.
   */
  constructor(namespace: string) {
    this.namespace = namespace;
    this.backendAddress = variables.get('backendAddress');

    $startService(this.backendAddress, this.namespace);
  }

  /**
   * A browser-like fetch API based on `@minecraft/server-net`.
   * @param url The URL to fetch from.
   * @param options Includes method, headers and body.
   * If not provided, it will perform GET with no headers or body.
   */
  async fetch(url: string, options?: FetchOptions) {
    return $fetch(url, options);
  }

  /**
   * A helper function to POST json content, mainly for internal use.
   * @param url The URL to fetch from.
   * @param body The json object body. Will be stringified.
   * @param headers HTTP headers.
   * @returns The response itself; whether it is 'ok'; the parsed body.
   */
  async postJson(url: string, body: unknown, headers?: Record<string, string>) {
    return $postJson(url, body, headers);
  }

  /**
   * Read a file in text form.
   * Notice that you cannot read a file outside the server instance directory.
   * @param path The **relative** path of the file starting from the server instance directory
   * (same as `server.properties`).
   * You can use any delimiter you like (slash or backslash).
   */
  async readFileAsText(path: string) {
    return $readFileAsText(this.backendAddress, path);
  }

  /**
   * Read a file in bytes (node `Buffer`) form.
   * Notice that you cannot read a file outside the server instance directory.
   * @param path The **relative** path of the file starting from the server instance directory
   * (same as `server.properties`).
   * You can use any delimiter you like (slash or backslash).
   */
  async readFileAsBytes(path: string) {
    return $readFileAsBytes(this.backendAddress, path);
  }

  /**
   * Read the root config of the plugin.
   * If the file does not exist, the backend will create one.
   * @param defaults Default values.
   * The read value will be merged into the provided values and override some keys.
   */
  async readRootConfig<T> (defaults: T) {
    return $readRootConfig(this.backendAddress, this.namespace, defaults);
  }

  /**
   * Read the sub config with a specified name of the plugin.
   * If the file does not exist, the backend will create one.
   * @param subConfigName Name of the desired sub config.
   * @param defaults Default values.
   * The read value will be merged into the provided values and override some keys.
   */
  async readSubConfig<T>(subConfigName: string, defaults: T) {
    return $readSubConfig(this.backendAddress, this.namespace, subConfigName, defaults);
  }

  /**
   * Read the data file at the specified path.
   * @param subDataPath The path of data file to read.
   */
  async readData(subDataPath: string) {
    return $readData(this.backendAddress, this.namespace, subDataPath);
  }

  /**
   * Write data to a specified path.
   * @param subDataPath The destination path to write to.
   * The data is stored in JSON format, so a path with an extension `.json` is recommended.
   * @param data The data object to write.
   */
  async writeData(subDataPath: string, data: unknown) {
    return $writeData(this.backendAddress, this.namespace, subDataPath, data);
  }

  /**
   * Delete the data file at the specified path.
   * @param subDataPath The path of data file to delete.
   */
  async deleteData(subDataPath: string) {
    return $deleteData(this.backendAddress, this.namespace, subDataPath);
  }

  /**
   * Register a command.
   * @param name The name of command. When calling, use `.${name}`.
   * @param command The command to register. At lease one pattern should be specified.
   * @param permission The permission required to execute the command.
   * If not provided or an empty string `''`, the command is available to all players.
   */
  registerCommand(name: string, command: Command, permission?: string) {
    if (command.handlers.length === 0) {
      throw 'At lease one pattern should be specified';
    }
    return $registerCommand(this.backendAddress, this.namespace, name, command, permission);
  }

  /**
   * Get the Player object with the specified ID. May be undefined if the player is not present.
   * @param id The ID (not XUID) of player.
   */
  getPlayerById(id: string) {
    return $getPlayerById(id);
  }

  /**
   * Get the Player object with the specified name. May be undefined if the player is not present.
   * @param name The name a.k.a. Xbox gamer tag of player.
   */
  getPlayerByName(name: string) {
    return $getPlayerByName(name);
  }

  /**
   * Get all players currently online.
   * @deprecated use world.getAllPlayers() instead.
   */
  getAllPlayers() {
    return world.getAllPlayers();
  }

  /**
   * Get the XUID of the player with the specified name.
   * Relies on backend cache; may be undefined if the player has never joined the server.
   * @param name The name a.k.a. Xbox gamer tag of player.
   */
  async getXuidByName(name: string) {
    return $getXuidByName(this.backendAddress, name);
  }

  /**
   * Get the name of the player with the specified XUID.
   * Relies on backend cache; may be undefined if the player has never joined the server.
   * @param xuid The XUID of player.
   */
  async getNameByXuid(xuid: string) {
    return $getNameByXuid(this.backendAddress, xuid);
  }

  /**
   * Get the Player object with the specified XUID. May be undefined if the player is not present.
   * @param xuid The XUID of player.
   */
  async getPlayerByXuid(xuid: string) {
    const name = await this.getNameByXuid(xuid);
    if (!name) {
      return undefined;
    }
    return this.getPlayerByName(name);
  }

  /**
   * Kick a player with a reason.
   * @param player The player to kick.
   * @param reason The reason to kick, for example, 'You have been banned'.
   */
  async kickPlayer(player: IStablePlayer, reason: string) {
    player.dimension.runCommand(`kick "${player.name}" ${reason}`);
  }

  /**
   * Log something directly to the console.
   * @param content The content to log. May contain color control sequences `§[0-9a-fr]`.
   */
  async log(content: string) {
    await $log(this.backendAddress, this.namespace, content);
  }

  /**
   * Create a permission group.
   * @param groupName The name of the group.
   * @param extendsFrom The group to extend from. If not provided, the group extends from the default group.
   */
  async createPermissionGroup(groupName: string, extendsFrom?: string) {
    await $createGroup(this.backendAddress, groupName, extendsFrom);
  }

  /**
   * Delete a permission group.
   * @param groupName The name of the group.
   */
  async deletePermissionGroup(groupName: string) {
    await $deleteGroup(this.backendAddress, groupName);
  }

  /**
   * Grant a permission to a group.
   * @param groupName The name of the group.
   * @param permission The permission to grant.
   */
  async grantPermissionToGroup(groupName: string, permission: string) {
    await $grantPermissionToGroup(this.backendAddress, groupName, permission);
  }

  /**
   * Revoke a permission from a group.
   * @param groupName The name of the group.
   * @param permission The permission to revoke.
   */
  async revokePermissionFromGroup(groupName: string, permission: string) {
    await $revokePermissionFromGroup(this.backendAddress, groupName, permission);
  }

  /**
   * Add a player to a group.
   * @param player The player to add.
   * @param groupName The name of the group.
   */
  async addPlayerToGroup(player: IStablePlayer | string, groupName: string) {
    await $addPlayerToGroup(this.backendAddress, (await this.getXuidByName(
      typeof player === 'string' ? player : player.name
    ))!, groupName);
  }

  /**
   * Remove a player from a group.
   * @param player The player to remove.
   * @param groupName The name of the group.
   */
  async removePlayerFromGroup(player: IStablePlayer | string, groupName: string) {
    await $removePlayerFromGroup(this.backendAddress, (await this.getXuidByName(
      typeof player === 'string' ? player : player.name
    ))!, groupName);
  }
  /**
   * List all groups that the specified player is in.
   * @param player The player to list.
   */
  async listGroupsOfPlayer(player: IStablePlayer | string) {
    return await $listGroupsOfPlayer(this.backendAddress, (await this.getXuidByName(
      typeof player === 'string' ? player : player.name
    ))!);
  }
  /**
   * List all players in the specified group.
   * @param groupName The name of the group.
   */
  async listPlayersInGroup(groupName: string) {
    return (await Promise.all((await $listPlayersInGroup(this.backendAddress, groupName))
    .map(xuid => this.getPlayerByXuid(xuid))))
    .filter(playerOrUndefined => playerOrUndefined !== undefined);
  }

  /**
   * List all groups.
   */
  async listAllGroups() {
    return await $listAllGroups(this.backendAddress);
  }

  /**
   * List all explicit permissions of the specified group.
   * @param groupName
   */
  async listExplicitPermissionsOfGroup(groupName: string) {
    return await $listExplicitPermissions(this.backendAddress, groupName);
  }

  /**
   * List all permissions of the specified group, including inherited ones.
   * @param groupName
   */
  async listAllPermissionsOfGroup(groupName: string) {
    return await $listAllPermissions(this.backendAddress, groupName);
  }
}

export abstract class Terminal {
  abstract readonly sendMessage: (message: string) => void;
}

export * from './command';
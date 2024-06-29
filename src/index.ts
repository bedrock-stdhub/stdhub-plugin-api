import { $fetch, $postJson, FetchOptions } from './net';
import { $readFileAsBytes, $readFileAsText } from './file';
import { $readRootConfig, $readSubConfig } from './config';
import { $deleteData, $readData, $writeData } from './data';
import { variables } from '@minecraft/server-admin';
import { Command } from './command';
import { $registerCommand, $startService } from './command/service';

const commandPrefix = '.';

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

    $startService(commandPrefix);
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
   */
  registerCommand(name: string, command: Command) {
    if (command.handlers.length === 0) {
      throw 'At lease one pattern should be specified';
    }
    return $registerCommand(name, command);
  }
}

export * from './command';
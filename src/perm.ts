import { $postJson } from './net';

export async function $createGroup(backendAddress: string, groupName: string, extendsFrom?: string) {
  const { response } = await $postJson(`${backendAddress}/perm/create-group`, { groupName, extendsFrom });
  if (response.status === 400) {
    throw 'Group already exists';
  }
}

export async function $deleteGroup(backendAddress: string, groupName: string) {
  const { response } = await $postJson(`${backendAddress}/perm/delete-group`, { groupName });
  if (response.status === 400) {
    throw 'Cannot delete default group';
  }
  if (response.status === 404) {
    throw 'Group not found';
  }
}

export async function $grantPermissionToGroup(backendAddress: string, groupName: string, permission: string) {
  const { response } = await $postJson(`${backendAddress}/perm/grant-permission`, { groupName, permission });
  if (response.status === 404) {
    throw 'Group or permission not found';
  }
  if (response.status === 400) {
    throw 'Permission already exists in group';
  }
}

export async function $revokePermissionFromGroup(backendAddress: string, groupName: string, permission: string) {
  const { response } = await $postJson(`${backendAddress}/perm/revoke-permission`, { groupName, permission });
  if (response.status === 404) {
    throw 'Group or permission not found';
  }
}

export async function $addPlayerToGroup(backendAddress: string, xuid: string, groupName: string) {
  if (groupName === 'default') {
    throw 'Cannot add player to default group';
  }
  await $postJson(`${backendAddress}/perm/add-player-to-group`, { xuid, groupName });
}

export async function $removePlayerFromGroup(backendAddress: string, xuid: string, groupName: string) {
  const { response } = await $postJson(`${backendAddress}/perm/remove-player-from-group`, { xuid, groupName });
  if (response.status === 404) {
    throw 'Group not found';
  }
}

export async function $listGroupsOfPlayer(backendAddress: string, xuid: string) {
  const { body } = await $postJson(`${backendAddress}/perm/list-groups-of-player`, { xuid });
  return <string[]> body.groups;
}

export async function $listPlayersInGroup(backendAddress: string, groupName: string) {
  const { response, body } = await $postJson(`${backendAddress}/perm/list-players-in-group`, { groupName });
  if (response.status === 404) {
    throw 'Group not found';
  }
  return <string[]> body.players;
}

export async function $listExplicitPermissions(backendAddress: string, groupName: string) {
  const { response, body } = await $postJson(`${backendAddress}/perm/list-explicit-permissions`, { groupName });
  if (response.status === 404) {
    throw 'Group not found';
  }
  return <string[]> body.permissions;
}

export async function $listAllPermissions(backendAddress: string, groupName: string) {
  const { response, body } = await $postJson(`${backendAddress}/perm/list-all-permissions`, { groupName });
  if (response.status === 404) {
    throw 'Group not found';
  }
  return <string[]> body.permissions;
}

export async function $listAllGroups(backendAddress: string) {
  const { body } = await $postJson(`${backendAddress}/perm/list-all-groups`, {});
  return <string[]> body.groups;
}
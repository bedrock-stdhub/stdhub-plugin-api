import { Dimension } from '@minecraft/server';

export interface IStableEntity {
  readonly dimension: Dimension;
  readonly id: string;
}
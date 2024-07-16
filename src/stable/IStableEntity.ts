import { IStableDimension } from './IStableDimension';

export interface IStableEntity {
  readonly dimension: IStableDimension;
  readonly id: string;
}
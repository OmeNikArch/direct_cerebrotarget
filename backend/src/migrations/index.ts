import * as migration_20261005_135916_initial from './20261005_135916_initial';

export const migrations = [
  {
    up: migration_20261005_135916_initial.up,
    down: migration_20261005_135916_initial.down,
    name: '20261005_135916_initial'
  },
];

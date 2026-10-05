import * as migration_20261005_135916_initial from './20261005_135916_initial';
import * as migration_20261005_144526_content_admin from './20261005_144526_content_admin';

export const migrations = [
  {
    up: migration_20261005_135916_initial.up,
    down: migration_20261005_135916_initial.down,
    name: '20261005_135916_initial',
  },
  {
    up: migration_20261005_144526_content_admin.up,
    down: migration_20261005_144526_content_admin.down,
    name: '20261005_144526_content_admin'
  },
];

import * as migration_20261005_135916_initial from './20261005_135916_initial';
import * as migration_20261005_144526_content_admin from './20261005_144526_content_admin';
import * as migration_20261006_135513_bot_links from './20261006_135513_bot_links';

export const migrations = [
  {
    up: migration_20261005_135916_initial.up,
    down: migration_20261005_135916_initial.down,
    name: '20261005_135916_initial',
  },
  {
    up: migration_20261005_144526_content_admin.up,
    down: migration_20261005_144526_content_admin.down,
    name: '20261005_144526_content_admin',
  },
  {
    up: migration_20261006_135513_bot_links.up,
    down: migration_20261006_135513_bot_links.down,
    name: '20261006_135513_bot_links'
  },
];

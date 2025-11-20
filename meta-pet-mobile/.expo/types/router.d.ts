/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/hepta` | `/(tabs)/settings` | `/..\..\packages\core\src\` | `/..\..\packages\core\src\codec` | `/..\..\packages\core\src\config` | `/..\..\packages\core\src\consent` | `/..\..\packages\core\src\const` | `/..\..\packages\core\src\crest` | `/..\..\packages\core\src\genome` | `/..\..\packages\core\src\petUpgrades` | `/..\..\packages\core\src\rng` | `/..\..\packages\core\src\sealed` | `/..\..\packages\core\src\sim` | `/..\..\packages\core\src\state` | `/..\src\identity\playHepta.native` | `/_sitemap` | `/consent` | `/hepta` | `/settings`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}

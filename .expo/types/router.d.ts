/* eslint-disable */
import * as Router from "expo-router";

export * from "expo-router";

declare module "expo-router" {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams:
        | { pathname: Router.RelativePathString; params?: Router.UnknownInputParams }
        | { pathname: Router.ExternalPathString; params?: Router.UnknownInputParams }
        | { pathname: `/`; params?: Router.UnknownInputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(auth)"}/login` | `/login`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(auth)"}/signup` | `/signup`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(onboarding)"}/estimation` | `/estimation`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `${"/(onboarding)"}/goals` | `/goals`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(onboarding)"}/habits` | `/habits`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(onboarding)"}` | `/`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(onboarding)"}/physical-info` | `/physical-info`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `${"/(tabs)"}/dashboard` | `/dashboard`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(tabs)"}/food/add-meal` | `/food/add-meal`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/food/history` | `/food/history`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `${"/(tabs)"}/food` | `/food`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}/habits` | `/habits`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}/profile` | `/profile`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(tabs)"}/profile/settings` | `/profile/settings`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `${"/(tabs)"}/sport` | `/sport`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(tabs)"}/sport/program` | `/sport/program`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/sport/progress` | `/sport/progress`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/sport/log/[id]` | `/sport/log/[id]`;
            params: Router.UnknownInputParams & { id: string | number };
          }
        | {
            pathname: `${"/(tabs)"}/sport/session/[id]` | `/sport/session/[id]`;
            params: Router.UnknownInputParams & { id: string | number };
          };
      hrefOutputParams:
        | { pathname: Router.RelativePathString; params?: Router.UnknownOutputParams }
        | { pathname: Router.ExternalPathString; params?: Router.UnknownOutputParams }
        | { pathname: `/`; params?: Router.UnknownOutputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams }
        | { pathname: `${"/(auth)"}/login` | `/login`; params?: Router.UnknownOutputParams }
        | { pathname: `${"/(auth)"}/signup` | `/signup`; params?: Router.UnknownOutputParams }
        | {
            pathname: `${"/(onboarding)"}/estimation` | `/estimation`;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `${"/(onboarding)"}/goals` | `/goals`; params?: Router.UnknownOutputParams }
        | { pathname: `${"/(onboarding)"}/habits` | `/habits`; params?: Router.UnknownOutputParams }
        | { pathname: `${"/(onboarding)"}` | `/`; params?: Router.UnknownOutputParams }
        | {
            pathname: `${"/(onboarding)"}/physical-info` | `/physical-info`;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `${"/(tabs)"}/dashboard` | `/dashboard`; params?: Router.UnknownOutputParams }
        | {
            pathname: `${"/(tabs)"}/food/add-meal` | `/food/add-meal`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `${"/(tabs)"}/food/history` | `/food/history`;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `${"/(tabs)"}/food` | `/food`; params?: Router.UnknownOutputParams }
        | { pathname: `${"/(tabs)"}/habits` | `/habits`; params?: Router.UnknownOutputParams }
        | { pathname: `${"/(tabs)"}/profile` | `/profile`; params?: Router.UnknownOutputParams }
        | {
            pathname: `${"/(tabs)"}/profile/settings` | `/profile/settings`;
            params?: Router.UnknownOutputParams;
          }
        | { pathname: `${"/(tabs)"}/sport` | `/sport`; params?: Router.UnknownOutputParams }
        | {
            pathname: `${"/(tabs)"}/sport/program` | `/sport/program`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `${"/(tabs)"}/sport/progress` | `/sport/progress`;
            params?: Router.UnknownOutputParams;
          }
        | {
            pathname: `${"/(tabs)"}/sport/log/[id]` | `/sport/log/[id]`;
            params: Router.UnknownOutputParams & { id: string };
          }
        | {
            pathname: `${"/(tabs)"}/sport/session/[id]` | `/sport/session/[id]`;
            params: Router.UnknownOutputParams & { id: string };
          };
      href:
        | Router.RelativePathString
        | Router.ExternalPathString
        | `/${`?${string}` | `#${string}` | ""}`
        | `/_sitemap${`?${string}` | `#${string}` | ""}`
        | `${"/(auth)"}/login${`?${string}` | `#${string}` | ""}`
        | `/login${`?${string}` | `#${string}` | ""}`
        | `${"/(auth)"}/signup${`?${string}` | `#${string}` | ""}`
        | `/signup${`?${string}` | `#${string}` | ""}`
        | `${"/(onboarding)"}/estimation${`?${string}` | `#${string}` | ""}`
        | `/estimation${`?${string}` | `#${string}` | ""}`
        | `${"/(onboarding)"}/goals${`?${string}` | `#${string}` | ""}`
        | `/goals${`?${string}` | `#${string}` | ""}`
        | `${"/(onboarding)"}/habits${`?${string}` | `#${string}` | ""}`
        | `/habits${`?${string}` | `#${string}` | ""}`
        | `${"/(onboarding)"}${`?${string}` | `#${string}` | ""}`
        | `/${`?${string}` | `#${string}` | ""}`
        | `${"/(onboarding)"}/physical-info${`?${string}` | `#${string}` | ""}`
        | `/physical-info${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/dashboard${`?${string}` | `#${string}` | ""}`
        | `/dashboard${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/food/add-meal${`?${string}` | `#${string}` | ""}`
        | `/food/add-meal${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/food/history${`?${string}` | `#${string}` | ""}`
        | `/food/history${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/food${`?${string}` | `#${string}` | ""}`
        | `/food${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/habits${`?${string}` | `#${string}` | ""}`
        | `/habits${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/profile${`?${string}` | `#${string}` | ""}`
        | `/profile${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/profile/settings${`?${string}` | `#${string}` | ""}`
        | `/profile/settings${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/sport${`?${string}` | `#${string}` | ""}`
        | `/sport${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/sport/program${`?${string}` | `#${string}` | ""}`
        | `/sport/program${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/sport/progress${`?${string}` | `#${string}` | ""}`
        | `/sport/progress${`?${string}` | `#${string}` | ""}`
        | { pathname: Router.RelativePathString; params?: Router.UnknownInputParams }
        | { pathname: Router.ExternalPathString; params?: Router.UnknownInputParams }
        | { pathname: `/`; params?: Router.UnknownInputParams }
        | { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(auth)"}/login` | `/login`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(auth)"}/signup` | `/signup`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(onboarding)"}/estimation` | `/estimation`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `${"/(onboarding)"}/goals` | `/goals`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(onboarding)"}/habits` | `/habits`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(onboarding)"}` | `/`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(onboarding)"}/physical-info` | `/physical-info`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `${"/(tabs)"}/dashboard` | `/dashboard`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(tabs)"}/food/add-meal` | `/food/add-meal`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/food/history` | `/food/history`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `${"/(tabs)"}/food` | `/food`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}/habits` | `/habits`; params?: Router.UnknownInputParams }
        | { pathname: `${"/(tabs)"}/profile` | `/profile`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(tabs)"}/profile/settings` | `/profile/settings`;
            params?: Router.UnknownInputParams;
          }
        | { pathname: `${"/(tabs)"}/sport` | `/sport`; params?: Router.UnknownInputParams }
        | {
            pathname: `${"/(tabs)"}/sport/program` | `/sport/program`;
            params?: Router.UnknownInputParams;
          }
        | {
            pathname: `${"/(tabs)"}/sport/progress` | `/sport/progress`;
            params?: Router.UnknownInputParams;
          }
        | `${"/(tabs)"}/sport/log/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ""}`
        | `/sport/log/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ""}`
        | `${"/(tabs)"}/sport/session/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ""}`
        | `/sport/session/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ""}`
        | {
            pathname: `${"/(tabs)"}/sport/log/[id]` | `/sport/log/[id]`;
            params: Router.UnknownInputParams & { id: string | number };
          }
        | {
            pathname: `${"/(tabs)"}/sport/session/[id]` | `/sport/session/[id]`;
            params: Router.UnknownInputParams & { id: string | number };
          };
    }
  }
}

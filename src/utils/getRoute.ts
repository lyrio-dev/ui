import { lazy, Matcher } from "navi";

// lazy() accepts a function returns a module, which should have the "default" property to be the route
// If we want to put multiple routes in a module, we should return a fake module to lazy()
export default function getRoute<T extends { default: object }>(
  importFunction: () => Promise<T>,
  propertyName: string
): Matcher<any, any> {
  return lazy(async () => ({
    default: (await importFunction()).default[propertyName]
  }));
}

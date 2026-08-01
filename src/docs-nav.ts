export interface NavItem {
  title: string;
  path: string;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const docsNav: NavGroup[] = [
  {
    group: "Getting Started",
    items: [
      { title: "Overview", path: "/docs/" },
      { title: "Getting Started", path: "/docs/getting-started/" },
    ],
  },
  {
    group: "Core Features",
    items: [
      { title: "CLI Reference", path: "/docs/cli/" },
      { title: "Web UI", path: "/docs/web-ui/" },
      { title: "REST API", path: "/docs/api/" },
      { title: "Configuration", path: "/docs/configuration/" },
    ],
  },
  {
    group: "Advanced",
    items: [
      { title: "HTTPS Interception", path: "/docs/https/" },
      { title: "AI Agent Plugin", path: "/docs/agent-plugin/" },
      { title: "Architecture", path: "/docs/architecture/" },
    ],
  },
  {
    group: "Recipes",
    items: [
      { title: "All Recipes", path: "/docs/recipes/" },
      { title: "Debug Webhooks", path: "/docs/recipes/debug-webhook/" },
      { title: "Trace 422 Errors", path: "/docs/recipes/debug-422/" },
      { title: "Debug CORS Preflight", path: "/docs/recipes/debug-cors/" },
      { title: "Find Slow Endpoints", path: "/docs/recipes/find-slow-endpoints/" },
      { title: "Verify a Fix", path: "/docs/recipes/verify-a-fix/" },
      { title: "Share as cURL", path: "/docs/recipes/share-as-curl/" },
      { title: "iOS Traffic Capture", path: "/docs/recipes/ios-capture/" },
    ],
  },
];

/** Flatten all nav items in order for prev/next navigation */
export function flatNavItems(): NavItem[] {
  return docsNav.flatMap((group) => group.items);
}

/** Get prev/next items relative to the current path */
export function getPrevNext(currentPath: string): { prev: NavItem | null; next: NavItem | null } {
  const items = flatNavItems();
  const index = items.findIndex((item) => currentPath.endsWith(item.path));
  return {
    prev: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  };
}

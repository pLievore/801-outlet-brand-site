export type NavigationLink = {
  id: string;
  label: string;
  href: string;
  external: boolean;
  children: NavigationLink[];
};

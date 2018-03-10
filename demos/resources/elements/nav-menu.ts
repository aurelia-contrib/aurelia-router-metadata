// tslint:disable:no-implicit-dependencies
import { getLogger } from "aurelia-logging";
import { NavModel, RouteConfig, Router } from "aurelia-router";
import { bindable, customElement } from "aurelia-templating";
import { TaskQueue } from "aurelia-framework";

const logger = getLogger("nav-menu");

type NavItem = NavModel | RouteConfig;

@customElement("nav-menu")
export class NavMenu {
  @bindable()
  public router: Router;

  public menuContainer: HTMLDivElement;
  public hoverPath: NavItem[] = [];

  private tq: TaskQueue

  constructor(tq: TaskQueue) {
    this.tq = tq;
  }

  public attached(): void {
    const getMaxHeight = (items: NavItem[]): number => {
      const visibleItems = items.filter((i: NavItem) => (i as any).nav !== false);
      let maxHeight = visibleItems.length;
      for (const item of visibleItems) {
        const childRoutes = item.settings.childRoutes || [];
        maxHeight = Math.max(maxHeight, getMaxHeight(childRoutes));
      }

      return maxHeight;
    };
    this.tq.queueMicroTask(() => {
      const navHeight = getMaxHeight(this.router.navigation) * 40;
      this.menuContainer.style.height = `${navHeight}px`;
    });
  }

  private navItemMouseEnter(item: NavItem): void {
    const oldHoverPath = this.hoverPath;
    const newHoverPath: NavItem[] = [];
    if (item.settings.childRoutes) {
      newHoverPath.push(item);
    }
    let parent = item.settings.parentRoute;
    while (parent) {
      newHoverPath.unshift(parent);
      parent = parent.settings.parentRoute;
    }

    for (const oldItem of oldHoverPath) {
      oldItem.settings.hovering = false;
    }
    for (const newItem of newHoverPath) {
      newItem.settings.hovering = true;
    }

    this.hoverPath = newHoverPath;
  }
}

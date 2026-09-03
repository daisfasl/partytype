import { Box, useInput } from "ink";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";
import type { MenuActions, MenuItemProps } from "./MenuItem.js";

interface MenuProps {
  children: ReactNode;
  direction?: "column" | "row";
}

export default function Menu({ children, direction = "column" }: MenuProps) {
  const [currMenu, setMenu] = useState(0);
  const actions = useRef<MenuActions[]>([]);
  const menuItems = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<MenuItemProps>[];

  useEffect(() => {
    setMenu((current) => Math.min(current, Math.max(0, menuItems.length - 1)));
  }, [menuItems.length]);

  useInput((input, key) => {
    if (direction === "column") {
      if (key.upArrow) {
        if (currMenu > 0) {
          setMenu(currMenu - 1);
        }
      }
      if (key.downArrow) {
        if (currMenu < menuItems.length - 1) {
          setMenu(currMenu + 1);
        }
      }
    }
    if (direction === "column" && (key.leftArrow || key.rightArrow)) {
      const selectedItem = menuItems[currMenu];
      const selectedActions = {
        ...actions.current[currMenu],
        ...selectedItem?.props,
      };
      if (key.leftArrow) {
        selectedActions?.onLeft?.();
      } else {
        selectedActions?.onRight?.();
      }
    }
    if (direction === "row") {
      if (key.leftArrow) {
        if (currMenu > 0) {
          setMenu(currMenu - 1);
        }
      }
      if (key.rightArrow) {
        if (currMenu < menuItems.length - 1) {
          setMenu(currMenu + 1);
        }
      }
    }
    if (key.return) {
      const selectedItem = menuItems[currMenu];
      const selectedActions = {
        ...actions.current[currMenu],
        ...selectedItem?.props,
      };
      selectedActions?.onSelect?.();
    }
  });

  return (
    <Box
      marginTop={1}
      flexDirection={direction}
      gap={direction === "row" ? 2 : 0}
    >
      {menuItems.map((menuItem, index) =>
        cloneElement<MenuItemProps>(menuItem, {
          isSelected: index === currMenu,
          direction,
          menuIndex: index,
          registerActions: (itemActions) => {
            actions.current[index] = itemActions;
          },
        }),
      )}
    </Box>
  );
}

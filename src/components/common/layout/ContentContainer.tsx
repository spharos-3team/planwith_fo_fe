import type { ComponentPropsWithoutRef, ElementType } from "react";

export const contentContainerClassName =
  "mx-auto w-full max-w-[1680px] px-6 sm:px-10 xl:px-16 min-[1680px]:px-0";
export const heroContentContainerClassName =
  "mx-auto w-full max-w-[1680px] px-6 sm:px-10 xl:px-16 min-[1680px]:px-0";

type ContentContainerProps<T extends ElementType = "div"> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function ContentContainer<T extends ElementType = "div">({
  as,
  className,
  ...props
}: ContentContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`${contentContainerClassName}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

export function HeroContentContainer<T extends ElementType = "div">({
  as,
  className,
  ...props
}: ContentContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`${heroContentContainerClassName}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}

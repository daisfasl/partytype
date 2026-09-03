export default function cycleOption<T>(
  options: readonly T[],
  current: T,
  direction: -1 | 1,
): T {
  const currentIndex = options.indexOf(current);
  const nextIndex =
    (Math.max(0, currentIndex) + direction + options.length) % options.length;

  return options[nextIndex];
}

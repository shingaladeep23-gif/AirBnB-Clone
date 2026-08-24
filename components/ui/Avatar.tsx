import Image from "next/image";

/**
 * A person's avatar — their photo when one exists, otherwise the letter tile the
 * reference falls back to.
 *
 * The fallback is not cosmetic. Two of the six reviewers and two of the eight
 * co-hosts have no uploaded photo, and the reference renders their initial. The
 * alternative — reusing somebody else's face — would be inventing content, which
 * is the exact failure this phase exists to undo.
 *
 * Sizing stays at the call site as utility classes, the way every other image on
 * the page is sized; `size` only feeds next/image's intrinsic dimensions.
 *
 * `alt=""` is correct in both branches: the name is always rendered next to the
 * avatar as real text, so announcing it twice would be noise.
 */
export function Avatar({
  src,
  name,
  size,
  className = "",
  letterClassName = "text-base",
}: {
  src: string | undefined;
  name: string;
  size: number;
  className?: string;
  letterClassName?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        // object-cover is load-bearing: several source avatars are portrait, not
        // square, and would crop through the face without it.
        className={`shrink-0 rounded-pill object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      // font-medium, not font-semibold: the reference measures these initials at
      // 17px weight 500, and `--font-weight-semibold` no longer exists — there is
      // no 600 anywhere on the reference, so the rung was removed rather than
      // left reachable. See tokens.css.
      className={`flex shrink-0 items-center justify-center rounded-pill bg-surface-sunken font-medium text-fg ${letterClassName} ${className}`}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

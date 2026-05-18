export function Skeleton({ as = "div", height = 12, width = "100%", style }) {
  const Tag = as;
  return (
    <Tag
      aria-hidden="true"
      className="skel skel-block"
      style={{ height, width, ...style }}
    />
  );
}

export function SkeletonLine({ width = "100%", style }) {
  return (
    <div
      aria-hidden="true"
      className="skel skel-line"
      style={{ width, ...style }}
    />
  );
}

export function PropertyCardSkeleton() {
  return <div className="property-card skel" aria-hidden="true" />;
}

function Paid() {
  return <span>Paid</span>;
}
function Pending() {
  return <span>Pending</span>;
}
export function InlineBadge({ isPaid }: { isPaid: boolean }) {
  return (
    <div>
      {/* expect: error eslint(no-ternary) -- Two status paths are nested in markup. */}
      {isPaid ? <Paid /> : <Pending />}
    </div>
  );
}
export function OrderBadge({ isPaid }: { isPaid: boolean }) {
  if (isPaid) return <Paid />;
  return <Pending />;
}
export function OrderItems({ itemCount }: { itemCount: number }) {
  return <section>{itemCount > 0 && <span>Items</span>}</section>;
}

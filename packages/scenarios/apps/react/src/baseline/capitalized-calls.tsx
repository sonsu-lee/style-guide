function Paid() {
  return <span>Paid</span>;
}

export function DirectCallBadge() {
  return (
    <div>
      {/* expect: error react(capitalized-calls) -- Calling the component hides its state from React. */}
      {Paid()}
      {Boolean(1)}
      {Number('1')}
    </div>
  );
}

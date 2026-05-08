export function MacroBar({
  protein,
  carbs,
  fats,
}: {
  protein: number;
  carbs: number;
  fats: number;
}) {
  const total = Math.max(1, protein + carbs + fats);
  return (
    <div className="bg-surface-2 h-2 w-full overflow-hidden rounded-full">
      <div
        className="bg-protein h-full"
        style={{ width: `${(protein / total) * 100}%`, float: "left" }}
      />
      <div
        className="bg-carbs h-full"
        style={{ width: `${(carbs / total) * 100}%`, float: "left" }}
      />
      <div
        className="bg-fats h-full"
        style={{ width: `${(fats / total) * 100}%`, float: "left" }}
      />
    </div>
  );
}

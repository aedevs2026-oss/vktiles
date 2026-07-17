export default function PackingTable({ packing, productName }) {
  if (!packing?.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-navy text-white">
            <th className="px-5 py-3.5 font-medium">Size</th>
            <th className="px-5 py-3.5 font-medium">Thickness</th>
            <th className="px-5 py-3.5 font-medium">Tiles / Box</th>
            <th className="px-5 py-3.5 font-medium">Coverage</th>
            <th className="px-5 py-3.5 font-medium">Weight</th>
          </tr>
        </thead>
        <tbody>
          {packing.map((row, i) => (
            <tr key={i} className={`border-t border-navy/8 ${i % 2 === 0 ? "bg-white" : "bg-background"}`}>
              <td className="px-5 py-3.5 text-navy font-semibold">{row.size || "—"}</td>
              <td className="px-5 py-3.5 text-gray">{row.thickness || "—"}</td>
              <td className="px-5 py-3.5 text-gray">{row.tilesPerBox ?? "—"} pcs</td>
              <td className="px-5 py-3.5 text-gray">{row.coverage || (row.coverageSqFt != null ? `${row.coverageSqFt} sq ft` : "—")}</td>
              <td className="px-5 py-3.5 text-gray">{row.weight || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function convertStringFieldsToNumbers(o: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(o).map((e) => {
    const [k, v] = e
    if (typeof v === "string") {
      const parsed = Number.parseInt(v)
      if (Number.isFinite(parsed)) return [k, parsed]
    }
    return e;
  }))
}

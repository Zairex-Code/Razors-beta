export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function multiplyCurrency(a: number, b: number): number {
  return roundCurrency(a * b)
}

export function addCurrency(...values: number[]): number {
  return values.reduce((acc, val) => roundCurrency(acc + val), 0)
}

export function parseCurrencyInput(value: string): number {
  const parsed = parseFloat(value)
  if (isNaN(parsed)) return 0
  return roundCurrency(parsed)
}

import { AmountPresetBar } from '../../../components/ui/AmountPresetBar'
import { MoneyField } from '../../../components/ui/MoneyField'
import { NumericKeypad } from '../../../components/ui/NumericKeypad'
import { VueltasBanner } from '../../../components/ui/VueltasBanner'
import { amountToDigits, digitsToAmount } from '../../../lib/moneyDigits'

type CobroEfectivoProps = {
  total: number
  pagaDigits: string
  onPagaDigitsChange: (digits: string) => void
}

export function CobroEfectivo({
  total,
  pagaDigits,
  onPagaDigitsChange,
}: CobroEfectivoProps) {
  const pagaCon = digitsToAmount(pagaDigits)

  return (
    <div className="flex flex-col gap-2">
      <MoneyField
        label="Paga con"
        size="md"
        value={pagaCon}
        onChange={(v) => onPagaDigitsChange(amountToDigits(v))}
        readOnly
      />
      <AmountPresetBar
        exactAmount={total}
        value={pagaCon}
        onChange={(amount) => onPagaDigitsChange(amountToDigits(amount))}
      />
      <VueltasBanner total={total} pagaCon={pagaCon} />
      <NumericKeypad value={pagaDigits} onChange={onPagaDigitsChange} />
    </div>
  )
}

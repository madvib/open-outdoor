import { Order } from "@medusajs/medusa"
import { paymentInfoMap } from "@modules/checkout/components/payment"
import Divider from "@modules/common/components/divider"
import { formatAmount } from "medusa-react"

type PaymentDetailsProps = {
  order: Order
}

const currencyCodeSymbolMap: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  DKK: "kr",
  GBP: "£",
  SEK: "kr",
  NOK: "kr",
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payments[0]
  return (
    <div>
      <h2 className="flex flex-row text-3xl-regular my-6">Payment</h2>
      <div>
        {payment && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <p className="txt-medium-plus text-base-content mb-1">
                Payment method
              </p>
              <p className="txt-medium text-base-content text-opacity-60">
                {paymentInfoMap[payment.provider_id].title}
              </p>
            </div>
            <div className="flex flex-col w-2/3">
              <p className="txt-medium-plus text-base-content mb-1">
                Payment details
              </p>
              <div className="flex gap-2 txt-medium text-base-content text-opacity-60 items-center">
                <div className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                  {paymentInfoMap[payment.provider_id].icon}
                </div>
                <p>
                  {payment.provider_id === "stripe" && payment.data.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${formatAmount({
                        amount: payment.amount,
                        region: order.region,
                      })} paid at ${new Date(
                        payment.created_at
                      ).toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails

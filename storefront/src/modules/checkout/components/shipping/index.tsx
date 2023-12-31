import { useCheckout } from "@lib/context/checkout-context"
import { CheckCircleSolid } from "@medusajs/icons"
import clsx from "clsx"
import Spinner from "@modules/common/icons/spinner"
import Divider from "@modules/common/components/divider"
import { useForm } from "react-hook-form"
import { RadioGroup } from "@headlessui/react"
import Radio from "@modules/common/components/radio"
import { ErrorMessage } from "@hookform/error-message"
import { formatAmount, useCart, useCartShippingOptions } from "medusa-react"
import { useEffect, useMemo, useState } from "react"
import { Cart } from "@medusajs/medusa"

type ShippingOption = {
  value?: string
  label?: string
  price: string
}

type ShippingProps = {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
}

const Shipping: React.FC<ShippingProps> = ({ cart }) => {
  const {
    editAddresses: { state: isAddressesOpen, close: closeAddresses },
    editShipping: { state: isOpen, open, close },
    editPayment: {
      state: isPaymentOpen,
      open: openPayment,
      close: closePayment,
    },
    addressReady,
    shippingReady,
  } = useCheckout()

  const currentShippingOption =
    cart.shipping_methods?.[0]?.shipping_option.id || ""
  const [shippingOptionId, setShippingOptionId] = useState(
    currentShippingOption
  )

  const { addShippingMethod, setCart } = useCart()

  const {
    setError,
    formState: { errors },
  } = useForm()

  // Fetch shipping options
  const { shipping_options, refetch } = useCartShippingOptions(cart.id, {
    enabled: !!cart.id,
  })

  // Any time the cart changes we need to ensure that we are displaying valid shipping options
  useEffect(() => {
    const refetchShipping = async () => {
      await refetch()
    }

    refetchShipping()
  }, [cart, refetch])

  const submitShippingOption = (soId: string) => {
    addShippingMethod.mutate(
      { option_id: soId },
      {
        onSuccess: ({ cart }) => {
          setCart(cart)
          close()
          openPayment()
        },
        onError: () =>
          setError(
            "soId",
            {
              type: "validate",
              message:
                "An error occurred while adding shipping. Please try again.",
            },
            { shouldFocus: true }
          ),
      }
    )
  }

  const handleChange = (value: string) => {
    setShippingOptionId(value)
  }

  const handleEdit = () => {
    open()
    closeAddresses()
    closePayment()
  }

  const editingOtherSteps = isAddressesOpen || isPaymentOpen

  // Memoized shipping method options
  const shippingMethods: ShippingOption[] = useMemo(() => {
    if (shipping_options && cart?.region) {
      return shipping_options?.map((option) => ({
        value: option.id,
        label: option.name,
        price: formatAmount({
          amount: option.amount || 0,
          region: cart.region,
        }),
      }))
    }

    return []
  }, [shipping_options, cart])

  return (
    <div className="bg-base-100 p-4 small:px-8">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2
          className={clsx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                editingOtherSteps && !shippingReady,
            }
          )}
        >
          Delivery
          {!isOpen && currentShippingOption && shippingReady && (
            <CheckCircleSolid />
          )}
        </h2>
        {!isOpen && addressReady && (
          <button onClick={handleEdit} className="text-accent text-sm">
            Edit
          </button>
        )}
      </div>
      {!editingOtherSteps && isOpen ? (
        <div className="pb-8">
          <div>
            <RadioGroup
              value={shippingOptionId}
              onChange={(value: string) => handleChange(value)}
            >
              {shippingMethods && shippingMethods.length ? (
                shippingMethods.map((option) => {
                  return (
                    <RadioGroup.Option
                      key={option.value}
                      value={option.value}
                      className={clsx(
                        "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:border-accent",
                        {
                          "border-accent": option.value === shippingOptionId,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <Radio checked={shippingOptionId === option.value} />
                        <span className="text-base-regular">
                          {option.label}
                        </span>
                      </div>
                      <span className="justify-self-end text-base-content">
                        {option.price}
                      </span>
                    </RadioGroup.Option>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-neutral-content">
                  <Spinner />
                </div>
              )}
            </RadioGroup>
            <ErrorMessage
              errors={errors}
              name="soId"
              render={({ message }) => {
                return (
                  <div className="pt-2 text-error text-small-regular">
                    <span>{message}</span>
                  </div>
                )
              }}
            />
          </div>

          <button
            className="btn mt-6"
            onClick={() => submitShippingOption(shippingOptionId)}
          >
            Continue to payment
          </button>
        </div>
      ) : (
        <div>
          <div className="text-sm font-normal">
            {cart && shippingReady && (
              <div className="flex flex-col w-1/3">
                <p className="text-base text-primary mb-1">Method</p>
                <p className="text-sm font-normal text-base-content">
                  {cart.shipping_methods[0].shipping_option.name} (
                  {formatAmount({
                    amount: cart.shipping_methods[0].price,
                    region: cart.region,
                  })
                    .replace(/,/g, "")
                    .replace(/\./g, ".")}
                  )
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping

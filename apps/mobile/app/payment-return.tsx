import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import { getPaymentStatus } from "../src/lib/api/get-payment-status";
import { useCart } from "../src/context/CartContext";
import { COLORS } from "../src/constants/colors";

function formatCurrency(value: number | null | undefined) {
  return `₦${Number(value ?? 0).toLocaleString()}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function PaymentReturnScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const { clearCart } = useCart();

  const reference = useMemo(() => {
    const raw = params.reference;

    if (Array.isArray(raw)) {
      return raw[0] ?? "";
    }

    return typeof raw === "string" ? raw : "";
  }, [params.reference]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment...");
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderCreatedAt, setOrderCreatedAt] = useState<string | null>(null);
  const [paidAt, setPaidAt] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cartCleared = false;

    const checkStatus = async () => {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const result = await getPaymentStatus(reference, token);

        if (!isMounted) return;

        setPaymentStatus(result.paymentStatus);

        if (!result.order) {
          setOrderId(null);
          setOrderTotal(0);
          setOrderCreatedAt(null);
          setPaidAt(result.paidAt ?? null);
          setMessage("Payment is still being confirmed...");
          return;
        }

        setOrderId(result.order.id);
        setOrderTotal(Number(result.order.total ?? 0));
        setOrderCreatedAt(result.order.createdAt);
        setPaidAt(result.paidAt ?? result.order.paidAt ?? null);

        const normalizedPayment = result.paymentStatus.toLowerCase();
        const normalizedOrderPayment = result.order.paymentStatus.toLowerCase();

        if (
          normalizedPayment === "paid" &&
          normalizedOrderPayment === "paid"
        ) {
          setMessage("Payment confirmed. Redirecting to your order...");

          if (!cartCleared) {
            clearCart();
            cartCleared = true;
          }

          if (intervalId) {
            clearInterval(intervalId);
          }

          timeoutId = setTimeout(() => {
            router.replace(`/order/${result.order!.id}` as any);
          }, 1800);

          setLoading(false);
          return;
        }

        if (
          normalizedPayment === "failed" ||
          normalizedPayment === "abandoned" ||
          normalizedPayment === "mismatch"
        ) {
          setMessage("Payment could not be confirmed.");
          setLoading(false);

          if (intervalId) {
            clearInterval(intervalId);
          }

          return;
        }

        setMessage("Payment is still being confirmed...");
      } catch (error) {
        if (!isMounted) return;

        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to verify payment."
        );
        setLoading(false);

        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };

    if (!reference) {
      setMessage("Missing payment reference.");
      setLoading(false);
      return;
    }

    checkStatus();

    intervalId = setInterval(checkStatus, 3000);

    timeoutId = setTimeout(() => {
      if (!isMounted) return;

      setLoading(false);
      setMessage(
        "Verification is taking longer than expected. You can check your order status."
      );

      if (intervalId) {
        clearInterval(intervalId);
      }
    }, 30000);

    return () => {
      isMounted = false;

      if (intervalId) {
        clearInterval(intervalId);
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [reference, getToken, clearCart, router]);

  const goToOrder = () => {
    if (orderId) {
      router.replace(`/order/${orderId}` as any);
      return;
    }

    router.replace("/orders" as any);
  };

  const isPaid = paymentStatus.toLowerCase() === "paid";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#EEF2F7" }}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: COLORS.white,
            borderRadius: 28,
            paddingHorizontal: 22,
            paddingVertical: 28,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}
        >
          <View
            style={{
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: "#E9EDFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#6D82F3",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loading && !isPaid ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 28,
                      fontWeight: "900",
                      marginTop: -2,
                    }}
                  >
                    ✓
                  </Text>
                )}
              </View>
            </View>
          </View>

          <Text
            style={{
              fontSize: 24,
              lineHeight: 34,
              fontWeight: "400",
              textAlign: "center",
              color: "#0F172A",
              marginBottom: 10,
            }}
          >
            {isPaid
              ? "Success! Your payment has been confirmed."
              : "Payment Status"}
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 23,
              textAlign: "center",
              color: "#7C8595",
              marginBottom: 20,
            }}
          >
            {message}
          </Text>

          <View
            style={{
              backgroundColor: "#F6F7FB",
              borderRadius: 20,
              padding: 18,
              marginBottom: 24,
            }}
          >
            <SummaryRow
              label="Order Number"
              value={orderId ? orderId.slice(0, 8).toUpperCase() : "N/A"}
            />

            <SummaryRow
              label="Order Date"
              value={formatDate(orderCreatedAt)}
            />

            <SummaryRow
              label="Payment Status"
              value={paymentStatus ? paymentStatus.toUpperCase() : "PENDING"}
            />

            <SummaryRow
              label="Amount Paid"
              value={formatCurrency(orderTotal)}
            />

            <SummaryRow
              label="Paid At"
              value={formatDateTime(paidAt)}
              noMargin
            />
          </View>

          <Pressable
            onPress={goToOrder}
            style={{
              backgroundColor: "#02024D",
              borderRadius: 999,
              paddingVertical: 17,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {orderId ? "Open Order" : "Back to Orders"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  noMargin,
}: {
  label: string;
  value: string;
  noMargin?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: noMargin ? 0 : 14,
      }}
    >
      <Text
        style={{
          flex: 1,
          fontSize: 14,
          color: "#8B94A6",
          lineHeight: 21,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          flex: 1,
          fontSize: 14,
          color: "#111827",
          fontWeight: "500",
          textAlign: "right",
          lineHeight: 21,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
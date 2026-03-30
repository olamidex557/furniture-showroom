import { ReactNode } from "react";
import { MotiView } from "moti";

export default function AnimatedScreen({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 450,
        delay,
      }}
      style={{ flex: 1 }}
    >
      {children}
    </MotiView>
  );
}
import { ReactNode } from "react";
import { MotiView } from "moti";

export default function AnimatedCard({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: any;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: "timing",
        duration: 420,
        delay,
      }}
      style={style}
    >
      {children}
    </MotiView>
  );
}
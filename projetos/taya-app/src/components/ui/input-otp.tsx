import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
);

InputOTP.displayName = "InputOTP";

function InputOTPGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

function InputOTPSlot({ index, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { index: number }) {
  const otpContext = React.useContext(OTPInputContext);
  const slot = otpContext.slots[index];

  return (
    <div
      className={cn(
        "flex h-12 w-10 items-center justify-center rounded-md border border-border bg-white text-lg font-semibold transition-all",
        slot.isActive && "border-primary ring-2 ring-primary/20",
        className
      )}
      {...props}
    >
      {slot.char ?? ""}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot };

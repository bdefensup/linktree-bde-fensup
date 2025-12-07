import { memo } from "react"
import { CaseSensitive } from "lucide-react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const CaseSensitiveIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <CaseSensitive
      className={className}
      {...props}
    />
  )
})

CaseSensitiveIcon.displayName = "CaseSensitiveIcon"

import * as React from 'react'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: reusable component, htmlFor is passed via props at usage site
    <label
      ref={ref}
      className={`form-label ${className || ''}`}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Label }

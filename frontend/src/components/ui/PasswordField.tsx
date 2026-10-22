import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { IconButton } from './IconButton'
import { TextField } from './TextField'

type PasswordFieldProps = {
  label: string
  error?: string
  help?: string
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'>

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false)

    const trailing: ReactNode = (
      <IconButton
        variant="ghost"
        icon={visible ? 'visibility_off' : 'visibility'}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setVisible((v) => !v)}
      />
    )

    return (
      <TextField
        ref={ref}
        {...props}
        multiline={false}
        type={visible ? 'text' : 'password'}
        trailing={trailing}
      />
    )
  },
)

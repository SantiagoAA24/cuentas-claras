import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'
import { Icon } from './Icon'

type TextFieldShared = {
  label: string
  error?: string
  /**
   * Marca el campo inválido (borde rojo + aria-invalid) sin caption.
   * Útil cuando el mensaje de error es compartido (p. ej. login 7b).
   */
  invalid?: boolean
  help?: string
  trailing?: ReactNode
  className?: string
}

type TextFieldInputProps = TextFieldShared & {
  multiline?: false
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>

type TextFieldTextareaProps = TextFieldShared & {
  multiline: true
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>

export type TextFieldProps = TextFieldInputProps | TextFieldTextareaProps

const fieldText =
  'w-full min-w-0 bg-transparent text-body-lg font-bold text-tinta outline-none placeholder:text-tinta-tenue'

export const TextField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextFieldProps
>(function TextField(props, ref) {
  const {
    label,
    error,
    invalid = false,
    help,
    trailing,
    className,
    multiline,
    id: idProp,
    disabled,
    ...rest
  } = props

  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = `${id}-error`
  const helpId = `${id}-help`
  const hasErrorMessage = error != null && error !== ''
  const hasError = hasErrorMessage || invalid
  const describedBy = hasErrorMessage
    ? errorId
    : help
      ? helpId
      : undefined

  const shellClass = cn(
    'flex rounded-lg border-2 bg-superficie',
    multiline ? 'items-start' : 'h-touch-lg items-center',
    trailing != null ? 'pr-1 pl-4' : multiline ? '' : 'px-4',
    hasError
      ? 'border-peligro focus-within:shadow-focus'
      : 'border-borde-fuerte focus-within:border-tostado-500 focus-within:shadow-focus',
  )

  const controlProps = {
    id,
    disabled,
    'aria-invalid': hasError || undefined,
    'aria-describedby': describedBy,
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-label font-extrabold text-tostado-700"
      >
        {label}
      </label>

      <div className={shellClass}>
        {multiline ? (
          <textarea
            ref={ref as Ref<HTMLTextAreaElement>}
            className={cn(fieldText, 'resize-none px-3.5 py-3')}
            {...controlProps}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as Ref<HTMLInputElement>}
            className={cn(fieldText, 'h-full')}
            {...controlProps}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {trailing}
      </div>

      {hasErrorMessage ? (
        <p
          id={errorId}
          className="flex items-center gap-1 text-caption font-extrabold text-peligro"
        >
          <Icon name="error" size={18} />
          {error}
        </p>
      ) : help != null && help !== '' ? (
        <p id={helpId} className="text-caption font-bold text-tinta-suave">
          {help}
        </p>
      ) : null}
    </div>
  )
})

export type ProductoFormValues = {
  nombre: string
  /** Entero en pesos; null si el campo está vacío. */
  precio: number | null
}

export type ProductoFormErrors = {
  nombre?: string
  precio?: string
}

export const ERROR_NOMBRE_OBLIGATORIO = 'El nombre es obligatorio'
export const ERROR_PRECIO_MAYOR_CERO = 'El precio debe ser mayor a $0'

/** Valida el formulario de producto. Errores solo tras intentar guardar. */
export function validarProductoForm(
  values: ProductoFormValues,
): ProductoFormErrors {
  const errors: ProductoFormErrors = {}
  if (!values.nombre.trim()) {
    errors.nombre = ERROR_NOMBRE_OBLIGATORIO
  }
  if (values.precio == null || values.precio <= 0) {
    errors.precio = ERROR_PRECIO_MAYOR_CERO
  }
  return errors
}

export function productoFormEsValido(errors: ProductoFormErrors): boolean {
  return errors.nombre == null && errors.precio == null
}

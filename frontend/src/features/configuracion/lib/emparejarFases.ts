export type EmparejarFase = 'instrucciones' | 'buscando' | 'conectada'

export const EMPAREJAR_PASOS = [
  'Enciende la impresora y espera a que la luz quede fija',
  'Activa el Bluetooth de este celular',
  'Si pide clave, suele ser 0000 o 1234',
] as const

/** Credenciales incorrectas o vacías en el login mock. */
export class CredencialesInvalidasError extends Error {
  constructor() {
    super('Usuario o contraseña incorrectos')
    this.name = 'CredencialesInvalidasError'
  }
}

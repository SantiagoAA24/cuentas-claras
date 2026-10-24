import { createAuthRepo } from './authRepo'
import { createConfiguracionRepo } from './dexie/configuracionRepo'
import { createProductosRepo } from './dexie/productosRepo'
import { createVentasRepo } from './dexie/ventasRepo'
import { db } from '../lib/db'

export const productosRepo = createProductosRepo(db)
export const ventasRepo = createVentasRepo(db)
export const configuracionRepo = createConfiguracionRepo(db)
export const authRepo = createAuthRepo()

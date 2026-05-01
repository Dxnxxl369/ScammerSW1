import { useEffect, useState, useCallback } from 'react'
import { anonimoService } from '../services/anonimoService'
import type { Anonimo } from '../types/auth'

const LIMITE_INTENTOS_ANONIMO = 3

export function useAnonimo() {
  const [anonimo, setAnonimo] = useState<Anonimo | null>(null)
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(async () => {
    setCargando(true)
    const sesion = await anonimoService.asegurarSesion()
    setAnonimo(sesion)
    setCargando(false)
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const incrementarIntento = async (): Promise<{ ok: boolean; restantes: number }> => {
    if (!anonimo) return { ok: false, restantes: 0 }

    if (anonimo.intentos_usados >= LIMITE_INTENTOS_ANONIMO) {
      return { ok: false, restantes: 0 }
    }

    const actualizado = await anonimoService.incrementarIntentos(anonimo.id_sesion)
    if (actualizado) {
      setAnonimo(actualizado)
      return {
        ok: true,
        restantes: LIMITE_INTENTOS_ANONIMO - actualizado.intentos_usados,
      }
    }
    return { ok: false, restantes: 0 }
  }

  const intentosRestantes = anonimo
    ? Math.max(0, LIMITE_INTENTOS_ANONIMO - anonimo.intentos_usados)
    : 0

  const limiteAlcanzado = intentosRestantes === 0

  return {
    anonimo,
    cargando,
    intentosRestantes,
    limiteAlcanzado,
    incrementarIntento,
    recargar,
  }
}

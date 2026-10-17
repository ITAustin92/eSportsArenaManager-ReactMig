import { useEffect, useState } from 'react'
import { obtenerDatos, suscribirDatos } from '../datos/datos'

export default function VistaSuscrita({ Componente, props }) {
  const [datos, setDatos] = useState(obtenerDatos)
  useEffect(() => suscribirDatos(setDatos), [])
  return <Componente datos={datos} {...props} />
}

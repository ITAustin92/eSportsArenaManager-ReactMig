function ListaIntegrantes({ integrantes, capitanId, onQuitar }) {
  return integrantes.length === 0 ? <p>Aún no has agregado integrantes.</p> : <ul className="lista-limpia">{integrantes.map((miembro) => <li key={miembro.id} className="separador-fila acciones"><span><strong>{miembro.nombre}</strong> · {miembro.id === capitanId ? 'Capitán' : miembro.rol}</span>{onQuitar && <button className="boton boton-secundario" type="button" onClick={() => onQuitar(miembro.id)}>Quitar {miembro.nombre}</button>}</li>)}</ul>
}
export default ListaIntegrantes

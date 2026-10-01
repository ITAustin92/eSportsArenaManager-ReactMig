function ListaIntegrantes({ integrantes = [] }) { return <ul>{integrantes.map((integrante) => <li key={integrante.id}>{integrante.nombre}</li>)}</ul> }
export default ListaIntegrantes

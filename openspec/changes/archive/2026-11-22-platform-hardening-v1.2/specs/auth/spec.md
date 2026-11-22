## MODIFIED Requirements

### Requirement: Endpoints de gestión protegidos
Los controladores `Course` y `Video` SHALL exigir JWT válido y SHALL derivar el usuario del claim
`NameIdentifier`; NO SHALL aceptar `userId` enviado por el cliente.

#### Scenario: Curso ajeno
- **WHEN** un instructor autenticado intenta editar un curso de otro instructor
- **THEN** la API responde 404 y no modifica datos

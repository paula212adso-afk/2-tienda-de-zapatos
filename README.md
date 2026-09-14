Paula 
RF01 — El sistema debe permitir la gestión de cuentas de clientes: el admin puede crearlas y el cliente puede autoregistrarse e iniciar sesión.
RF02 — El sistema debe permitir la gestión de cuentas de trabajadores: el admin las crea y el trabajador puede iniciar sesión.
Brayan
RF03 — El sistema debe permitir al cliente visualizar el catálogo de zapatos disponibles.
RF04 — El sistema debe permitir al admin y al trabajador visualizar el inventario completo de calzado.
kevin
RF05 — El sistema debe permitir al trabajador gestionar productos (agregar, editar y eliminar) en el inventario.
RF06 — El sistema debe permitir al admin editar y eliminar productos del inventario.
Juan
RF07 — El sistema debe permitir al admin eliminar una cuenta de trabajador.
RF08 — El sistema debe permitir al admin eliminar una cuenta de cliente.


IA: DOCUMENTACION INDIVIDUAL
caso de uso
diagrama caso de uso
diagrama de clase

De acuerdo a este requisito funcional Me puedes dar el caso de uso con los siguientes pasos descripción actores precondición secuencia normal post condición alternativas adicional me regalas el código en plan uml el diagrama de caso de uso de este 

diagrama UML
@startuml
left to right direction

actor Cliente
actor Administrador as Admin

rectangle "Sistema zapatería" {
  usecase "Crear cuenta de cliente" as UC1
  usecase "Registrarse" as UC2
  usecase "Iniciar sesión" as UC3
}

Admin --> UC1
Cliente --> UC2
Cliente --> UC3
UC1 .> UC3 : <<extend>>
UC2 .> UC3 : <<extend>>
@enduml

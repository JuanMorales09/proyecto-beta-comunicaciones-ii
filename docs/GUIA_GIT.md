# Guia rapida de Git para el equipo

## Primera subida (una sola vez)
```powershell
cd <carpeta con README.md>
git init
git add .
git commit -m "feat: estructura inicial, modelo Python QPSK+CW, GRC S2 e informe"
git branch -M main
git remote add origin https://github.com/Jean2434gamer/proyecto-beta-comunicaciones-ii.git
git push -u origin main
git checkout -b develop
git push -u origin develop
```

## Trabajo por ramas
```powershell
git checkout develop
git checkout -b feature/<nombre-de-la-tarea>
# ... cambios ...
git add .
git commit -m "tipo(alcance): descripcion"
git push -u origin feature/<nombre-de-la-tarea>
```
Luego, en GitHub: Pull Request hacia `develop` y merge. Al final: `develop` -> `main`.

## Autoria de los commits (un solo PC)
Cada commit queda con el autor configurado en ese momento. Antes de commitear un trabajo,
configura quien lo hizo realmente:
```powershell
git config user.name "Nombre Apellido"
git config user.email "correo@ejemplo.com"
```

## Ramas sugeridas
| Rama | Contenido |
|---|---|
| `feature/modelo-python` | `src/`, `simulations/`, `tests/` |
| `feature/grc-s2` | `grc/`, capturas en `docs/figuras/` |
| `feature/informe` | `docs/informe/` |

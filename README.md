# 🎴 Pokémon Trainer Academia

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Una plataforma completa para el análisis y gestión de partidas de Pokémon TCG Live**

*Transforma tus logs de partidas en insights estratégicos con análisis automático avanzado*

[🚀 Demo en Vivo](https://replit.com/@manucruzleiva/PokemonTCGLLogger) • [📖 Documentación](#documentación) • [🐛 Reportar Bug](https://github.com/manucruzleiva/PokemonTCGLLogger/issues)

</div>

---

## 🎯 Características Principales

### 🧠 **Análisis Inteligente Automático**
- **Parser Avanzado**: Extrae automáticamente jugadores, Pokémon, cartas utilizadas y condiciones de victoria
- **68 Partidas Analizadas**: Base de datos con logs reales ya procesados
- **4 Condiciones de Victoria**: Detección precisa de Prize cards, Concede, Deck out, Ran out of pokemon
- **Clasificación Inteligente**: Identifica tipos de cartas (Pokémon, Entrenadores, Energías, Supporters)

### 🔐 **Sistema de Autenticación Robusto**
- **Replit Auth**: Login seguro con email y contraseña
- **Protección de Identidad**: Sistema anti-duplicados para nombres de jugador
- **Perfiles Personalizados**: Configuración individual de nombres TCG
- **Reportes de Asistencia**: Sistema de disputas con evidencia fotográfica

### 📱 **Interfaz Moderna y Responsive**
- **Diseño Mobile-First**: Menú hamburguesa optimizado para móviles
- **Modo Oscuro/Claro**: Toggle de tema con persistencia
- **Navegación Intuitiva**: Desktop y mobile con transiciones suaves
- **Componentes Modernos**: Shadcn/UI + Radix UI para máxima accesibilidad

### 📊 **Estadísticas y Analytics Avanzados**
- **Rankings Dinámicos**: Top 15 jugadores por victorias
- **Meta Analysis**: Pokémon más utilizados con imágenes oficiales
- **Distribución de Victorias**: Gráficos de condiciones de victoria
- **Actividad Reciente**: Timeline de partidas y tendencias
- **Filtros Avanzados**: Búsqueda por jugador, fecha, duración, uploader

### 🖼️ **Integración Visual Rica**
- **PokeAPI**: Sprites oficiales de todos los Pokémon
- **Carga Dinámica**: Lazy loading para rendimiento óptimo
- **Fallbacks Inteligentes**: Manejo de errores visual elegante
- **Pokémon Validation**: Filtrado automático de nombres inválidos

## 🛠️ Stack Tecnológico

<table align="center">
<tr>
<td><h3>🎨 Frontend</h3></td>
<td><h3>⚙️ Backend</h3></td>
<td><h3>🗃️ Base de Datos</h3></td>
</tr>
<tr>
<td>

- **React 18** con TypeScript
- **Vite** (Build & Dev Server)
- **Shadcn/UI** + **Radix UI**
- **Tailwind CSS** + **CSS Variables**
- **TanStack Query** (Estado global)
- **Wouter** (Enrutamiento SPA)
- **Framer Motion** (Animaciones)
- **React Hook Form** (Formularios)

</td>
<td>

- **Express.js** + **TypeScript**
- **Drizzle ORM** (Type-safe SQL)
- **Replit Auth** (OAuth/OIDC)
- **WebSockets** (Tiempo real)
- **SendGrid** (Email service)
- **Node.js 20** (Runtime)
- **ESM Modules** (Modern JS)
- **Zod** (Validación schemas)

</td>
<td>

- **PostgreSQL** (Neon hosting)
- **Drizzle Kit** (Migraciones)
- **Schema Validation** (Zod)
- **Conexión Serverless**
- **Sessions Storage**
- **68+ Match Records**
- **Users & Profiles**
- **Real-time Updates**

</td>
</tr>
</table>

### 🌐 **APIs e Integraciones Externas**
| API | Propósito | Status |
|-----|-----------|--------|
| **PokeAPI** | Sprites oficiales de Pokémon, datos de tipos | ✅ Activa |
| **Pokémon TCG API** | Clasificación y análisis de cartas | ✅ Activa |
| **Replit Auth** | Autenticación OAuth segura | ✅ Activa |
| **SendGrid** | Notificaciones email para disputas | ✅ Configurada |

## 🚀 Guía de Instalación y Desarrollo

### 📋 **Prerrequisitos**
- **Node.js** 18+ (recomendado: 20.x)
- **PostgreSQL** 14+ o Neon Database
- **Git** para control de versiones
- **Cuenta Replit** (para auth) o configuración OAuth propia

### 🔧 **Variables de Entorno Requeridas**

Crea un archivo `.env` en la raíz del proyecto:

```bash
# 🗃️ Base de Datos (Obligatorio)
DATABASE_URL="postgresql://user:password@host:port/database"

# 🔐 Autenticación Replit (Obligatorio)
SESSION_SECRET="your-super-secret-session-key-here"
REPL_ID="your-replit-app-id"
REPLIT_DOMAINS="your-replit-domain.replit.app"

# 🤖 APIs Externas (Opcional pero recomendado)
OPENAI_API_KEY="sk-your-openai-key-for-advanced-analysis"
POKEMON_TCG_API_KEY="your-pokemon-tcg-api-key"

# 📧 Email Service (Opcional - para disputas)
SENDGRID_API_KEY="your-sendgrid-key"
```

<details>
<summary>📖 ¿Cómo obtener las API Keys?</summary>

#### 🔑 **OpenAI API Key**
1. Visita [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API key
3. Copia la key que empieza con `sk-`

#### 🎴 **Pokémon TCG API Key**
1. Regístrate en [Pokémon TCG Developers](https://dev.pokemontcg.io/)
2. Obtén tu API key gratuita
3. Límite: 20,000 requests/día

#### 📧 **SendGrid API Key**
1. Crea cuenta en [SendGrid](https://sendgrid.com/)
2. Ve a Settings → API Keys
3. Crea nueva API key con permisos de envío

</details>

### ⚡ **Instalación Rápida**

```bash
# 1️⃣ Clonar repositorio
git clone https://github.com/manucruzleiva/PokemonTCGLLogger.git
cd PokemonTCGLLogger

# 2️⃣ Instalar dependencias
npm install

# 3️⃣ Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 4️⃣ Configurar base de datos
npm run db:push

# 5️⃣ (Opcional) Cargar datos de ejemplo
npm run seed

# 6️⃣ Iniciar en desarrollo
npm run dev
```

### 🐳 **Docker (Alternativo)**

```bash
# Desarrollo con Docker Compose
docker-compose up -dev

# Producción
docker-compose up -d
```

### 📱 **Scripts Disponibles**

| Comando | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `npm run dev` | Inicia servidor desarrollo | Desarrollo diario |
| `npm run build` | Construye para producción | Antes del deploy |
| `npm run preview` | Vista previa del build | Testing pre-deploy |
| `npm run db:push` | Aplica schemas a DB | Cambios en schema |
| `npm run db:studio` | Abre Drizzle Studio | Explorar/editar DB |
| `npm run lint` | Ejecuta ESLint | Control de calidad |
| `npm run type-check` | Verifica tipos TypeScript | Debugging de tipos |

## 📊 Funcionalidades Detalladas

### 🔍 **Motor de Análisis de Partidas**

<details>
<summary><strong>🧠 Parser Inteligente de Logs</strong></summary>

#### Capacidades de Extracción:
- ✅ **Jugadores**: Detección automática de ambos participantes
- ✅ **Pokémon**: Reconocimiento de todos los Pokémon mencionados con validación
- ✅ **Cartas**: Clasificación automática de 7 tipos (Pokémon, Trainers, Items, Supporters, Stadiums, Energy)
- ✅ **Condiciones de Victoria**: 4 tipos precisos (Prize cards, Concede, Deck out, Ran out of pokemon)
- ✅ **Metadatos**: Duración, turnos, ganador, fecha de partida

#### Patrones de Reconocimiento:
```regex
# Ejemplos de patrones que reconoce el parser
- "ArchShiero played Professor's Research"
- "TCGEmpireYT used Charizard's ability"
- "MollyJomy attached Basic Fighting Energy"
- "Player evolved Charmander into Charmeleon"
```

</details>

<details>
<summary><strong>📈 Sistema de Estadísticas Avanzadas</strong></summary>

#### 📊 **Rankings y Métricas**:
- **Top 15 Jugadores**: Ordenados por victorias totales
- **Win Rate**: Porcentaje de victorias por jugador
- **Pokémon Meta**: Los 15 Pokémon más utilizados con sprites
- **Cartas Populares**: Top 15 cartas más jugadas (excluye energías básicas)
- **Distribución de Victorias**: Gráfico circular de condiciones

#### 📅 **Actividad y Tendencias**:
- **Timeline Reciente**: Últimas 10 partidas con timestamps
- **Uploaders Activos**: Usuarios que más logs aportan
- **Filtros Dinámicos**: Por fecha, jugador, duración, uploader

</details>

### 👥 **Sistema de Gestión de Usuarios**

<details>
<summary><strong>🔐 Autenticación y Seguridad</strong></summary>

#### Características de Seguridad:
- **OAuth con Replit**: Integración nativa segura
- **Protección de Identidad**: Anti-duplicados para nombres TCG
- **Sesiones Persistentes**: Login recordado entre visitas
- **Validación de Datos**: Schemas Zod para todas las entradas

#### Gestión de Perfiles:
- **Nombres TCG Únicos**: Un nombre por usuario registrado
- **Sistema de Disputas**: Reporte de conflictos de identidad
- **Evidencia Fotográfica**: Upload de imágenes para disputas
- **Email Automático**: Notificaciones via SendGrid

</details>

### 🎨 **Experiencia de Usuario**

<details>
<summary><strong>📱 Interfaz Responsive y Moderna</strong></summary>

#### Diseño Mobile-First:
- **Menú Hamburguesa**: Navegación optimizada para móviles
- **Touch Gestures**: Swipe y tap para navegación
- **Viewport Adaptativo**: Se ajusta a cualquier pantalla

#### Temas y Personalización:
- **Modo Oscuro/Claro**: Toggle con persistencia localStorage
- **Paleta Material**: Colores inspirados en Material Design
- **Animaciones Suaves**: Transiciones con Framer Motion
- **Tipografía Legible**: Fuentes optimizadas para lectura

#### Componentes Interactivos:
- **Modales Avanzados**: Para detalles de partidas y configuraciones
- **Tooltips Informativos**: Explicaciones contextuales
- **Loading States**: Skeletons y spinners elegantes
- **Error Boundaries**: Manejo graceful de errores

</details>

## 🏗️ Arquitectura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilidades y configuración
├── server/                # Backend Express
│   ├── routes/           # Endpoints de API
│   ├── utils/            # Utilidades del servidor
│   └── storage.ts        # Capa de datos
├── shared/               # Código compartido
│   └── schema.ts         # Esquemas de base de datos
└── scripts/              # Scripts de utilidad
```

## 🎮 Uso

1. **Registro**: Crea una cuenta y configura tu nombre de jugador
2. **Subir Partidas**: Pega los logs de PTCGL en el uploader
3. **Ver Estadísticas**: Analiza tu rendimiento y el meta
4. **Explorar**: Navega por todas las partidas de la comunidad

## 📈 Estadísticas Soportadas

- Rankings de jugadores por victorias
- Pokémon más utilizados con imágenes
- Cartas más populares (excluyendo energías básicas)
- Distribución de condiciones de victoria
- Actividad reciente de usuarios
- Análisis de meta y tendencias

## 🎮 Guía de Uso Rápido

### 📝 **Para Nuevos Usuarios**

1. **🔐 Registro**: 
   - Crea cuenta con email y contraseña
   - Configura tu nombre de jugador TCG (único y protegido)

2. **📤 Subir Primera Partida**:
   - Ve a "Subir Partida" en el menú
   - Pega el log completo de PTCGL 
   - El parser automáticamente extraerá todos los datos

3. **📊 Explorar Estadísticas**:
   - Visita la página de estadísticas para ver análisis global
   - Filtra por tu nombre para ver tu rendimiento personal

4. **🔍 Buscar y Filtrar**:
   - Usa filtros avanzados para encontrar partidas específicas
   - Combina múltiples criterios de búsqueda

### 🛠️ **Para Desarrolladores**

<details>
<summary><strong>🏗️ Arquitectura del Proyecto</strong></summary>

```
📁 PokemonTCGLLogger/
├── 🎨 client/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes reutilizables UI
│   │   ├── pages/            # Páginas de la aplicación
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilidades y configuración
│   │   └── services/         # Servicios API (PokeAPI, etc.)
├── ⚙️ server/                 # Backend Express + TypeScript
│   ├── routes/               # Endpoints REST API
│   ├── utils/                # Utilidades del servidor
│   │   ├── matchParser.ts    # 🔥 Parser principal de logs
│   │   ├── cardAnalyzer.ts   # Análisis de cartas
│   │   └── pokemonClassifier.ts # Validación Pokemon
│   ├── storage.ts            # Capa de abstracción de datos
│   └── db.ts                 # Configuración Drizzle ORM
├── 🗃️ shared/                # Código compartido
│   └── schema.ts             # Schemas de base de datos (Drizzle)
└── 📜 scripts/               # Scripts de utilidad
    └── reparse-matches.js    # Re-procesamiento de partidas
```

</details>

<details>
<summary><strong>🔧 Puntos de Extensión</strong></summary>

#### Áreas Fáciles de Extender:
- **Nuevos Parsers**: Agregar soporte para otros formatos de log
- **APIs Adicionales**: Integrar más fuentes de datos de cartas
- **Métricas Custom**: Nuevos tipos de análisis estadístico
- **Exportación**: Formatos adicionales (PDF, Excel, JSON)
- **Notificaciones**: Webhooks, Discord bots, etc.

#### Contribuciones Buscadas:
- 🐛 Reportes de bugs con logs de ejemplo
- 📈 Ideas para nuevas métricas y visualizaciones  
- 🎨 Mejoras de UX/UI
- 🔍 Optimizaciones de rendimiento
- 📱 Características mobile adicionales

</details>

## 🤝 Contribución

¡Las contribuciones son muy bienvenidas! Este proyecto está abierto a la comunidad.

### 🚀 **Proceso de Contribución**

1. **🍴 Fork** el proyecto
2. **🌿 Crea** una rama feature: `git checkout -b feature/nueva-caracteristica`
3. **✍️ Commit** tus cambios: `git commit -m 'feat: agregar nueva característica'`
4. **📤 Push** a la rama: `git push origin feature/nueva-caracteristica`
5. **🔃 Abre** un Pull Request

### 📋 **Guidelines de Contribución**

- **🧪 Tests**: Agrega tests para nuevas funcionalidades
- **📝 Docs**: Actualiza documentación según corresponda
- **🎯 Scope**: Mantén cambios enfocados y atómicos
- **💬 Mensajes**: Usa conventional commits (`feat:`, `fix:`, `docs:`)

### 🐛 **Reportar Issues**

- Usa el template de issue proporcionado
- Incluye logs de ejemplo si es relevante
- Especifica navegador y versión para bugs de UI

## 📊 Estado del Proyecto

### ✅ **Completado**
- ✅ Parser de logs PTCGL completamente funcional
- ✅ Sistema de autenticación con Replit Auth
- ✅ Interfaz responsive mobile/desktop
- ✅ 68+ partidas reales analizadas
- ✅ Integración PokeAPI para imágenes
- ✅ Sistema de estadísticas avanzadas
- ✅ Protección de identidad de jugadores

### 🚧 **En Desarrollo** 
- 🔄 Sistema de notificaciones push
- 🔄 Exportación de datos (PDF/Excel)
- 🔄 API pública para desarrolladores
- 🔄 Modo torneo/competencia

### 💡 **Roadmap Futuro**
- 🎯 Análisis predictivo con IA
- 🎯 Integración con Discord bot
- 🎯 Soporte para otros TCGs
- 🎯 Mobile app nativa
- 🎯 Sistema de rankings globales

## 📝 Licencia

Este proyecto está bajo la **Licencia MIT** - consulta el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto y Soporte

<div align="center">

**👨‍💻 Desarrollador Principal**  
**Manuel Cruz** - [@manucruzleiva](https://github.com/manucruzleiva)

**📧 Email**: shieromanu@gmail.com  
**🔗 Proyecto**: [PokemonTCGLLogger](https://github.com/manucruzleiva/PokemonTCGLLogger)  
**🚀 Demo**: [Ver Aplicación](https://replit.com/@manucruzleiva/PokemonTCGLLogger)

---

<sub>🎴 Desarrollado con ❤️ para la comunidad global de Pokémon TCG</sub>  
<sub>⚡ Potenciado por React, Express, PostgreSQL y mucha dedicación</sub>

</div>
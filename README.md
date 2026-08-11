# FreshTrack 🍏🚜

FreshTrack es una plataforma Web3 de trazabilidad agrícola y seguridad alimentaria descentralizada. Combina la inmutabilidad y eficiencia de **Arbitrum Stylus (Rust + WASM)** con la potencia de inferencia ultraveloz de la Inteligencia Artificial de **Cerebras** (Llama 3.1 70B) para garantizar la frescura de los alimentos, prevenir el desperdicio y certificar el origen del producto.

🌐 **Aplicación en Vivo:** [freshtrack-ecru.vercel.app](https://freshtrack-ecru.vercel.app)  
⛓️ **Smart Contract en Arbitrum Sepolia:** [`0x62fcee2dac606e1b7739d9c864c67472a3a38f27`](https://sepolia.arbiscan.io/address/0x62fcee2dac606e1b7739d9c864c67472a3a38f27)

---

## 📋 Tabla de Contenivos
1. [El Problema y el Impacto](#-el-problema-y-el-impacto)
2. [Solución Tecnológica](#-solución-tecnológica)
3. [Uso de Arbitrum Stylus (Rust + WASM)](#-uso-de-arbitrum-stylus-rust--wasm)
4. [Integración de Inteligencia Artificial (Cerebras)](#-integración-de-inteligencia-artificial-cerebras)
5. [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
6. [Instalación y Configuración](#%EF%B8%8F-instalación-y-configuración)

---

## 🚨 El Problema y el Impacto

### El Problema:
1. **Falta de Confianza y Opacidad:** Los consumidores carecen de herramientas confiables para verificar el origen real, los métodos de producción y el viaje físico de sus alimentos.
2. **Desperdicio Masivo de Alimentos:** Alrededor del **30% al 40%** de los alimentos cosechados se pierden en la cadena de suministro debido a la mala estimación de tiempos de expiración y falta de visibilidad logística.
3. **Altos Costos Blockchain:** Registrar cada micro-lote de producción agrícola en una blockchain tradicional (como Ethereum L1 o L2s tradicionales usando Solidity) genera costos de gas prohibitivos para los productores locales.

### El Impacto de FreshTrack:
- **Trazabilidad Inmutable:** Cada lote de alimentos cuenta con un pasaporte criptográfico inalterable.
- **Predicción Inteligente:** La IA ayuda a predecir la vida útil de los productos optimizando las rutas de distribución.
- **Democratización con Arbitrum Stylus:** Los costes de gas extremadamente bajos permiten a agricultores medianos y pequeños certificar su cadena sin gastar de más.

---

## 💡 Solución Tecnológica

FreshTrack proporciona tres interfaces adaptadas para cada participante de la cadena:
* **Productor:** Registra el lote de cosecha en la blockchain firmando la transacción y genera un código QR inmutable.
* **Transportista / Supermercado:** Escanea los códigos QR para verificar y actualizar el estado físico y geográfico del lote.
* **Consumidor:** Escanea el QR del empaque final y accede a toda la línea de tiempo del producto, con un análisis de frescura verificado por IA.

---

## ⚡ Uso de Arbitrum Stylus (Rust + WASM)

El núcleo lógico de FreshTrack corre sobre la nueva máquina virtual **Stylus** de Arbitrum. 

### ¿Por qué Arbitrum Stylus?
* **Rust en la EVM:** Desarrollado utilizando `stylus-sdk` en Rust, garantizando la máxima seguridad de tipos, manejo eficiente de memoria y control a nivel de bytes.
* **Compilación a WASM:** El código compila directamente a WebAssembly (WASM). Esto permite una ejecución de CPU a velocidad casi nativa dentro del nodo de la blockchain.
* **Reducción de Gas (>90%):** Al no depender de la EVM tradicional para cálculos complejos, el costo de registrar y verificar un lote se desploma a fracciones de centavo de dólar.

### Arquitectura de Datos en Stylus:
Debido a limitaciones actuales en el SDK de Stylus respecto al manejo de strings dinámicos en storage (`to_be_bytes` assertions), diseñamos una arquitectura ultra-eficiente de **solo Uint256**:
* **Codificación Reversible de Texto:** Los textos y nombres de los productos de hasta 31 caracteres se empaquetan en bytes, se rellenan con ceros (`zeroPadValue`) y se guardan como un entero de 256 bits (`productHash`).
* **Decodificación al Vuelo:** El frontend lee los enteros y los desempaqueta a caracteres UTF-8 en tiempo real. Esto permite compatibilidad Web3 nativa, reduciendo drásticamente el espacio en storage y el costo de gas del Smart Contract.

---

## 🤖 Integración de Inteligencia Artificial (Cerebras)

FreshTrack integra un asistente inteligente de frescura impulsado por la API de **Cerebras Systems** usando **Llama 3.1 70B**.

* **Velocidad de Inferencia Increíble:** Gracias a la arquitectura de hardware especializada de Cerebras, las inferencias de análisis de calidad e impacto se ejecutan en milisegundos (menos de 0.5s de latencia).
* **Análisis de Freshness:** La IA evalúa la vida útil restante según el tipo de producto, la fecha de cosecha, y genera recomendaciones de almacenamiento automatizadas para prevenir el desperdicio.
* **Proxy de API Seguro:** Implementamos un middleware serverless en `frontend/api/analyze.js` para asegurar que las API Keys de Cerebras nunca se expongan al frontend del usuario.

---

## 🛠️ Arquitectura y Stack Tecnológico

```
┌─────────────────┐       Escaneo QR       ┌────────────────────┐
│  Consumidor/UI  ├────────────────────────►│  Supermercado/UI   │
└────────┬────────┘                        └─────────┬──────────┘
         │                                           │
         │ Lectura / Firma de Tx                     │ Lectura / Firma de Tx
         ▼                                           ▼
┌───────────────────────────────────────────────────────────────┐
│              Frontend React + Ethers.js (Vite)                │
└────────┬───────────────────────────────────────────┬──────────┘
         │                                           │
         │ Inferencia de IA (Proxy)                  │ Ejecución WASM
         ▼                                           ▼
┌──────────────────┐                       ┌────────────────────┐
│   Cerebras API   │                       │  Arbitrum Stylus   │
│ (Llama 3.1 70B)  │                       │   (Rust Contract)  │
└──────────────────┘                       └────────────────────┘
```

* **Contratos:** Rust (v1.90.0), `stylus-sdk 0.9.0`, `alloy-primitives`.
* **Frontend:** React, Vite, Ethers.js v6, Tailwind / Vanilla CSS.
* **Backend Proxy:** Node.js Serverless (Vercel Functions).
* **Despliegue:** Vercel (Frontend), Arbitrum Sepolia Testnet (Contrato).

---

## ⚙️ Instalación y Configuración

### 1. Smart Contract (Arbitrum Stylus)
Requisitos: Tener instalado `cargo-stylus`.

```bash
cd stylus-contract
# Verificar que el contrato compile a WASM correctamente
cargo stylus check --endpoint https://sepolia-rollup.arbitrum.io/rpc

# Desplegar y activar en Arbitrum Sepolia
cargo stylus deploy \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc \
  --private-key <TU_CLAVE_PRIVADA> \
  --no-verify
```

### 2. Frontend (React + Vite)
Crea un archivo `.env` en la raíz de la carpeta `frontend/`:
```env
VITE_PRIVATE_KEY=your_sepolia_wallet_private_key
CEREBRAS_API_KEY=your_cerebras_api_key
```

Instala las dependencias y corre el servidor de desarrollo:
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Equipo
* **Desarrollado para la Hackathon** de Arbitrum Stylus & IA.

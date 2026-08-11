#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::string::String;

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::sol,
    block, evm, msg,
    prelude::*,
};

// ─────────────────────────────────────────────────────────────────────────────
// FreshTrack Trace — Arbitrum Stylus
//
// Contrato de trazabilidad de lotes. Guarda, por lote:
//   - product_name : nombre del producto (string legible on-chain)
//   - producer     : nombre del productor (string legible on-chain)
//   - expiration   : fecha de caducidad (timestamp Unix, u64)
//   - weight_grams : peso en gramos (u64)
//
// Optimizaciones frente a la versión con 4 mappings:
//   - `expiration` y `weight` se EMPAQUETAN en un mismo slot de 32 bytes.
//   - Se elimina el mapping `registered`: un lote existe si 1 <= id <= count.
//   - Se emiten eventos para poder indexar off-chain (frontend / timeline).
//   - Control de acceso (owner) + validación de entrada.
//
// Trade-off consciente: guardar strings on-chain cuesta más gas que un hash,
// pero permite LEER el nombre real del producto y del productor sin depender
// de una base de datos off-chain. Es lo que pediste.
// ─────────────────────────────────────────────────────────────────────────────

// Eventos: indexables off-chain. `batch_id` y `registrant` van indexed para
// poder filtrar; los strings viajan como data (un string indexed se guardaría
// como hash y no serviría para leer).
sol! {
    event BatchRegistered(
        uint256 indexed batch_id,
        address indexed registrant,
        string product_name,
        string producer,
        uint64 expiration_date,
        uint64 weight_grams
    );
    event Initialized(address indexed owner);

    error NotOwner();
    error AlreadyInitialized();
    error NotInitialized();
    error InvalidProduct();
    error InvalidProducer();
    error InvalidWeight();
    error InvalidExpiration();
    error BatchNotFound();
}

#[derive(SolidityError)]
pub enum TraceError {
    NotOwner(NotOwner),
    AlreadyInitialized(AlreadyInitialized),
    NotInitialized(NotInitialized),
    InvalidProduct(InvalidProduct),
    InvalidProducer(InvalidProducer),
    InvalidWeight(InvalidWeight),
    InvalidExpiration(InvalidExpiration),
    BatchNotFound(BatchNotFound),
}

sol_storage! {
    // Orden de campos = orden de packing en storage:
    //   - product_name : string (slot dinámico propio)
    //   - producer     : string (slot dinámico propio)
    //   - expiration_date (8 bytes) + weight_grams (8 bytes) -> EMPAQUETADOS
    //     juntos en un solo slot de 32 bytes.
    pub struct Batch {
        string product_name;
        string producer;
        uint64 expiration_date;
        uint64 weight_grams;
    }

    #[entrypoint]
    pub struct FreshTrackTrace {
        address owner;
        uint256 batch_count;
        mapping(uint256 => Batch) batches;
    }
}

#[public]
impl FreshTrackTrace {
    /// Inicializa el contrato fijando al owner (la fuente de datos de confianza).
    /// Solo se puede llamar una vez.
    pub fn init(&mut self) -> Result<(), TraceError> {
        if self.owner.get() != Address::ZERO {
            return Err(TraceError::AlreadyInitialized(AlreadyInitialized {}));
        }
        let sender = msg::sender();
        self.owner.set(sender);
        evm::log(Initialized { owner: sender });
        Ok(())
    }

    /// Registra un lote nuevo. Devuelve el id asignado.
    pub fn register_batch(
        &mut self,
        product_name: String,
        producer: String,
        expiration_date: u64,
        weight_grams: u64,
    ) -> Result<U256, TraceError> {
        self.only_owner()?;

        // Validación de entrada.
        if product_name.is_empty() {
            return Err(TraceError::InvalidProduct(InvalidProduct {}));
        }
        if producer.is_empty() {
            return Err(TraceError::InvalidProducer(InvalidProducer {}));
        }
        if weight_grams == 0 {
            return Err(TraceError::InvalidWeight(InvalidWeight {}));
        }
        if expiration_date <= block::timestamp() {
            return Err(TraceError::InvalidExpiration(InvalidExpiration {}));
        }

        // IDs secuenciales: 1, 2, 3, ...
        let id = self.batch_count.get() + U256::from(1u32);
        self.batch_count.set(id);

        // Escritura del lote.
        let mut batch = self.batches.setter(id);
        batch.product_name.set_str(&product_name);
        batch.producer.set_str(&producer);
        batch.expiration_date.set(expiration_date);
        batch.weight_grams.set(weight_grams);

        evm::log(BatchRegistered {
            batch_id: id,
            registrant: msg::sender(),
            product_name,
            producer,
            expiration_date,
            weight_grams,
        });

        Ok(id)
    }

    // ── Lecturas ──────────────────────────────────────────────────────────────

    /// Total de lotes registrados.
    pub fn get_batch_count(&self) -> U256 {
        self.batch_count.get()
    }

    /// Un lote existe si 1 <= id <= batch_count (IDs secuenciales).
    /// No hace falta un mapping `registered`: se deriva del contador.
    pub fn is_registered(&self, batch_id: U256) -> bool {
        !batch_id.is_zero() && batch_id <= self.batch_count.get()
    }

    /// Lectura completa del registro de un lote en una sola llamada:
    /// (product_name, producer, expiration_date, weight_grams).
    pub fn get_batch(
        &self,
        batch_id: U256,
    ) -> Result<(String, String, u64, u64), TraceError> {
        if !self.is_registered(batch_id) {
            return Err(TraceError::BatchNotFound(BatchNotFound {}));
        }
        let b = self.batches.getter(batch_id);
        Ok((
            b.product_name.get_string(),
            b.producer.get_string(),
            b.expiration_date.get(),
            b.weight_grams.get(),
        ))
    }

    /// Nombre del producto de un lote.
    pub fn get_product_name(&self, batch_id: U256) -> Result<String, TraceError> {
        if !self.is_registered(batch_id) {
            return Err(TraceError::BatchNotFound(BatchNotFound {}));
        }
        Ok(self.batches.getter(batch_id).product_name.get_string())
    }

    /// Nombre del productor de un lote.
    pub fn get_producer(&self, batch_id: U256) -> Result<String, TraceError> {
        if !self.is_registered(batch_id) {
            return Err(TraceError::BatchNotFound(BatchNotFound {}));
        }
        Ok(self.batches.getter(batch_id).producer.get_string())
    }

    /// Fecha de caducidad (timestamp Unix).
    pub fn get_expiration(&self, batch_id: U256) -> Result<u64, TraceError> {
        if !self.is_registered(batch_id) {
            return Err(TraceError::BatchNotFound(BatchNotFound {}));
        }
        Ok(self.batches.getter(batch_id).expiration_date.get())
    }

    /// Peso en gramos.
    pub fn get_weight(&self, batch_id: U256) -> Result<u64, TraceError> {
        if !self.is_registered(batch_id) {
            return Err(TraceError::BatchNotFound(BatchNotFound {}));
        }
        Ok(self.batches.getter(batch_id).weight_grams.get())
    }

    /// True si el lote ya caducó respecto al timestamp del bloque actual.
    pub fn is_expired(&self, batch_id: U256) -> Result<bool, TraceError> {
        if !self.is_registered(batch_id) {
            return Err(TraceError::BatchNotFound(BatchNotFound {}));
        }
        let exp = self.batches.getter(batch_id).expiration_date.get();
        Ok(exp <= block::timestamp())
    }

    /// Dirección del owner.
    pub fn owner(&self) -> Address {
        self.owner.get()
    }
}

// Helpers internos (no forman parte del ABI público).
impl FreshTrackTrace {
    fn only_owner(&self) -> Result<(), TraceError> {
        let owner = self.owner.get();
        if owner == Address::ZERO {
            return Err(TraceError::NotInitialized(NotInitialized {}));
        }
        if msg::sender() != owner {
            return Err(TraceError::NotOwner(NotOwner {}));
        }
        Ok(())
    }
}

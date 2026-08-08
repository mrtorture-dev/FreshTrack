#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;

use stylus_sdk::{alloy_primitives::U256, prelude::*};

// FreshTrack Trace Contract - Arbitrum Stylus
// Stores batch traceability data encoded as uint256 values
// product_type, origin, etc. are stored as keccak256 hashes (uint256)
sol_storage! {
    #[entrypoint]
    pub struct FreshTrackTrace {
        // Total number of registered batches
        uint256 batch_count;
        // batch_id => expiration_date (unix timestamp)
        mapping(uint256 => uint256) expiration_dates;
        // batch_id => keccak256(productType)
        mapping(uint256 => uint256) product_hashes;
        // batch_id => weight in grams
        mapping(uint256 => uint256) weights;
        // batch_id => registered (1 = yes)
        mapping(uint256 => uint256) registered;
    }
}

#[public]
impl FreshTrackTrace {
    /// Register a new batch. product_hash is keccak256(productType) computed off-chain.
    pub fn register_batch(
        &mut self,
        product_hash: U256,
        expiration_date: U256,
        weight_grams: U256,
    ) -> U256 {
        let mut count = self.batch_count.get();
        count += U256::from(1u32);
        self.batch_count.set(count);

        self.product_hashes.setter(count).set(product_hash);
        self.expiration_dates.setter(count).set(expiration_date);
        self.weights.setter(count).set(weight_grams);
        self.registered.setter(count).set(U256::from(1u32));

        count
    }

    /// Returns the total number of batches registered.
    pub fn get_batch_count(&self) -> U256 {
        self.batch_count.get()
    }

    /// Returns the expiration date of a batch (unix timestamp).
    pub fn get_expiration(&self, batch_id: U256) -> U256 {
        self.expiration_dates.get(batch_id)
    }

    /// Returns the product hash (keccak256 of product name).
    pub fn get_product_hash(&self, batch_id: U256) -> U256 {
        self.product_hashes.get(batch_id)
    }

    /// Returns the weight in grams.
    pub fn get_weight(&self, batch_id: U256) -> U256 {
        self.weights.get(batch_id)
    }

    /// Check if a batch is registered (returns 1 if yes, 0 if not).
    pub fn is_registered(&self, batch_id: U256) -> U256 {
        self.registered.get(batch_id)
    }
}

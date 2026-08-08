#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::string::String;
use stylus_sdk::{alloy_primitives::U256, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct FreshTrackTrace {
        uint256 batch_count;
        mapping(uint256 => Batch) batches;
    }

    pub struct Batch {
        uint256 id;
        string product_type;
        string origin;
        uint256 expiration_date;
        string creator_name;
        string image_url;
        uint256 timestamp;
    }
}

#[public]
impl FreshTrackTrace {
    pub fn register_batch(
        &mut self,
        product_type: String,
        origin: String,
        expiration_date: U256,
        creator_name: String,
        image_url: String,
    ) -> U256 {
        let mut count = self.batch_count.get();
        count += U256::from(1u8);
        self.batch_count.set(count);

        let mut new_batch = self.batches.setter(count);
        new_batch.id.set(count);
        new_batch.product_type.set_str(&product_type);
        new_batch.origin.set_str(&origin);
        new_batch.expiration_date.set(expiration_date);
        new_batch.creator_name.set_str(&creator_name);
        new_batch.image_url.set_str(&image_url);
        new_batch.timestamp.set(U256::from(0u8));

        count
    }

    pub fn get_batch_count(&self) -> U256 {
        self.batch_count.get()
    }

    pub fn get_batch_product(&self, id: U256) -> String {
        self.batches.get(id).product_type.get_string()
    }

    pub fn get_batch_origin(&self, id: U256) -> String {
        self.batches.get(id).origin.get_string()
    }

    pub fn get_batch_expiration(&self, id: U256) -> U256 {
        self.batches.get(id).expiration_date.get()
    }
}

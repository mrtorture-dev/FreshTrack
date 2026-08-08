#![cfg_attr(not(feature = "export-abi"), no_main)]
extern crate alloc;

use stylus_sdk::{
    alloy_primitives::U256,
    prelude::*,
    msg,
    block,
    evm,
};
use alloc::string::String;

stylus_sdk::alloy_sol_types::sol! {
    event BatchRegistered(
        uint256 indexed batchId,
        string productType,
        string origin,
        uint256 expirationDate,
        string creatorName,
        string imageUrl,
        address producer,
        uint256 timestamp
    );
}

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
        address producer;
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
    ) {
        let mut count = self.batch_count.get();
        count += U256::from(1);
        self.batch_count.set(count);

        let mut new_batch = self.batches.setter(count);
        new_batch.id.set(count);
        new_batch.product_type.set_str(&product_type);
        new_batch.origin.set_str(&origin);
        new_batch.expiration_date.set(expiration_date);
        new_batch.creator_name.set_str(&creator_name);
        new_batch.image_url.set_str(&image_url);
        new_batch.producer.set(msg::sender());
        new_batch.timestamp.set(U256::from(block::timestamp()));

        evm::log(BatchRegistered {
            batchId: count,
            productType: product_type,
            origin,
            expirationDate: expiration_date,
            creatorName: creator_name,
            imageUrl: image_url,
            producer: msg::sender(),
            timestamp: U256::from(block::timestamp()),
        });
    }

    pub fn get_batch_count(&self) -> U256 {
        self.batch_count.get()
    }
}

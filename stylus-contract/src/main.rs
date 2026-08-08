#![cfg_attr(not(feature = "export-abi"), no_main)]

fn main() {
    freshtrack_stylus::print_abi("MIT-OR-Apache-2.0", "pragma solidity ^0.8.23;");
}

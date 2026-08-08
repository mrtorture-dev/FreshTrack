// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FreshTrackTrace {
    enum BatchStatus { Registered, InTransit, Delivered }

    struct Batch {
        uint256 id;
        string productType;
        uint256 quantity;
        uint256 harvestDate;
        uint256 expirationDate; // Key for FEFO
        BatchStatus status;
        address currentOwner;
        string originLocation;
        string creatorName;
        string imageUrl;
    }

    uint256 public batchCount;
    mapping(uint256 => Batch) public batches;

    event BatchRegistered(uint256 indexed id, string productType, uint256 expirationDate, string creatorName, string imageUrl);
    event BatchStatusUpdated(uint256 indexed id, BatchStatus newStatus);

    function registerBatch(
        string memory _productType,
        uint256 _quantity,
        uint256 _expirationDays,
        string memory _originLocation,
        string memory _creatorName,
        string memory _imageUrl
    ) public returns (uint256) {
        batchCount++;
        uint256 _harvestDate = block.timestamp;
        uint256 _expirationDate = block.timestamp + (_expirationDays * 1 days);

        batches[batchCount] = Batch({
            id: batchCount,
            productType: _productType,
            quantity: _quantity,
            harvestDate: _harvestDate,
            expirationDate: _expirationDate,
            status: BatchStatus.Registered,
            currentOwner: msg.sender,
            originLocation: _originLocation,
            creatorName: _creatorName,
            imageUrl: _imageUrl
        });

        emit BatchRegistered(batchCount, _productType, _expirationDate, _creatorName, _imageUrl);
        return batchCount;
    }

    function updateBatchStatus(uint256 _id, BatchStatus _newStatus) public {
        require(_id > 0 && _id <= batchCount, "Batch does not exist");
        batches[_id].status = _newStatus;
        emit BatchStatusUpdated(_id, _newStatus);
    }

    function getBatch(uint256 _id) public view returns (Batch memory) {
        require(_id > 0 && _id <= batchCount, "Batch does not exist");
        return batches[_id];
    }
}

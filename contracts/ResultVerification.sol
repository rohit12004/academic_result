// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ResultVerification {

    // 🔹 Multi-admin support
    mapping(address => bool) public admins;

    constructor() {
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not authorized");
        _;
    }

    // 🔹 Storage
    mapping(string => mapping(uint8 => bytes32)) public resultHashes;

    // 🔹 Events
    event HashStored(string rollNumber, uint8 semester, bytes32 hash);

    // 🔹 Admin management
    function addAdmin(address newAdmin) public onlyAdmin {
        admins[newAdmin] = true;
    }

    function removeAdmin(address adminAddr) public onlyAdmin {
        admins[adminAddr] = false;
    }

    // 🔹 Store hash (Future-Proof: accepts pre-calculated hash)
    function storeResultHash(
        string memory rollNumber,
        uint8 semester,
        bytes32 hash
    ) public onlyAdmin {

        require(bytes(rollNumber).length > 0, "Invalid roll number");
        require(resultHashes[rollNumber][semester] == bytes32(0), "Result already exists");

        resultHashes[rollNumber][semester] = hash;

        emit HashStored(rollNumber, semester, hash);
    }

    // 🔹 Get hash
    function getResultHash(
        string memory rollNumber,
        uint8 semester
    ) public view returns (bytes32) {
        return resultHashes[rollNumber][semester];
    }

    // 🔹 Verify result (Generic Comparison)
    function verifyResult(
        string memory rollNumber,
        uint8 semester,
        bytes32 hash
    ) public view returns (bool) {
        require(resultHashes[rollNumber][semester] != bytes32(0), "No result found");
        return resultHashes[rollNumber][semester] == hash;
    }
}
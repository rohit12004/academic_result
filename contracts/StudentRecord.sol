// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StudentRecord {

    // 🔹 Multi-admin support
    mapping(address => bool) public admins;

    constructor() {
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin allowed");
        _;
    }

    // 🔹 Student structure
    struct Student {
        string name;
        string rollNumber;
        string department;
        bool exists;
    }

    // 🔹 Events
    event StudentRegistered(string rollNumber, string name);

    // 🔹 Storage
    mapping(string => Student) public students;

    // 🔹 Admin management
    function addAdmin(address newAdmin) public onlyAdmin {
        admins[newAdmin] = true;
    }

    function removeAdmin(address adminAddr) public onlyAdmin {
        admins[adminAddr] = false;
    }

    // 🔹 Register student
    function registerStudent(
        string memory name,
        string memory rollNumber,
        string memory department
    ) public onlyAdmin {

        require(bytes(name).length > 0, "Name required");
        require(bytes(rollNumber).length > 0, "Roll number required");
        require(!students[rollNumber].exists, "Student already registered");

        students[rollNumber] = Student({
            name: name,
            rollNumber: rollNumber,
            department: department,
            exists: true
        });

        emit StudentRegistered(rollNumber, name);
    }
}
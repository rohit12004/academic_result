import StudentRecordABI from './contracts/StudentRecord.json';
import ResultVerificationABI from './contracts/ResultVerification.json';

// SEPOLIA TESTNET CONFIGURATION
export const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

export const STUDENT_RECORD_ADDRESS = process.env.NEXT_PUBLIC_STUDENT_RECORD_ADDRESS;
export const RESULT_VERIFICATION_ADDRESS = process.env.NEXT_PUBLIC_RESULT_VERIFICATION_ADDRESS;

console.log("StudentRecord Address:", STUDENT_RECORD_ADDRESS);
console.log("ResultVerification Address:", RESULT_VERIFICATION_ADDRESS);

export const ABIs = {
  StudentRecord: StudentRecordABI,
  ResultVerification: ResultVerificationABI,
};

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "MCA",
];


"use client";

import { useMemo, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { STUDENT_RECORD_ADDRESS, RESULT_VERIFICATION_ADDRESS, ABIs } from '../lib/constants';

export const useContract = (contractType) => {
  const { account, signer } = useWeb3();
  const address = contractType === 'StudentRecord' ? STUDENT_RECORD_ADDRESS : RESULT_VERIFICATION_ADDRESS;
  const abi = ABIs[contractType];

  const contract = useMemo(() => {
    if (!signer || !address || !abi) {
      console.log(`Contract missing deps: signer=${!!signer}, address=${address}, abi=${!!abi}`);
      return null;
    }
    console.log(`Creating contract instance for ${contractType} at ${address}`);
    return new ethers.Contract(address, abi, signer);
  }, [signer, address, abi, contractType]);

  return contract;
};

export const useIsAdmin = () => {
  const { account } = useWeb3();
  const studentRecord = useContract('StudentRecord');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (studentRecord && account) {
        try {
          console.log(`Checking admin status for ${account} on contract ${studentRecord.address || studentRecord.target}`);
          const status = await studentRecord.admins(account);
          console.log(`Admin status result: ${status}`);
          setIsAdmin(status);
        } catch (err) {
          console.error("DEBUG: Admin check failed:", err);
          setIsAdmin(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [studentRecord, account]);

  return { isAdmin, isLoading };
};

import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(req) {
  try {
    const data = await req.json();
    const { rollNumber, semester, examSession, sgpa, resultStatus } = data;

    // Calculate cryptographic hash (matching Solidity keccak256(abi.encodePacked(...)))
    const hash = ethers.utils.solidityKeccak256(
      ['string', 'uint8', 'string', 'uint16', 'string'],
      [rollNumber, parseInt(semester), examSession, parseInt(sgpa), resultStatus]
    );

    // Save to Supabase
    const { data: dbData, error } = await supabase
      .from('results')
      .upsert({
        roll_number: rollNumber,
        semester: parseInt(semester),
        exam_session: examSession,
        sgpa: parseInt(sgpa),
        result_status: resultStatus,
        blockchain_hash: hash,
        created_at: new Date().toISOString()
      }, { onConflict: 'roll_number,semester' })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, hash, data: dbData[0] });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rollNumber = searchParams.get('roll');

    if (!rollNumber) {
      return NextResponse.json({ success: false, error: "Roll number required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('roll_number', rollNumber)
      .order('semester', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, results: data });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    const { error, count } = await supabase
      .from('results')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ 
      success: true, 
      message: count > 0 ? "Record rolled back" : "No record found to rollback",
      deletedCount: count 
    });
  } catch (error) {
    console.error("API Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

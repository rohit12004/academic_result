import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const generateMarksheetPDF = async (studentInfo, result) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Create a template div
  const element = document.createElement('div');
  element.style.width = '800px';
  element.style.padding = '60px';
  element.style.background = '#ffffff';
  element.style.color = '#1e293b';
  element.style.fontFamily = "'Lexend Deca', sans-serif";
  element.style.lineHeight = '1.6';
  
  element.innerHTML = `
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px;">
      <img src="/famt_logo.png" style="height: 80px; margin-bottom: 15px; filter: grayscale(10%) brightness(1.1);" alt="FAMT LOGO" />
      <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2;">
        Finolex Academy of Management and Technology, Ratnagiri
      </h1>
      <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px; color: #64748b; font-weight: 700; margin-top: 10px;">
        Official Academic Transcript
      </p>
    </div>

    <!-- Student Info -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; background: #f8fafc; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;">
      <div>
        <label style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Student Name</label>
        <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${studentInfo.name}</div>
      </div>
      <div>
        <label style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Roll Number</label>
        <div style="font-size: 16px; font-weight: 700; color: #0f172a; font-family: monospace;">${studentInfo.roll}</div>
      </div>
      <div style="grid-column: span 2;">
        <label style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Department</label>
        <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${studentInfo.dept || 'Engineering & Technology'}</div>
      </div>
    </div>

    <!-- Result Data -->
    <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 40px;">
      <div style="background: #0f172a; color: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 800; font-size: 14px; text-transform: uppercase;">Examination Performance</span>
        <span style="font-size: 12px; font-weight: 600;">Semester ${result.semester}</span>
      </div>
      <div style="padding: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;">
        <div style="text-align: center; border-right: 1px solid #f1f5f9;">
          <div style="font-size: 48px; font-weight: 900; color: #0ea5e9;">${result.sgpa}</div>
          <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Final SGPA</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: 800; color: ${result.status === 'Pass' ? '#10b981' : '#ef4444'};">
            ${result.status.toUpperCase()}
          </div>
          <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Result Status</div>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 15px 25px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; font-weight: 600;">
        Exam Session: ${result.session}
      </div>
    </div>

    <!-- Blockchain Verification -->
    <div style="padding: 25px; border: 1px dashed #e2e8f0; border-radius: 12px; background: #fdfdfd; position: relative; overflow: hidden;">
      <div style="position: absolute; right: -20px; bottom: -10px; opacity: 0.05;">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <label style="font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 10px;">
        Blockchain Verification Signature (Security Anchor)
      </label>
      <div style="font-family: monospace; font-size: 10px; color: #0ea5e9; word-break: break-all; line-height: 1.4; max-width: 90%;">
        ${result.blockchainHash}
      </div>
      <div style="margin-top: 20px; display: flex; align-items: center; gap: 10px;">
        <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%;"></div>
        <span style="font-size: 10px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">Tamper-Proof & Verified on Ethereum Sepolia</span>
      </div>
    </div>

    <!-- Bottom Institutional Footer -->
    <div style="margin-top: 60px; text-align: center;">
      <p style="font-size: 9px; color: #94a3b8; line-height: 1.5;">
        This transcript is cryptographically secured. Verify authenticity online at your-dapp-url.com<br/>
        © ${new Date().getFullYear()} Finolex Academy of Management and Technology. All Rights Reserved.
      </p>
    </div>
  `;
  
  document.body.appendChild(element);
  
  // Use html2canvas with better resolution
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 3, // Higher scale for print quality
    useCORS: true,
    logging: false
  });
  
  const imgData = canvas.toDataURL('image/png');
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  document.body.removeChild(element);
  
  doc.save(`${studentInfo.roll}_Sem_${result.semester}_Transcript.pdf`);
};

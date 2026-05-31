import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";

const ImportView = ({ accounts, onImportTransactions }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [successCount, setSuccessCount] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Sync selectedAccountId with accounts list when it is populated
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!selectedAccountId) {
      alert("Silakan pilih rekening tujuan terlebih dahulu sebelum menarik file.");
      return;
    }
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDropzoneClick = () => {
    if (!selectedAccountId) {
      alert("Silakan pilih rekening tujuan terlebih dahulu sebelum memilih file.");
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = async (files) => {
    setSuccessCount(null);
    let importedList = [];
    let errorCount = 0;

    for (const file of files) {
      try {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          const text = await extractTextFromPdf(arrayBuffer);
          const parsedTransactions = parseBcaPdfText(text);
          if (parsedTransactions.length > 0) {
             parsedTransactions.forEach((t, idx) => {
               importedList.push({
                 id: `imported-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
                 title: t.title,
                 amount: t.amount,
                 type: t.type,
                 category: t.type === 'income' ? 'Income' : t.category,
                 accountId: selectedAccountId,
                 date: t.date
               });
             });
          } else {
             errorCount++;
          }
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          const text = await file.text();
          const lines = text.trim().split('\n');
          lines.forEach((line, idx) => {
            const parts = line.split(',');
            if (parts.length >= 4) {
              const date = parts[0]?.trim();
              const title = parts[1]?.trim();
              const amount = Number(parts[2]?.trim());
              const type = parts[3]?.trim().toLowerCase();
              const category = parts[4]?.trim() || 'Lain-lain';

              const isValidDate = !isNaN(Date.parse(date));
              const isValidAmount = !isNaN(amount) && amount > 0;
              const isValidType = type === 'income' || type === 'expense';

              if (isValidDate && title && isValidAmount && isValidType) {
                importedList.push({
                  id: `imported-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
                  title,
                  amount,
                  type,
                  category: type === 'income' ? 'Income' : category,
                  accountId: selectedAccountId,
                  date
                });
              } else {
                errorCount++;
              }
            } else {
              errorCount++;
            }
          });
        } else {
          errorCount++;
        }
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
        errorCount++;
      }
    }

    if (importedList.length > 0) {
      onImportTransactions(importedList);
      setSuccessCount(importedList.length);
      setTimeout(() => setSuccessCount(null), 5000);
    } else {
      alert('Gagal mendeteksi transaksi dari file yang diberikan. Pastikan file berformat CSV atau PDF mutasi BCA yang benar.');
    }
    
    // Clear input so same files can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="new-import-view" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="new-import-header">
        <h1>Import</h1>
        <p>Bulk import transactions from a file</p>
      </div>

      <div className="new-import-card">
        <div className="new-import-icon-box">
          <Upload size={28} />
        </div>
        <h2 className="new-import-title">CSV / PDF Import</h2>
        <p className="new-import-subtitle">
          Import transactions from a CSV file or Bank BCA statement PDF.
        </p>

        <div 
          className={`new-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDrop={handleDrop}
          onClick={handleDropzoneClick}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".csv,.pdf" 
            multiple
            style={{ display: 'none' }} 
          />
          <FileSpreadsheet size={32} className="new-dropzone-icon" />
          <p className="new-dropzone-text">Drop your CSV or PDF file here</p>
          <p className="new-dropzone-subtext">or click to browse</p>
        </div>

        <div style={{ textAlign: 'left', marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Destination Account</label>
            {accounts.length === 0 ? (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                ⚠️ Tambahkan rekening aktif di tab Accounts terlebih dahulu.
              </div>
            ) : (
              <select
                className="new-form-control"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                style={{ cursor: 'pointer', backgroundColor: '#f8fafc', fontWeight: 600, color: 'var(--color-primary)' }}
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                ))}
              </select>
            )}
          </div>
          
          {successCount !== null && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '0.5rem', color: '#059669', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
              <CheckCircle size={20} /> Successfully imported {successCount} transactions directly to your account!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportView;

// Helper: Dynamically loads PDF.js CDN inside the client-side document
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjs = window.pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjs);
    };
    script.onerror = () => reject(new Error('Gagal memuat PDF parser engine dari CDN'));
    document.head.appendChild(script);
  });
};

// Helper: Extracts plain text characters from all pages in the PDF ArrayBuffer
const extractTextFromPdf = async (arrayBuffer) => {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
};

// Helper: Parses plain text tokens specifically structured as a Bank BCA Tahapan Statement
const parseNumber = (str) => {
  if (!str) return 0;
  const cleanStr = str.replace(/,/g, '');
  return Number(cleanStr);
};

const parseBcaPdfText = (text) => {
  let year = new Date().getFullYear();
  let monthStr = '04'; // Default starting month index matching sample
  
  // Scans header text for statement period (e.g., "PERIODE : APRIL 2026")
  const periodMatch = text.match(/(?:PERIODE|MUTASI)\s*:\s*([A-Za-z]+)\s+(\d{4})/i) || text.match(/([A-Z]+)\s+(\d{4})/);
  if (periodMatch) {
    const monthsMap = {
      januari: '01', jan: '01',
      februari: '02', pebruari: '02', feb: '02',
      maret: '03', mar: '03',
      april: '04', apr: '04',
      mei: '05', may: '05',
      juni: '06', jun: '06',
      juli: '07', jul: '07',
      agustus: '08', ags: '08', aug: '08',
      september: '09', sep: '09',
      oktober: '10', okt: '10', oct: '10',
      november: '11', nov: '11',
      desember: '12', des: '12', dec: '12'
    };
    const parsedMonthName = periodMatch[1].toLowerCase();
    const parsedYear = periodMatch[2];
    if (monthsMap[parsedMonthName]) {
      monthStr = monthsMap[parsedMonthName];
      year = parsedYear;
    }
  }

  // Remove the summary footer at the end of the statement so it doesn't break the last transaction block
  const summaryIndex = text.lastIndexOf('SALDO AWAL   :');
  if (summaryIndex !== -1) {
    text = text.substring(0, summaryIndex);
  }

  const transactionsList = [];
  const dateRegex = /(?:^|\s)(\d{2})\/(\d{2})\s{2,}/g;
  let match;
  const matches = [];

  while ((match = dateRegex.exec(text)) !== null) {
    const context = text.slice(match.index, match.index + 150);
    // Ignore pagination indicators "1 / 3" or similar
    if (context.includes('HALAMAN') || /^\d\s*\/\s*\d\s*$/.test(match[0])) {
      continue;
    }
    matches.push({
      dateStr: match[0].trim(),
      day: match[1],
      month: match[2],
      index: match.index
    });
  }

  // Segment text and scan each date-bounded text block
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = matches[i + 1] ? matches[i + 1].index : text.length;
    const block = text.slice(current.index, nextIndex);
    
    if (block.includes('SALDO AWAL')) {
      continue;
    }

    const numMatches = [...block.matchAll(/(\d{1,3}(?:,?\d{3})*\.\d{2})/g)];
    if (numMatches.length === 0) continue;

    let amount = 0;
    let type = 'income';

    // Scan for debit amounts which end with "DB" indicator in BCA Tahapan
    const dbMatch = block.match(/(\d{1,3}(?:,?\d{3})*\.\d{2})\s*DB/);
    if (dbMatch) {
      amount = parseNumber(dbMatch[1]);
      type = 'expense';
    } else {
      // For credit amounts, parse first valid money formatting block in segment
      if (numMatches.length > 0) {
        amount = parseNumber(numMatches[0][1]);
        type = 'income';
      }
    }

    if (amount <= 0) continue;

    // Filter and clean descriptions to derive a readable transaction title
    let title = block
      .replace(current.dateStr, '')
      .replace(/\d[\d.,]*\d\s*DB/g, '')
      .replace(/\d[\d.,]*\d/g, '')
      .replace(/CBG/g, '')
      .replace(/MUTASI/g, '')
      .replace(/SALDO/g, '')
      .replace(/TGL:/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (title.length > 55) {
      title = title.substring(0, 52) + '...';
    }
    if (!title) {
      title = type === 'income' ? 'Pemasukan Rekening' : 'Pengeluaran Rekening';
    }

    // Heuristic categorization based on transaction keywords
    let category = 'Lain-lain';
    if (type === 'income') {
      category = 'Income';
    } else {
      const tLower = title.toLowerCase();
      if (tLower.includes('makan') || tLower.includes('minum') || tLower.includes('kuliner') || tLower.includes('kopi') || tLower.includes('warung') || tLower.includes('bakso') || tLower.includes('geprek') || tLower.includes('nongky')) {
        category = 'makan & minum';
      } else if (tLower.includes('belanja') || tLower.includes('toko') || tLower.includes('supermarket') || tLower.includes('mall') || tLower.includes('kaos') || tLower.includes('sepatu') || tLower.includes('blazestore')) {
        category = 'belanja';
      } else if (tLower.includes('pulsa') || tLower.includes('kuota') || tLower.includes('internet') || tLower.includes('wifi') || tLower.includes('telkomse')) {
        category = 'internet';
      } else if (tLower.includes('listrik') || tLower.includes('rumah') || tLower.includes('air')) {
        category = 'rumah';
      } else if (tLower.includes('bensin') || tLower.includes('ojek') || tLower.includes('transportasi') || tLower.includes('pertamax')) {
        category = 'transportasi';
      } else if (tLower.includes('game') || tLower.includes('nonton') || tLower.includes('bioskop') || tLower.includes('hobi') || tLower.includes('entertaiment') || tLower.includes('tata main')) {
        category = 'Hobby / entertaiment';
      } else if (tLower.includes('adm') || tLower.includes('biaya adm') || tLower.includes('admin')) {
        category = 'kartu kredit';
      }
    }

    const transactionDate = `${year}-${monthStr}-${current.day}`;

    transactionsList.push({
      date: transactionDate,
      title,
      amount,
      type,
      category
    });
  }

  return transactionsList;
};



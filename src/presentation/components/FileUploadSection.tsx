'use client';

import { useState, useRef, useCallback } from 'react';
import { useGooglePicker } from '@/presentation/hooks/useGooglePicker';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  source: 'local' | 'gdrive';
  url?: string;
  content?: string;
  pdfBase64?: string;
}

export function FileUploadSection() {
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');
  const [driveFileName, setDriveFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGoogleDrivePicked = useCallback(async (doc: { id: string; name: string; url: string; mimeType?: string; accessToken?: string }) => {
    setIsUploading(true);
    let uploadedUrl = doc.url;
    let extractedContent: string | undefined;
    let extractedPdfBase64: string | undefined;

    if (doc.accessToken && doc.id) {
      try {
        let blobToUpload: Blob | null = null;
        let fileNameToUpload = doc.name;
        let mimeTypeToUpload = doc.mimeType || 'application/octet-stream';

        // 1. Google Docs (text/plain export)
        if (doc.mimeType === 'application/vnd.google-apps.document') {
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}/export?mimeType=text/plain`, {
            headers: { Authorization: `Bearer ${doc.accessToken}` },
          });
          if (res.ok) {
            extractedContent = await res.text();
            blobToUpload = new Blob([extractedContent], { type: 'text/plain;charset=utf-8' });
            if (!fileNameToUpload.endsWith('.txt')) fileNameToUpload += '.txt';
            mimeTypeToUpload = 'text/plain';
          }
        }
        // 2. Google Sheets (text/csv export)
        else if (doc.mimeType === 'application/vnd.google-apps.spreadsheet') {
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}/export?mimeType=text/csv`, {
            headers: { Authorization: `Bearer ${doc.accessToken}` },
          });
          if (res.ok) {
            extractedContent = await res.text();
            blobToUpload = new Blob([extractedContent], { type: 'text/csv;charset=utf-8' });
            if (!fileNameToUpload.endsWith('.csv')) fileNameToUpload += '.csv';
            mimeTypeToUpload = 'text/csv';
          }
        }
        // 3. PDF 또는 일반 바이너리 파일
        else {
          const res = await fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`, {
            headers: { Authorization: `Bearer ${doc.accessToken}` },
          });
          if (res.ok) {
            blobToUpload = await res.blob();
            const isPdf = doc.mimeType === 'application/pdf' || doc.name.toLowerCase().endsWith('.pdf');
            if (isPdf) {
              const arrayBuffer = await blobToUpload.arrayBuffer();
              const bytes = new Uint8Array(arrayBuffer);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              extractedPdfBase64 = btoa(binary);
            } else {
              const textStr = await blobToUpload.text();
              if (!textStr.includes('<!DOCTYPE html>')) {
                extractedContent = textStr;
              }
            }
          }
        }

        // Supabase 스토리지 버킷에 이관 업로드
        if (blobToUpload) {
          const fileToUpload = new File([blobToUpload], fileNameToUpload, { type: mimeTypeToUpload });
          const uploadFormData = new FormData();
          uploadFormData.append('file', fileToUpload);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success && uploadData.url) {
            uploadedUrl = uploadData.url;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch and upload Google Drive file to Supabase storage:', err);
      } finally {
        setIsUploading(false);
      }
    }

    const newFile: AttachedFile = {
      id: `gdrive-${Date.now()}-${Math.random()}`,
      name: doc.name,
      size: 1024 * 50,
      type: doc.mimeType || 'gdrive',
      source: 'gdrive',
      url: uploadedUrl,
      content: extractedContent,
      pdfBase64: extractedPdfBase64,
    };
    setFiles((prev) => [...prev, newFile]);
  }, []);

  const { openPicker, hasCredentials } = useGooglePicker(handleGoogleDrivePicked);

  const handleDriveButtonClick = () => {
    const pickerOpened = openPicker();
    if (!pickerOpened) {
      setIsDriveModalOpen(true);
    }
  };

  const sampleDriveDocs = [
    { name: '[Google Drive] 2026_1분기_프로젝트_기획서.gdoc', url: 'https://docs.google.com/document/d/1sample1/edit' },
    { name: '[Google Drive] 시스템_아키텍처_설계서.pdf', url: 'https://drive.google.com/file/d/1sample2/view' },
    { name: '[Google Drive] 사용자_설문조사_결과.gsheet', url: 'https://docs.google.com/spreadsheets/d/1sample3/edit' },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const selectedFiles = Array.from(e.target.files);
    const uploadedList: AttachedFile[] = [];

    for (const file of selectedFiles) {
      try {
        let content: string | undefined;
        let pdfBase64: string | undefined;

        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            pdfBase64 = btoa(binary);
          } catch {}
        } else if (
          file.type.includes('text') ||
          file.name.endsWith('.txt') ||
          file.name.endsWith('.csv') ||
          file.name.endsWith('.json') ||
          file.name.endsWith('.md')
        ) {
          try {
            content = await file.text();
          } catch {}
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          uploadedList.push({
            id: `file-${Date.now()}-${Math.random()}`,
            name: data.name || file.name,
            size: data.size || file.size,
            type: data.type || file.type || 'document',
            source: 'local',
            url: data.url,
            content,
            pdfBase64,
          });
        } else {
          // Fallback if upload fails
          uploadedList.push({
            id: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type || 'document',
            source: 'local',
            content,
            pdfBase64,
          });
        }
      } catch {
        uploadedList.push({
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type || 'document',
          source: 'local',
        });
      }
    }

    setFiles((prev) => [...prev, ...uploadedList]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddDriveFile = (name: string, url: string) => {
    if (!name || !url) return;
    const newFile: AttachedFile = {
      id: `gdrive-${Date.now()}-${Math.random()}`,
      name: name.trim(),
      size: 1024 * 50, // default display size
      type: 'gdrive',
      source: 'gdrive',
      url: url.trim(),
    };
    setFiles((prev) => [...prev, newFile]);
    setDriveUrl('');
    setDriveFileName('');
    setIsDriveModalOpen(false);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white border border-[#c5c6cd]/40 rounded-2xl p-5 shadow-sm space-y-3">
      {/* Hidden Form Field for Form Submission */}
      <input type="hidden" name="attachedFilesJson" value={JSON.stringify(files)} />

      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-[#4648d4]">attach_file</span>
          <span>파일 첨부 (선택사항)</span>
        </label>
        <span className="text-[11px] text-[#45474c]">PDF, TXT, DOCX 및 구글 드라이브 파일 가능</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.docx,.csv,.doc"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Dropzone / Action Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-5 border-2 border-dashed border-[#c5c6cd]/70 hover:border-[#4648d4] rounded-xl text-center space-y-2 bg-[#f8f9ff] hover:bg-[#eff4ff] transition-all cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[#4648d4] text-xl">cloud_upload</span>
        </div>
        {isUploading ? (
          <div className="flex items-center justify-center gap-2 text-xs text-[#4648d4] font-medium py-2">
            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            <span>Supabase 스토리지 버킷으로 파일 업로드 중...</span>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-[#0b1c30]">
              클릭하여 로컬 파일 업로드 또는 드래그 & 드롭
            </p>
            <p className="text-[11px] text-[#45474c] mt-0.5">
              문서가 Supabase 스토리지 버킷에 저장되며 프롬프트 실행 시 자동 반영됩니다
            </p>
          </div>
        )}

        <div className="pt-2 flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-white border border-[#c5c6cd] hover:border-[#4648d4] text-[#0b1c30] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm text-blue-600">folder</span>
            <span>내 PC에서 파일 선택</span>
          </button>

          <button
            type="button"
            onClick={handleDriveButtonClick}
            className="px-3 py-1.5 bg-white border border-[#c5c6cd] hover:border-[#4648d4] text-[#0b1c30] rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm text-green-600">add_to_drive</span>
            <span>구글 드라이브 연결</span>
          </button>
        </div>
      </div>

      {/* Attached Files List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-[#0b1c30]">첨부된 파일 ({files.length}개)</span>
          <div className="space-y-1.5">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-[#f8f9ff] border border-[#c5c6cd]/50 rounded-xl px-3.5 py-2 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`material-symbols-outlined text-sm shrink-0 ${file.source === 'gdrive' ? 'text-green-600' : 'text-[#4648d4]'}`}>
                    {file.source === 'gdrive' ? 'add_to_drive' : 'description'}
                  </span>
                  <span className="font-medium text-[#0b1c30] truncate">{file.name}</span>
                  {file.source === 'gdrive' ? (
                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded shrink-0 font-medium">
                      Google Drive
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#45474c] shrink-0">({formatFileSize(file.size)})</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-1 text-[#45474c] hover:text-red-600 rounded-md transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Drive Connection Modal */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 border border-[#c5c6cd]/40">
            <div className="flex justify-between items-center pb-2 border-b border-[#c5c6cd]/30">
              <div className="flex items-center gap-2 text-[#0b1c30]">
                <span className="material-symbols-outlined text-green-600 text-xl">add_to_drive</span>
                <h3 className="font-bold text-base">구글 드라이브 파일 연결</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="text-[#45474c] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-[#45474c]">
              구글 드라이브 문서의 공유 링크(URL)를 입력하거나 샘플 문서를 선택하여 연동할 수 있습니다.
            </p>

            {/* Direct Link Form */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0b1c30]">문서 제목</label>
                <input
                  type="text"
                  placeholder="예: 2026 마케팅 전략 기획서"
                  value={driveFileName}
                  onChange={(e) => setDriveFileName(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#0b1c30]">구글 드라이브 공유 URL</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full bg-[#f8f9ff] border border-[#c5c6cd] rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#4648d4]"
                />
              </div>

              <button
                type="button"
                disabled={!driveFileName || !driveUrl}
                onClick={() => handleAddDriveFile(driveFileName, driveUrl)}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">link</span>
                <span>입력한 드라이브 파일 추가</span>
              </button>
            </div>

            {/* Quick Sample Select */}
            <div className="pt-2 border-t border-[#c5c6cd]/30 space-y-2">
              <span className="text-[11px] font-semibold text-[#45474c]">빠른 샘플 선택:</span>
              <div className="space-y-1.5">
                {sampleDriveDocs.map((doc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddDriveFile(doc.name, doc.url)}
                    className="w-full text-left p-2 rounded-lg bg-[#f8f9ff] hover:bg-green-50 border border-[#c5c6cd]/30 text-xs font-medium text-[#0b1c30] transition-colors truncate flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm text-green-600 shrink-0">add_to_drive</span>
                    <span className="truncate">{doc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


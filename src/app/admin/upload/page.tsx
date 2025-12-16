// src/app/admin/upload/page.tsx
'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import AnimatedPageWrapper from '@/components/AnimatedPageWrapper'
import FadeInWhenVisible from '@/components/FadeInWhenVisible'
// LoginModal and Header are not used in this admin page structure
// import LoginModal from '@/components/LoginModal';
// import Header from '@/components/Header'; 
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpTrayIcon, 
  PhotoIcon,       
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  // XCircleIcon, // Was not used in PlaceholderAdminUploadPanel logic
} from '@heroicons/react/24/outline'

// Placeholder for your actual AdminUploadPanel component's functionality
const PlaceholderAdminUploadPanel = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string, type: string}[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({text: "Пожалуйста, выберите файл для загрузки.", type: 'error'});
      return;
    }
    setUploading(true);
    setMessage(null);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newFile = {
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile), // Temporary URL for preview
        type: selectedFile.type.startsWith('image/') ? 'image' : 'document'
    };
    setUploadedFiles(prev => [newFile, ...prev]);

    setMessage({text: `Файл "${selectedFile.name}" успешно загружен.`, type: 'success'});
    setSelectedFile(null);
    if (document.getElementById('fileUploadInput')) {
        (document.getElementById('fileUploadInput') as HTMLInputElement).value = "";
    }
    setUploading(false);
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Загрузить новый файл</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="fileUploadInput" className="block text-sm font-medium text-neutral-300 mb-1.5">
              Выберите файл
            </label>
            <input
              type="file"
              id="fileUploadInput"
              onChange={handleFileChange}
              className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2.5 file:px-4
                         file:rounded-lg file:border-0 file:text-sm file:font-semibold
                         file:bg-[#d4af37]/20 file:text-[#d4af37] hover:file:bg-[#d4af37]/30
                         focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37]
                         border border-neutral-600 rounded-lg cursor-pointer bg-neutral-800 p-1"
            />
          </div>
          {selectedFile && (
            <div className="text-xs text-neutral-400">
              Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
          {message && (
            <div className={`flex items-center gap-2 p-2.5 rounded-md text-xs
                ${message.type === 'success' ? 'bg-green-900/30 border border-green-700/50 text-green-300' : ''}
                ${message.type === 'error' ? 'bg-red-900/30 border border-red-700/50 text-red-300' : ''}
            `}>
                {message.type === 'success' && <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />}
                {message.type === 'error' && <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />}
                <span>{message.text}</span>
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#d4af37] text-black rounded-lg text-sm font-semibold 
                       hover:bg-[#c0982c] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50
                       disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 ease-in-out
                       flex items-center justify-center gap-2 group"
          >
            {uploading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                Загрузить
              </>
            )}
          </button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Загруженные файлы</h3>
            <ul className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800">
                {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-neutral-900/70 rounded-md border border-neutral-600/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            {file.type === 'image' ? <PhotoIcon className="h-5 w-5 text-[#d4af37] flex-shrink-0"/> : <DocumentTextIcon className="h-5 w-5 text-neutral-400 flex-shrink-0"/>}
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-200 hover:text-[#d4af37] truncate" title={file.name}>
                                {file.name}
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};


export default function AdminUploadPage() {
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  // showLoginModal and setShowLoginModal were removed as they are not used by the admin-specific header
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('topcar-user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          setAdminUser(user)
        } else {
          router.push('/')
        }
      } catch (e) {
        console.error("Auth error:", e);
        router.push('/')
      }
    } else {
      router.push('/')
    }
    setIsLoadingAuth(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('topcar-user');
    setAdminUser(null);
    router.push('/login'); 
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <ArrowPathIcon className="h-12 w-12 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-8">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Доступ запрещен</h1>
            <p className="text-neutral-400 mb-6 text-center">У вас нет прав для доступа к этой странице.</p>
            <Link href="/" className="px-6 py-2 bg-[#d4af37] text-black rounded-md font-medium hover:bg-[#c0982c] transition-colors">
                На главную
            </Link>
        </div>
    );
  }

  const AdminPageHeader = () => (
    <header className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-700/80 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Cog6ToothIcon className="h-7 w-7 text-[#d4af37] mr-2"/>
            <h1 className="text-xl font-bold text-white">TopCar Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            title="Выйти"
            className="flex items-center text-sm text-neutral-400 hover:text-[#d4af37] transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
            Выйти
          </button>
        </div>
      </div>
    </header>
  );

  return (
    <AnimatedPageWrapper>
      <div className="min-h-screen bg-neutral-950 text-white font-sans">
        <AdminPageHeader /> 
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <FadeInWhenVisible className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3">
                <ArrowUpTrayIcon className="h-10 w-10 text-[#d4af37]" />
                <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                        Управление <span className="text-[#d4af37]">Файлами</span>
                    </h2>
                    <p className="mt-1 text-sm text-neutral-400">Загрузка и управление медиа-ресурсами сайта.</p>
                </div>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible>
              <PlaceholderAdminUploadPanel /> 
            </FadeInWhenVisible>
            
          </div>
        </main>
      </div>
    </AnimatedPageWrapper>
  )
}

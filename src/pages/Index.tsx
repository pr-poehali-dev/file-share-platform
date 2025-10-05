import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import FileCard from '@/components/FileCard';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FileData {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  expiresAt: string;
  downloadUrl: string;
}

export default function Index() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeTab, setActiveTab] = useState('upload');

  const loadFiles = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/a2610e08-8396-4705-80fe-2930ea9d383e');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUploadComplete = () => {
    loadFiles();
    setActiveTab('files');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-3">
              <Icon name="Cloud" size={32} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FILE SHARE
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Быстрый и безопасный обмен файлами
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upload" className="gap-2">
              <Icon name="Upload" size={16} />
              Загрузить
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Icon name="Files" size={16} />
              Мои файлы
              {files.length > 0 && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                  {files.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="home" className="gap-2">
              <Icon name="Home" size={16} />
              Главная
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="animate-fade-in">
            <FileUpload onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="files" className="animate-fade-in">
            {files.length === 0 ? (
              <div className="text-center py-16">
                <div className="rounded-full bg-muted p-6 inline-block mb-4">
                  <Icon name="FolderOpen" size={48} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Нет загруженных файлов</h3>
                <p className="text-muted-foreground mb-6">
                  Загрузите первый файл, чтобы начать
                </p>
                <Button onClick={() => setActiveTab('upload')}>
                  <Icon name="Upload" size={16} className="mr-2" />
                  Загрузить файл
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {files.map((file) => (
                  <FileCard key={file.id} {...file} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="home" className="animate-fade-in">
            <div className="space-y-8">
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold mb-4">Как это работает?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Просто загрузите файл, получите уникальную ссылку и поделитесь с кем угодно
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-4 inline-block mb-4">
                    <Icon name="Upload" size={32} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">1. Загрузите</h3>
                  <p className="text-sm text-muted-foreground">
                    Перетащите файл или выберите его на устройстве
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-4 inline-block mb-4">
                    <Icon name="Link" size={32} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">2. Поделитесь</h3>
                  <p className="text-sm text-muted-foreground">
                    Скопируйте уникальную ссылку на файл
                  </p>
                </div>

                <div className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-4 inline-block mb-4">
                    <Icon name="Download" size={32} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">3. Скачайте</h3>
                  <p className="text-sm text-muted-foreground">
                    Получатель может скачать файл по ссылке
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-8 text-center">
                <Icon name="Clock" size={40} className="text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Автоматическое удаление</h3>
                <p className="text-muted-foreground">
                  Файлы автоматически удаляются через 24 часа для безопасности
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
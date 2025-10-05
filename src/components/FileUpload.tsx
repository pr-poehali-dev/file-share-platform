import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete: () => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://functions.poehali.dev/c7ef9785-fda5-43d8-9c1b-7fe34ad74bf2', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      toast({
        title: 'Файл загружен!',
        description: `${file.name} успешно загружен`,
      });

      onUploadComplete();
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить файл',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ${
        isDragging ? 'border-primary border-2 bg-primary/5' : 'border-border'
      }`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="p-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className={`rounded-full bg-gradient-to-br from-primary to-accent p-6 transition-transform ${isDragging ? 'scale-110' : 'scale-100'}`}>
            <Icon name="Upload" size={48} className="text-white" />
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-2">Загрузите файл</h3>
        <p className="text-muted-foreground mb-6">
          Перетащите файл сюда или нажмите кнопку
        </p>

        <input
          type="file"
          id="file-input"
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
        />

        <Button
          size="lg"
          disabled={uploading}
          onClick={() => document.getElementById('file-input')?.click()}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          {uploading ? (
            <>
              <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <Icon name="FolderUp" size={20} className="mr-2" />
              Выбрать файл
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Максимальный размер файла: 100 МБ
        </p>
      </div>
    </Card>
  );
}
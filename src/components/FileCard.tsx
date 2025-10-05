import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface FileCardProps {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  expiresAt: string;
  downloadUrl: string;
}

export default function FileCard({ id, name, size, uploadedAt, expiresAt, downloadUrl }: FileCardProps) {
  const { toast } = useToast();

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Истёк';
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const copyLink = () => {
    const fullUrl = `https://functions.poehali.dev/d02e8975-85c1-472e-a6f9-441d3411a26d/${id}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: 'Ссылка скопирована!',
      description: 'Поделитесь ссылкой с другими',
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'Image';
    if (['pdf'].includes(ext || '')) return 'FileText';
    if (['zip', 'rar', '7z'].includes(ext || '')) return 'Archive';
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return 'Video';
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return 'Music';
    return 'File';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-3">
              <Icon name={getFileIcon(name)} size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate mb-1">{name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatSize(size)}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="ml-2">
            <Icon name="Clock" size={12} className="mr-1" />
            {formatTime(expiresAt)}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => window.open(`https://functions.poehali.dev/d02e8975-85c1-472e-a6f9-441d3411a26d/${id}`, '_blank')}
          >
            <Icon name="Download" size={16} className="mr-2" />
            Скачать
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={copyLink}
          >
            <Icon name="Link" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
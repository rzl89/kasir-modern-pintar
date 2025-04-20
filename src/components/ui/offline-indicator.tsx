
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { AlertCircle, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function OfflineIndicator() {
  const { isOnline, pendingTransactions, syncTransactions } = useOfflineStatus();
  const { toast } = useToast();
  
  const handleSync = async () => {
    if (!isOnline) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada koneksi internet',
        description: 'Silakan coba kembali ketika terhubung ke internet.',
      });
      return;
    }
    
    toast({
      title: 'Menyinkronkan transaksi...',
      description: 'Mohon tunggu sebentar.',
    });
    
    const success = await syncTransactions();
    
    if (success) {
      toast({
        title: 'Sinkronisasi selesai',
        description: 'Semua transaksi berhasil disinkronkan.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Sinkronisasi gagal',
        description: 'Beberapa transaksi gagal disinkronkan. Silakan coba lagi nanti.',
      });
    }
  };
  
  // If online and no pending transactions, don't show anything
  if (isOnline && pendingTransactions === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant={isOnline ? "default" : "destructive"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
            <AlertDescription>
              {!isOnline 
                ? "Mode Offline: Transaksi akan disimpan lokal" 
                : `${pendingTransactions} transaksi menunggu sinkronisasi`}
            </AlertDescription>
          </div>
          
          {isOnline && pendingTransactions > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 h-8"
              onClick={handleSync}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sinkronkan
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}

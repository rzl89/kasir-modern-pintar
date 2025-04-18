
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Save } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Store settings
  const [storeName, setStoreName] = useState('Kasir Pintar');
  const [storeAddress, setStoreAddress] = useState('Jl. Pahlawan No. 123, Jakarta');
  const [storePhone, setStorePhone] = useState('021-1234567');
  
  // Tax settings
  const [enableTax, setEnableTax] = useState(true);
  const [taxPercentage, setTaxPercentage] = useState(10);
  
  // Receipt settings
  const [showLogo, setShowLogo] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [footerText, setFooterText] = useState('Terima kasih atas kunjungan Anda!');
  const [termsText, setTermsText] = useState('Barang yang sudah dibeli tidak dapat dikembalikan.');
  
  const saveSettings = async (section: string) => {
    setLoading(true);
    
    try {
      let settingsData = {};
      
      switch (section) {
        case 'store':
          settingsData = {
            store_name: storeName,
            store_address: storeAddress,
            store_phone: storePhone,
          };
          break;
        case 'tax':
          settingsData = {
            enable_tax: enableTax,
            tax_percentage: taxPercentage,
          };
          break;
        case 'receipt':
          settingsData = {
            show_logo: showLogo,
            show_footer: showFooter,
            footer_text: footerText,
            terms_text: termsText,
          };
          break;
      }
      
      // In a real application, save to the database
      // const { error } = await supabase.from('settings').upsert({
      //   id: 'global',
      //   ...settingsData,
      //   updated_at: new Date().toISOString(),
      // });
      
      // if (error) throw error;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: 'Sukses',
        description: 'Pengaturan berhasil disimpan',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menyimpan pengaturan',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pengaturan</h1>
      </div>
      
      <Tabs defaultValue="store">
        <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="store">Toko</TabsTrigger>
          <TabsTrigger value="tax">Pajak</TabsTrigger>
          <TabsTrigger value="receipt">Struk</TabsTrigger>
        </TabsList>
        
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Toko</CardTitle>
              <CardDescription>
                Pengaturan informasi toko yang akan ditampilkan pada struk dan laporan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">Nama Toko</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Alamat Toko</Label>
                <Input
                  id="storeAddress"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="storePhone">Nomor Telepon</Label>
                <Input
                  id="storePhone"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings('store')} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Menyimpan...
                    </span>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Pajak</CardTitle>
              <CardDescription>
                Konfigurasi pajak yang dikenakan pada transaksi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableTax">Aktifkan Pajak</Label>
                <Switch
                  id="enableTax"
                  checked={enableTax}
                  onCheckedChange={setEnableTax}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxPercentage">Persentase Pajak (%)</Label>
                <Input
                  id="taxPercentage"
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  disabled={!enableTax}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings('tax')} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Menyimpan...
                    </span>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Struk</CardTitle>
              <CardDescription>
                Konfigurasi tampilan dan informasi pada struk pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="showLogo">Tampilkan Logo</Label>
                <Switch
                  id="showLogo"
                  checked={showLogo}
                  onCheckedChange={setShowLogo}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showFooter">Tampilkan Footer</Label>
                <Switch
                  id="showFooter"
                  checked={showFooter}
                  onCheckedChange={setShowFooter}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="footerText">Teks Footer</Label>
                <Input
                  id="footerText"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  disabled={!showFooter}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="termsText">Teks Ketentuan</Label>
                <Input
                  id="termsText"
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  disabled={!showFooter}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings('receipt')} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Menyimpan...
                    </span>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;

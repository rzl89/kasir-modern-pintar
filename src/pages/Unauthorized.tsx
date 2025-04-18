
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon, ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-semibold text-neutral-800 mb-2">Akses Ditolak</h1>
        <p className="text-neutral-600 mb-6">
          Maaf, Anda tidak memiliki hak akses yang diperlukan untuk melihat halaman ini.
        </p>
        <Button asChild>
          <Link to="/dashboard">
            <HomeIcon className="mr-2 h-4 w-4" /> Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;

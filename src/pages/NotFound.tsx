
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-neutral-600 mb-6">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
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

export default NotFound;

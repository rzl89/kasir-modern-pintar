
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, userLoading } = useAuth();

  // Add analytics or logging if needed
  useEffect(() => {
    console.log("Index page visited");
  }, []);

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to dashboard if logged in, otherwise to login page
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

export default Index;

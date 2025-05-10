import { PageContainer } from "@/components/layout/PageContainer";
import { LoginForm } from "@/components/auth/LoginForm";
import { Helmet } from "react-helmet";

export default function LoginPage() {
  return (
    <PageContainer 
      title="Login" 
      description="Sign in to Cyber Wolf Chat - Secure, Private, Real-time messaging"
      className="flex items-center justify-center px-4"
    >
      <Helmet>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </Helmet>
      <LoginForm />
    </PageContainer>
  );
}

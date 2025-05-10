import { PageContainer } from "@/components/layout/PageContainer";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Helmet } from "react-helmet";

export default function RegisterPage() {
  return (
    <PageContainer 
      title="Register" 
      description="Create a new account on Cyber Wolf Chat - Secure, Private, Real-time messaging"
      className="flex items-center justify-center px-4"
    >
      <Helmet>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </Helmet>
      <RegisterForm />
    </PageContainer>
  );
}

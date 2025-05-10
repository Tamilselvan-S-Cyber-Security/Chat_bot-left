import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileSetup } from "@/components/profile/ProfileSetup";
import { Helmet } from "react-helmet";

export default function SetupProfilePage() {
  return (
    <PageContainer 
      title="Complete Profile" 
      description="Complete your profile setup for Cyber Wolf Chat"
      className="flex items-center justify-center px-4"
    >
      <Helmet>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </Helmet>
      <ProfileSetup />
    </PageContainer>
  );
}

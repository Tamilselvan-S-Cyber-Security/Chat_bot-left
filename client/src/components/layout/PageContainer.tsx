import { ReactNode } from 'react';
import { Helmet } from 'react-helmet';

interface PageContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ 
  title, 
  description = 'Cyber Wolf Chat - Secure, Private, Real-time messaging', 
  children, 
  className = '' 
}: PageContainerProps) {
  return (
    <>
      <Helmet>
        <title>{title} | Cyber Wolf Chat</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | Cyber Wolf Chat`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className={`min-h-screen ${className}`}>
        {children}
      </div>
    </>
  );
}

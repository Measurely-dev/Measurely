// Import necessary components and libraries
import Container from '@/components/website/container'; // Container component for layout structure
import Content from '@/components/website/content'; // Content component for managing content layout
import PolicyWrapper from '@/app/(website)/(policy)/policy-wrapper'; // Wrapper component for policy pages
import PrivacyContent from './privacy'; // Privacy-specific content component
import { Metadata } from 'next'; // Metadata type for Next.js page metadata
import Link from 'next/link'; // Next.js Link component for client-side navigation
import { Button } from '@/components/ui/button'; // Button component for UI interactions
import { ArrowLeftIcon } from 'lucide-react'; // Icon component for the back button

// Define metadata for the page (used for SEO and page headers)
export const metadata: Metadata = {
  title: 'Privacy Policy | Measurely', // Page title
  description:
    'Read Measurely’s Privacy Policy to understand how we collect, use, and protect your data. We are committed to ensuring the privacy and security of your information while providing you with the best experience using our platform.', // Page description
};

// Main page component
export default function Page() {
  return (
    // Use the Container component to wrap the page content
    <Container>
      {/* Use the Content component to structure the page content */}
      <Content type='page'>
        {/* Back button to navigate to the legal page */}
        <Link href='/legal' className='mb-5'>
          <Button
            variant={'secondary'} // Set button style to secondary
            className='group relative overflow-hidden rounded-[12px] transition-all duration-200' // Add styling and animations
          >
            {/* Arrow icon for the back button */}
            <ArrowLeftIcon className='absolute -left-5 size-4 transition-all duration-200 group-hover:left-3' />
            {/* Text for the back button */}
            <div className='transition-all duration-200 group-hover:ml-5'>
              Back to legal
            </div>
          </Button>
        </Link>

        {/* PolicyWrapper component to structure the privacy policy content */}
        <PolicyWrapper
          title='Privacy Policy' // Title of the policy
          updatedDate='December 25, 2024' // Last updated date
          terms={
            // List of terms and conditions for the privacy policy
            <>
              <li>
                Measurely uses external services like Google and GitHub for
                authentication purposes
              </li>
              <li>
                Cookies are only used for managing your login sessions and not
                for tracking or advertising
              </li>
              <li>
                We process monthly payments through third-party providers, and
                we do not store payment information
              </li>
              <li>
                Measurely uses your data exclusively within the platform to
                manage accounts, subscriptions, and provide services
              </li>
              <li>
                Subscription plans may evolve over time, including changes in
                features, pricing, or new plans
              </li>
              <li>
                We use industry-standard security measures to protect your
                personal data, but absolute security cannot be guaranteed
              </li>
              <li>
                This privacy policy applies only to Measurely’s online
                activities
              </li>
              <li>
                You consent to this policy by using Measurely, and we will
                notify you if it changes
              </li>
            </>
          }
        >
          {/* Render the PrivacyContent component for additional privacy details */}
          <PrivacyContent />
        </PolicyWrapper>
      </Content>
    </Container>
  );
}

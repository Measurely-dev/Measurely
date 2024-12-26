import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import PolicyWrapper from '@/components/website/policy';
import PrivacyContent from './privacy';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Measurely',
  description:
    'Read Measurely’s Privacy Policy to understand how we collect, use, and protect your data. We are committed to ensuring the privacy and security of your information while providing you with the best experience using our platform.',
};
export default function Page() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <PolicyWrapper
          title='Privacy Policy'
          updatedDate='December 25, 2024'
          terms={
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
          <PrivacyContent />
        </PolicyWrapper>
      </ContentContainer>
    </WebContainer>
  );
}

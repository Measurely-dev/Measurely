import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import PolicyWrapper from '@/components/website/policy';
import TermsContent from './terms';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of service | Measurely',
  description:
    'Read Measurely’s Privacy Policy to understand how we collect, use, and protect your data. We are committed to ensuring the privacy and security of your information while providing you with the best experience using our platform.',
};
export default function Page() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <PolicyWrapper
          title='Terms of Service'
          updatedDate='December 25, 2024'
          terms={
            <>
              <li>
                Measurely provides an API that allows users to programmatically
                update their metrics
              </li>
              <li>
                Users are responsible for the content they track, and must
                ensure it complies with applicable laws
              </li>
              <li>
                Accounts will be terminated if users track illegal activities,
                such as monitoring the performance of illegal markets
              </li>
              <li>
                Measurely is not responsible for data loss, service
                interruptions, or any disruptions to the service
              </li>
              <li>
                Measurely reserves the right to shut down the service at any
                time without liability
              </li>
              <li>
                By using the platform, you agree to these terms and acknowledge
                that they may be updated or amended periodically
              </li>
            </>
          }
        >
          <TermsContent />
        </PolicyWrapper>
      </ContentContainer>
    </WebContainer>
  );
}

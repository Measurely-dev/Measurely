import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import PolicyWrapper from '@/components/website/policy';
import TermsContent from './terms';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of service | Measurely',
  description:
    'Read Measurely’s Terms of Service to understand the rules, responsibilities, and guidelines for using our platform. We are dedicated to providing a secure and reliable service while ensuring a seamless experience for our users.',
};
export default function Page() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <Link href='/legal' className='mb-5'>
          <Button
            variant={'secondary'}
            className='group relative overflow-hidden rounded-[12px] transition-all duration-200'
          >
            <ArrowLeftIcon className='absolute -left-5 size-4 transition-all duration-200 group-hover:left-3' />
            <div className='transition-all duration-200 group-hover:ml-5'>
              Back to legal
            </div>
          </Button>
        </Link>
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

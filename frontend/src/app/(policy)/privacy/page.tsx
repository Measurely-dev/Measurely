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
          updatedDate='September 24, 2021'
          terms={
            <>
              <li>
                Measurely can communicate to other services on your behalf like
                GitHub
              </li>
              <li>You agree to not host any illegal content</li>
              <li>
                We are granted a license to use any contributions on our public
                repos
              </li>
              <li>You are responsible for what you host on Railway</li>
              <li>Railway is provided to you &quot;as-is&quot;</li>
              <li>We comply with copyright takedown requests</li>
              <li>We will try to notify you when these terms change</li>
            </>
          }
        >
          <PrivacyContent />
        </PolicyWrapper>
      </ContentContainer>
    </WebContainer>
  );
}

import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import PolicyWrapper from '@/components/website/policy';
import TermsContent from './terms';

export default function Page() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <PolicyWrapper
          title='Terms of Service'
          updatedDate='December 07, 2024'
          terms={
            <>
              <li>Be at least 13 years or older</li>
              <li>You agree to not host any illegal content</li>
              <li>
                We are granted a license to use any contributions on our public
                repos
              </li>
              <li>You are responsible for what you track on Measurely</li>
              <li>Measurely is provided to you &quot;as-is&quot;</li>
              <li>We comply with copyright takedown requests</li>
              <li>We will try to notify you when these terms change</li>
            </>
          }
        >
          <TermsContent />
        </PolicyWrapper>
      </ContentContainer>
    </WebContainer>
  );
}

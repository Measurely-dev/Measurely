import WebContainer from '@/components/website/container';
import ContentContainer from '@/components/website/content';
import StorySection from '@/components/website/sections/about/story';

export default function Pricing() {
  return (
    <WebContainer>
      <ContentContainer type='page'>
        <StorySection />
      </ContentContainer>
    </WebContainer>
  );
}

'use client';
import { useEffect, useState } from 'react';
import WebBentoBox from '../../components/bentoBox';
import WebBox from '../../components/box';
import WebFooterHeader from '../../components/footerHeader';
import WebTitle from '../../components/title';
import ContentContainer from '../../containers/content';

export default function BentoUiSection(props: {
  type: 'default' | 'waitlist';
}) {
  const [is_client, set_is_client] = useState(false);
  const [window_width, set_window_width] = useState(0);

  useEffect(() => {
    set_is_client(true);
  }, []);

  useEffect(() => {
    if (is_client) {
      const handleResize = () => {
        set_window_width(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      handleResize();

      return () => window.removeEventListener('resize', handleResize);
    }
  }, [is_client]);

  const bentoBoxType = is_client
    ? window_width > 768
      ? 'horizontal-left'
      : 'vertical'
    : 'horizontal-left';

  return (
    <div className='z-10 w-screen bg-secondaryColor pb-[150px] pt-[150px]'>
      <ContentContainer>
        <WebTitle
          subtitle='Team collaboration'
          title='Rediscover the joy in storytelling.'
        />
        <WebBentoBox
          type={bentoBoxType}
          className='mt-20'
          title='Controls in place to prevent errors'
          description='Acctual detects duplicate invoices, streamlines approvals, and saves wallet details. This ensures error-free payments and enhances control over the entire process.'
          img='https://framerusercontent.com/images/EMoV7R8WierVn1xbQmEoQCnqck.webp'
        />
        <div className='grid grid-cols-2 gap-5 max-md:grid-cols-1 max-md:grid-rows-2'>
          <WebBentoBox
            type='vertical'
            className='mt-5'
            title='Stay compliant and secure'
            description='Safely send payments—we protect you from high-risk wallet addresses.'
            img='https://framerusercontent.com/images/0YQX4OAyaQHdMGB0u9YlfxZAGTc.webp'
          />
          <WebBentoBox
            type='vertical'
            className='mt-5'
            title='Finally... accounts payable for crypto'
            description='It’s time we bring sophistication to the crypto AP process. Now, you’ll have visibility to take control and reduce risk.'
            img='https://framerusercontent.com/images/vhcnpRPJz0JgRfwEubCm4WWJC00.webp'
          />
        </div>
        <WebBentoBox
          type={bentoBoxType}
          className='mt-5'
          title='Seamlessly sync with your accounting stack'
          description='Automatically record and match bills with payments, sync contacts with your accounting system, while working alongside your crypto subledger. All on-chain payments are associated with an invoice.'
          img='https://framerusercontent.com/images/NSgMty5qHcNLTMQrQEZ8DPmMpYo.png'
        />
        <WebTitle
          subtitle='Invoices'
          className='mt-[145px]'
          title={`Start closer to the finish line with templates made by industry experts.`}
        />
        <div className='mt-[70px] grid grid-cols-3 gap-[10px] max-md:grid-cols-1'>
          <WebBox
            icon={''}
            title='Verified by experts'
            description='Templates created by the leading experts to help you deliver a powerful story'
          />
          <WebBox
            icon={''}
            title='Contextual guidance'
            description='Best practice guidance is baked into the template - without leaving Chronicle'
          />
          <WebBox
            icon={''}
            title='Templates for everything'
            description='Whether it’s all hands or pitch decks, start closer to the finish line with a template'
          />
        </div>
        <WebFooterHeader type={props.type} className='mt-[170px]' />
      </ContentContainer>
    </div>
  );
}

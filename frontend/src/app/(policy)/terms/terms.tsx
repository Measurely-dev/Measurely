import { Separator } from '@/components/ui/separator';

export default function TermsContent() {
  return (
    <>
      <h2>Terms of Service for Measurely</h2>
      <Separator className='my-5' />
      <br />
      <p>
        If you have any questions about our terms of service, please feel free
        to contact us by email at{' '}
        <span style={{ color: 'blue' }}>
          <a href='mailto:info@measurely.dev'>info@measurely.dev</a>
        </span>
      </p>
      <br />
      <p>
        These Terms of Service ("Terms") govern your access to and use of
        Measurely’s platform, including the website, API, and all services
        provided by Measurely ("the Service"). By using the Service, you agree
        to comply with these Terms.
      </p>
      <br />
      <br />
      <h3>1. Use of the Service</h3>
      <br />
      <p>
        Measurely provides a platform to help you create and track custom
        metrics for your business. You may use the Service to create an account,
        monitor your metrics, and utilize our API to update your metrics
        programmatically.
      </p>
      <br />
      <h3>2. User Responsibilities</h3>
      <br />
      <p>
        As a user of Measurely, you are solely responsible for the metrics you
        track and the data you input into the platform. You agree that you will
        not use the platform to track illegal activities or any content that
        violates laws or regulations. Measurely reserves the right to terminate
        your account if you are found to be engaging in illegal or harmful
        activities.
      </p>
      <br />
      <h3>3. Account Creation and Security</h3>
      <br />
      <p>
        To use Measurely, you must create an account. You may sign up using
        external authentication providers like Google or GitHub. You are
        responsible for maintaining the confidentiality of your login
        credentials and for all activities under your account. You agree to
        notify us immediately if you become aware of any unauthorized use of
        your account.
      </p>
      <br />
      <h3>4. Subscription and Payment</h3>
      <br />
      <p>
        Measurely operates on a monthly subscription basis. By subscribing, you
        agree to pay the monthly fees associated with your chosen subscription
        plan. Payments are processed through third-party payment providers, and
        Measurely does not store your payment details. Subscription fees are
        non-refundable, and we reserve the right to adjust the pricing of our
        subscription plans at any time. You will be notified of any changes in
        advance.
      </p>
      <br />
      <h3>5. API Usage</h3>
      <br />
      <p>
        Measurely offers an API that allows users to programmatically update and
        interact with their metrics. By using the API, you agree to abide by any
        rate limits, terms, and conditions specific to API usage. You are solely
        responsible for ensuring that your use of the API does not violate any
        applicable laws or terms of service.
      </p>
      <br />
      <h3>6. Data Security and Privacy</h3>
      <br />
      <p>
        We take reasonable measures to protect your data using industry-standard
        encryption and security practices. However, Measurely cannot guarantee
        absolute security, and you acknowledge that there are inherent risks
        associated with data transmission over the internet.
      </p>
      <br />
      <h3>7. Limitation of Liability</h3>
      <br />
      <p>
        Measurely is not responsible for any data loss, service interruptions,
        or disruptions to the platform. In no event will Measurely be liable for
        any indirect, incidental, special, or consequential damages arising out
        of or in connection with the use of the Service, even if Measurely has
        been advised of the possibility of such damages.
      </p>
      <br />
      <h3>8. Service Availability and Termination</h3>
      <br />
      <p>
        Measurely reserves the right to modify, suspend, or discontinue the
        Service at any time, with or without notice. We are not responsible for
        any loss or damage that may result from such modifications, suspensions,
        or discontinuations. You may terminate your account at any time, but
        Measurely may terminate your access to the Service if you violate these
        Terms or engage in any illegal or harmful activities.
      </p>
      <br />
      <h3>9. Changes to the Terms of Service</h3>
      <br />
      <p>
        Measurely reserves the right to modify these Terms at any time. Any
        changes to the Terms will be posted on this page, and the "Last Updated"
        date will be revised accordingly. By continuing to use the Service after
        such changes, you agree to the updated Terms. You will be notified of
        any material changes to these Terms. We encourage you to review these
        Terms regularly.
      </p>
      <br />
      <h3>10. Consent</h3>
      <br />
      <p>
        By using Measurely, you consent to these Terms of Service. If you do not
        agree with any part of these Terms, you must discontinue use of the
        Service.
      </p>
      <br />
      <h3>11. Governing Law</h3>
      <br />
      <p>
        These Terms are governed by and construed in accordance with the laws of
        the jurisdiction in which Measurely operates. Any disputes arising out
        of or in connection with these Terms shall be resolved in the competent
        courts of that jurisdiction.
      </p>
      <br />
      <h3>12. Contact Us</h3>
      <br />
      <p>
        If you have any questions or concerns about these Terms of Service,
        please contact us at{' '}
        <span style={{ color: 'blue' }}>
          <a href='mailto:info@measurely.dev'>info@measurely.dev</a>
        </span>
      </p>
      <br />
      <p>These Terms of Service were last updated on: December 25th, 2024.</p>
    </>
  );
}
